import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import { createNotificationForAllUsers } from '@/lib/notifications';


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const date = searchParams.get('date') || '';
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { ordinalFull: { contains: search } },
        { possessorInfo: { contains: search } },
        { matchingNumber: { contains: search } },
        { regularSeizures: { contains: search } },
        { preciousSeizures: { contains: search } },
      ];
    }

    if (date) {
      const searchDate = new Date(date);
      if (!isNaN(searchDate.getTime())) {
        const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
        
        where.registrationDate = {
          gte: startOfDay,
          lte: endOfDay,
        };
      }
    }

    const [seizures, total] = await Promise.all([
      prisma.seizure.findMany({
        where,
        skip,
        take: limit,
        orderBy: { ordinalNumber: 'desc' },
        include: {
          createdBy: {
            select: { fullName: true }
          }
        }
      }),
      prisma.seizure.count({ where })
    ]);

    return NextResponse.json({
      data: seizures,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching seizures:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const registrationDate = new Date(body.registrationDate);
    const currentYear = registrationDate.getFullYear();

    // Generate ordinal number automatically
    // Find the latest ordinal number for the registration year
    const lastSeizure = await prisma.seizure.findFirst({
      where: { year: currentYear },
      orderBy: { ordinalNumber: 'desc' },
    });

    const nextOrdinal = (lastSeizure?.ordinalNumber || 0) + 1;
    const ordinalFull = `${nextOrdinal}/${currentYear}`;

    // Get createdBy from body or session (simplified for now)
    const createdById = body.createdById ? parseInt(body.createdById) : 1; // Default to admin for now

    const seizure = await prisma.seizure.create({
        data: {
          ordinalNumber: nextOrdinal,
          year: currentYear,
          ordinalFull: ordinalFull,
          registrationDate: registrationDate,
          matchingNumber: body.matchingNumber,
          regularSeizures: body.regularSeizures,
          preciousSeizures: body.preciousSeizures,
          seizuresShape: body.seizuresShape,
            possessorInfo: body.possessorInfo,
            argent: body.argent ? parseFloat(body.argent) : null,
            courtClerkDate: body.courtClerkDate ? new Date(body.courtClerkDate) : null,
          courtClerkNumber: body.courtClerkNumber,
          deliveryRightsHoldersDate: body.deliveryToRightsHoldersDate ? new Date(body.deliveryToRightsHoldersDate) : null,
          deliveryStatePropertyDate: body.deliveryToStatePropertyDate ? new Date(body.deliveryToStatePropertyDate) : null,
          statePropertyListNumber: body.statePropertyListNumber,
            statePropertyListDate: body.statePropertyListDate ? new Date(body.statePropertyListDate) : null,
            destructionMinutesDate: body.destructionMinutesDate ? new Date(body.destructionMinutesDate) : null,
            status: body.status || 'EN_COURS',
            notes: body.notes,
            createdById: createdById,
        },
    });

    // Create Audit Log
    await createAuditLog({
      tableName: 'seizure',
      recordId: seizure.id,
      action: 'CREATE',
      newData: seizure,
      performedById: createdById,
    });

    // Create notifications for all users
    await createNotificationForAllUsers({
      type: 'NEW_SEIZURE',
      title: 'محجوز جديد',
      message: `تم إضافة محجوز جديد برقم ${ordinalFull}`,
      entityType: 'SEIZURE',
      entityId: seizure.id,
    });

    return NextResponse.json(seizure);
  } catch (error) {
    console.error('Error creating seizure:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
