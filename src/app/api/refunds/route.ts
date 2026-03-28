import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createNotificationForAllUsers } from '@/lib/notifications';

export async function GET() {
  try {
    const refunds = await prisma.refund.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        seizure: {
          select: {
            ordinalFull: true,
            possessorInfo: true,
            registrationDate: true,
          }
        }
      }
    });

    return NextResponse.json({ data: refunds });
  } catch (error) {
    console.error('Error fetching refunds:', error);
    return NextResponse.json({ error: 'Failed to fetch refunds' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const refund = await prisma.refund.create({
      data: {
        seizureId: parseInt(body.seizureId),
        refundType: body.refundType,
        refundRapportType: body.refundRapportType,
        printUser: body.printUser,
      },
      include: {
        seizure: {
          select: {
            ordinalFull: true,
            possessorInfo: true,
            registrationDate: true,
          }
        }
      }
    });

    // Create notifications for all users
    await createNotificationForAllUsers({
      type: 'NEW_REFUND',
      title: 'استرداد جديد',
      message: `تم إضافة استرداد جديد للمحجوز ${refund.seizure?.ordinalFull || ''}`,
      entityType: 'REFUND',
      entityId: refund.id,
    });

    return NextResponse.json(refund);
  } catch (error) {
    console.error('Error creating refund:', error);
    return NextResponse.json({ error: 'Failed to create refund' }, { status: 500 });
  }
}
