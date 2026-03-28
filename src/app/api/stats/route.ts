import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Calculate 6 months ago for monthly stats
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // Calculate 7 days ago for weekly stats
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Fetch all counts in parallel
      const [
        rehabCount,
        altPenaltyCount,
        rapportCount,
        usersCount,
        auditCount,
        rehabTodayCount,
        altTodayCount,
        rapportTodayCount,
        rehabRecent,
        penaltyRecent,
        rehabByStatus,
      ] = await Promise.all([
          prisma.rehabilitationRequest.count(),
          prisma.alternativePenalty.count(),
          prisma.rehabilitationRequestRapport.count(),
          prisma.user.count(),
          prisma.auditLog.count(),
          prisma.rehabilitationRequest.count({
            where: {
              createdAt: { gte: today, lt: tomorrow }
            }
          }),
          prisma.alternativePenalty.count({
            where: {
              createdAt: { gte: today, lt: tomorrow }
            }
          }),
          prisma.rehabilitationRequestRapport.count({
            where: {
              createdAt: { gte: today, lt: tomorrow }
            }
          }),
        // Only fetch records from last 6 months instead of ALL records
        prisma.rehabilitationRequest.findMany({
          where: { createdAt: { gte: sixMonthsAgo } },
          select: { createdAt: true },
        }),
        prisma.alternativePenalty.findMany({
          where: { createdAt: { gte: sixMonthsAgo } },
          select: { createdAt: true },
        }),
        prisma.rehabilitationRequest.groupBy({
          by: ['request_status'],
          _count: true,
        }),
    ]);

    // Process monthly stats (last 6 months)
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const currentMonth = new Date().getMonth();
    
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = currentMonth - i < 0 ? new Date().getFullYear() - 1 : new Date().getFullYear();
      
      const rehabForMonth = rehabRecent.filter(r => {
        const date = new Date(r.createdAt);
        return date.getMonth() === monthIndex && date.getFullYear() === year;
      }).length;
      
      const penaltyForMonth = penaltyRecent.filter(p => {
        const date = new Date(p.createdAt);
        return date.getMonth() === monthIndex && date.getFullYear() === year;
      }).length;
      
      monthlyStats.push({
        month: months[monthIndex],
        monthIndex,
        rehabilitation: rehabForMonth,
        penalties: penaltyForMonth,
      });
    }

    // Process status distribution
    const statusMap: Record<string, string> = {
      'PENDING': 'قيد الانتظار',
      'APPROVED': 'مقبول',
      'REJECTED': 'مرفوض',
      'IN_PROGRESS': 'قيد المعالجة',
    };
    
    const statusColors: Record<string, string> = {
      'PENDING': '#F59E0B',
      'APPROVED': '#10B981',
      'REJECTED': '#EF4444',
      'IN_PROGRESS': '#3C50E0',
    };

    const statusDistribution = rehabByStatus.map(s => ({
      name: statusMap[s.request_status] || s.request_status,
      value: s._count,
      color: statusColors[s.request_status] || '#8A99AF',
    }));

    // Weekly activity (last 7 days) - use already-fetched recent data
    const weekDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const weeklyActivity = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayCount = rehabRecent.filter(r => {
        const rDate = new Date(r.createdAt);
        return rDate >= date && rDate < nextDate;
      }).length + penaltyRecent.filter(p => {
        const pDate = new Date(p.createdAt);
        return pDate >= date && pDate < nextDate;
      }).length;
      
      weeklyActivity.push({
        day: weekDays[date.getDay()],
        date: date.toISOString().split('T')[0],
        count: dayCount,
      });
    }

    return NextResponse.json({
        stats: {
          rehabCount,
          altPenaltyCount,
          rapportCount,
          usersCount,
          auditCount,
          rehabTodayCount,
          altTodayCount,
          rapportTodayCount,
        },
      monthlyStats,
      statusDistribution,
      weeklyActivity,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ 
        stats: {
          rehabCount: 0,
          altPenaltyCount: 0,
          rapportCount: 0,
          usersCount: 0,
          auditCount: 0,
          rehabTodayCount: 0,
          altTodayCount: 0,
          rapportTodayCount: 0,
        },
      monthlyStats: [],
      statusDistribution: [],
      weeklyActivity: [],
    });
  }
}
