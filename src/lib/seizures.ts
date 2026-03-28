import prisma from "@/lib/prisma";
import { cache } from "react";

export const getStats = cache(async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rehabCount = await prisma.rehabilitationRequest.count();
    const altPenaltyCount = await prisma.alternativePenalty.count();
    const usersCount = await prisma.user.count();
    const auditCount = await prisma.auditLog.count();

    const rehabTodayCount = await prisma.rehabilitationRequest.count({
      where: { createdAt: { gte: today } },
    });

    const altTodayCount = await prisma.alternativePenalty.count({
      where: { createdAt: { gte: today } },
    });

    return {
      rehabCount,
      altPenaltyCount,
      usersCount,
      auditCount,
      rehabTodayCount,
      altTodayCount,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      rehabCount: 0,
      altPenaltyCount: 0,
      usersCount: 0,
      auditCount: 0,
      rehabTodayCount: 0,
      altTodayCount: 0,
    };
  }
});

export const getMonthlyStats = cache(async () => {
  try {
    const currentYear = new Date().getFullYear();
    const months = [];
    
    for (let i = 0; i < 12; i++) {
      const startDate = new Date(currentYear, i, 1);
      const endDate = new Date(currentYear, i + 1, 0, 23, 59, 59);
      
      const rehabCount = await prisma.rehabilitationRequest.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      });
        const altCount = await prisma.alternativePenalty.count({
          where: {
            createdAt: { gte: startDate, lte: endDate },
          },
        });

      months.push({
        month: startDate.toLocaleDateString('ar-MA', { month: 'short' }),
        monthIndex: i,
        rehabilitation: rehabCount,
        penalties: altCount,
      });
    }

    return months;
  } catch (error) {
    console.error("Error fetching monthly stats:", error);
    return [];
  }
});

export const getStatusDistribution = cache(async () => {
  try {
    // For Rehabilitation Requests
    const rehabStats = await prisma.rehabilitationRequest.groupBy({
      by: ['request_status'],
      _count: { id: true },
    });

    const colors = ["#3C50E0", "#10B981", "#F59E0B", "#FB5454", "#8B5CF6"];
    
    return rehabStats.map((stat, index) => ({
      name: stat.request_status,
      value: stat._count.id,
      color: colors[index % colors.length],
    }));
  } catch (error) {
    console.error("Error fetching status distribution:", error);
    return [];
  }
});

export const getWeeklyActivity = cache(async () => {
  try {
    const today = new Date();
    const days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const rehabCount = await prisma.rehabilitationRequest.count({
        where: {
          createdAt: { gte: date, lt: nextDay },
        },
      });

        const altCount = await prisma.alternativePenalty.count({
          where: {
            createdAt: { gte: date, lt: nextDay },
          },
        });

      days.push({
        day: date.toLocaleDateString('ar-MA', { weekday: 'short' }),
        date: date.toLocaleDateString('ar-MA', { day: 'numeric', month: 'short' }),
        count: rehabCount + altCount,
      });
    }

    return days;
  } catch (error) {
      console.error("Error fetching weekly activity:", error);
      return [];
    }
  });

export async function exportSeizures({
  dateStart,
  dateEnd,
  ordinalStart,
  ordinalEnd,
}: {
  dateStart?: string;
  dateEnd?: string;
  ordinalStart?: number;
  ordinalEnd?: number;
}) {
  const where: any = {};

  if (dateStart || dateEnd) {
    where.registrationDate = {};
    if (dateStart) where.registrationDate.gte = new Date(dateStart);
    if (dateEnd) where.registrationDate.lte = new Date(dateEnd);
  }

  if (ordinalStart !== undefined || ordinalEnd !== undefined) {
    where.ordinalNumber = {};
    if (ordinalStart !== undefined) where.ordinalNumber.gte = ordinalStart;
    if (ordinalEnd !== undefined) where.ordinalNumber.lte = ordinalEnd;
  }

  return prisma.seizure.findMany({
    where,
    orderBy: { ordinalNumber: 'asc' },
    include: {
      createdBy: { select: { fullName: true } },
    },
  });
}
