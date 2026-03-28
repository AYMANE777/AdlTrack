import { NextRequest, NextResponse } from 'next/server';
import { getStats, getMonthlyStats, getStatusDistribution, getWeeklyActivity } from '@/lib/seizures';

export async function GET(req: NextRequest) {
  try {
    const stats = await getStats();
    const monthlyStats = await getMonthlyStats();
    const statusDistribution = await getStatusDistribution();
    const weeklyActivity = await getWeeklyActivity();
    
    return NextResponse.json({
      stats,
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
          usersCount: 0,
          auditCount: 0,
          rehabTodayCount: 0,
          altTodayCount: 0,
        },
      monthlyStats: [],
      statusDistribution: [],
      weeklyActivity: [],
    });
  }
}
