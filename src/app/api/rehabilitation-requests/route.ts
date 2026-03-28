import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { ordinalFull: { contains: search } },
        { FullName: { contains: search } },
        { cin: { contains: search } },
      ];
    }

      const [requests, total] = await Promise.all([
        prisma.rehabilitationRequest.findMany({
          where,
          skip,
          take: limit,
          orderBy: { ordinalNumber: 'desc' },
        }),
        prisma.rehabilitationRequest.count({ where })
      ]);

    return NextResponse.json({
      data: requests,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching rehabilitation requests:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const requestDate = new Date(body.request_date);
    const currentYear = requestDate.getFullYear();

    const lastRequest = await prisma.rehabilitationRequest.findFirst({
      where: { year: currentYear },
      orderBy: { ordinalNumber: 'desc' },
    });

    const nextOrdinal = (lastRequest?.ordinalNumber || 0) + 1;
    const ordinalFull = `${nextOrdinal}/${currentYear}`;

    const createdById = body.createdById ? parseInt(body.createdById) : 1;

    const request = await prisma.rehabilitationRequest.create({
      data: {
        ordinalNumber: nextOrdinal,
        year: currentYear,
        ordinalFull: ordinalFull,
        FullName: body.FullName,
        cin: body.cin,
        request_date: requestDate,
        prosecution_inquiry_date: body.prosecution_inquiry_date ? new Date(body.prosecution_inquiry_date) : null,
        prosecution_opinion: body.prosecution_opinion,
        request_status: body.request_status || 'PENDING',
        createdById: createdById,
      },
    });

    await createAuditLog({
      tableName: 'rehabilitation_requests',
      recordId: request.id,
      action: 'CREATE',
      newData: request,
      performedById: createdById,
    });

    return NextResponse.json(request);
  } catch (error) {
    console.error('Error creating rehabilitation request:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
