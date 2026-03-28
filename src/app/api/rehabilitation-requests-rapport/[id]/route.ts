import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const rapport = await prisma.rehabilitationRequestRapport.findUnique({
      where: { id },
    });

    if (!rapport) {
      return NextResponse.json({ error: 'Rapport not found' }, { status: 404 });
    }

    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();

    const oldRapport = await prisma.rehabilitationRequestRapport.findUnique({ where: { id } });
    if (!oldRapport) {
      return NextResponse.json({ error: 'Rapport not found' }, { status: 404 });
    }

    const updatedById = body.updatedById ? parseInt(body.updatedById) : 1;

      const rapport = await prisma.rehabilitationRequestRapport.update({
        where: { id },
        data: {
          rehabilitationRequestId: body.rehabilitationRequestId ? parseInt(body.rehabilitationRequestId) : undefined,
          num_dossier: body.num_dossier,
          FullName: body.FullName,
        fils_de_pere: body.fils_de_pere,
        fils_de_mere: body.fils_de_mere,
        date_naissance: body.date_naissance ? new Date(body.date_naissance) : undefined,
        adresse: body.adresse || null,
        date_de_faire: body.date_de_faire ? new Date(body.date_de_faire) : undefined,
        tribunal: body.tribunal,
        ville: body.ville,
        status: body.status,
        autre_condition: body.autre_condition || null,
        date: body.date ? new Date(body.date) : undefined,
        updatedById: updatedById,
      },
    });

    await createAuditLog({
      tableName: 'rehabilitation_requests_rapport',
      recordId: rapport.id,
      action: 'UPDATE',
      oldData: oldRapport,
      newData: rapport,
      performedById: updatedById,
    });

    return NextResponse.json(rapport);
  } catch (error) {
    console.error('Error updating rehabilitation request rapport:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const oldRapport = await prisma.rehabilitationRequestRapport.findUnique({ where: { id } });

    await prisma.rehabilitationRequestRapport.delete({ where: { id } });

    const performedById = 1;
    await createAuditLog({
      tableName: 'rehabilitation_requests_rapport',
      recordId: id,
      action: 'DELETE',
      oldData: oldRapport,
      performedById: performedById,
    });

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
