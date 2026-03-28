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
        { num_dossier: { contains: search } },
        { ville: { contains: search } },
        { tribunal: { contains: search } },
      ];
    }

    const [rapports, total] = await Promise.all([
      prisma.rehabilitationRequestRapport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { ordinalNumber: 'desc' },
      }),
      prisma.rehabilitationRequestRapport.count({ where })
    ]);

    return NextResponse.json({
      data: rapports,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching rehabilitation requests rapport:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dateValue = new Date(body.date);
    const currentYear = dateValue.getFullYear();

    const lastRapport = await prisma.rehabilitationRequestRapport.findFirst({
      where: { year: currentYear },
      orderBy: { ordinalNumber: 'desc' },
    });

    const nextOrdinal = (lastRapport?.ordinalNumber || 0) + 1;
    const ordinalFull = `${nextOrdinal}/${currentYear}`;

    const createdById = body.createdById ? parseInt(body.createdById) : 1;

      const rapport = await prisma.rehabilitationRequestRapport.create({
        data: {
          ordinalNumber: nextOrdinal,
          year: currentYear,
          ordinalFull: ordinalFull,
          rehabilitationRequestId: parseInt(body.rehabilitationRequestId),
          num_dossier: body.num_dossier,
          FullName: body.FullName,
          fils_de_pere: body.fils_de_pere,
          fils_de_mere: body.fils_de_mere,
          date_naissance: new Date(body.date_naissance),
          adresse: body.adresse || null,
          date_de_faire: new Date(body.date_de_faire),
          tribunal: body.tribunal,
          ville: body.ville,
          status: body.status || 'PENDING',
          autre_condition: body.autre_condition || null,
          date: dateValue,
          createdById: createdById,
        },
      });

    await createAuditLog({
      tableName: 'rehabilitation_requests_rapport',
      recordId: rapport.id,
      action: 'CREATE',
      newData: rapport,
      performedById: createdById,
    });

    return NextResponse.json(rapport);
  } catch (error) {
    console.error('Error creating rehabilitation request rapport:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
