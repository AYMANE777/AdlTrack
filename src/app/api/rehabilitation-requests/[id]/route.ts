import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';


export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const request = await prisma.rehabilitationRequest.findUnique({
      where: { id },
      include: {
        createdBy: { select: { fullName: true } },
        updatedBy: { select: { fullName: true } },
      },
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json(request);
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
    
    const oldRequest = await prisma.rehabilitationRequest.findUnique({ where: { id } });
    if (!oldRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const updatedById = body.updatedById ? parseInt(body.updatedById) : 1;

    const request = await prisma.rehabilitationRequest.update({
      where: { id },
      data: {
        FullName: body.FullName,
        cin: body.cin,
        request_date: body.request_date ? new Date(body.request_date) : undefined,
        prosecution_inquiry_date: body.prosecution_inquiry_date ? new Date(body.prosecution_inquiry_date) : null,
        prosecution_opinion: body.prosecution_opinion,
        request_status: body.request_status,
        updatedById: updatedById,
      },
    });

    await createAuditLog({
      tableName: 'rehabilitation_requests',
      recordId: request.id,
      action: 'UPDATE',
      oldData: oldRequest,
      newData: request,
      performedById: updatedById,
    });

    return NextResponse.json(request);
  } catch (error) {
    console.error('Error updating rehabilitation request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const oldRequest = await prisma.rehabilitationRequest.findUnique({ where: { id } });
    
    await prisma.rehabilitationRequest.delete({ where: { id } });

    const performedById = 1; // Default
    await createAuditLog({
      tableName: 'rehabilitation_requests',
      recordId: id,
      action: 'DELETE',
      oldData: oldRequest,
      performedById: performedById,
    });

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
