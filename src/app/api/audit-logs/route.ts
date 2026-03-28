import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const action = searchParams.get('action');
    const tableName = searchParams.get('tableName');
    const recordId = searchParams.get('recordId');

    const where: any = {};
    if (action) where.action = action;
    if (tableName) where.tableName = tableName;
    if (recordId) where.recordId = parseInt(recordId);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          performedBy: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { performedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ]);

    // Enhanced logs with field-level diffs (computed on-the-fly or in UI)
    const enhancedLogs = logs.map(log => {
      let oldData = null;
      let newData = null;
      try { oldData = log.oldData ? JSON.parse(log.oldData) : null; } catch (e) { }
      try { newData = log.newData ? JSON.parse(log.newData) : null; } catch (e) { }

      const diff: Record<string, { old: any, new: any }> = {};

      if (log.action === 'UPDATE' && oldData && newData) {
        Object.keys(newData).forEach(key => {
          // Ignore automatic timestamp updates mapping
          if (key === 'updatedAt' || key === 'updatedById' || key === 'id') return;

          if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
            diff[key] = {
              old: oldData[key],
              new: newData[key]
            };
          }
        });
      }

      return {
        ...log,
        oldData,
        newData,
        performedBy: log.performedBy,
        diff: Object.keys(diff).length > 0 ? diff : null
      };
    });


    return NextResponse.json({
      logs: enhancedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
