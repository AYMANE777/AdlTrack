import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const seizure = await prisma.seizure.findUnique({
      where: { id },
      include: {
        createdBy: { select: { fullName: true } },
        updatedBy: { select: { fullName: true } }
      }
    });

    if (!seizure) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(seizure);
  } catch (error) {
    console.error('Error fetching seizure:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await req.json();
    
    // Get old data for audit log
    const oldSeizure = await prisma.seizure.findUnique({
      where: { id }
    });

    if (!oldSeizure) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updateData: any = {
      matchingNumber: body.matchingNumber,
      regularSeizures: body.regularSeizures,
      preciousSeizures: body.preciousSeizures,
      seizuresShape: body.seizuresShape,
      possessorInfo: body.possessorInfo,
      courtClerkNumber: body.courtClerkNumber,
        statePropertyListNumber: body.statePropertyListNumber,
        status: body.status,
        notes: body.notes,
        updatedById: body.updatedById ? parseInt(body.updatedById) : 1, // Default to admin for now
      };

    if (body.registrationDate) updateData.registrationDate = new Date(body.registrationDate);
    if (body.courtClerkDate) updateData.courtClerkDate = new Date(body.courtClerkDate);
    if (body.deliveryRightsHoldersDate) updateData.deliveryRightsHoldersDate = new Date(body.deliveryRightsHoldersDate);
    if (body.deliveryStatePropertyDate) updateData.deliveryStatePropertyDate = new Date(body.deliveryStatePropertyDate);
    if (body.statePropertyListDate) updateData.statePropertyListDate = new Date(body.statePropertyListDate);
    if (body.destructionMinutesDate) updateData.destructionMinutesDate = new Date(body.destructionMinutesDate);

    const updatedSeizure = await prisma.seizure.update({
      where: { id },
      data: updateData
    });

    // Create Audit Log
    await createAuditLog({
      tableName: 'seizure',
      recordId: id,
      action: 'UPDATE',
      oldData: oldSeizure,
      newData: updatedSeizure,
      performedById: updateData.updatedById,
    });

    return NextResponse.json(updatedSeizure);
  } catch (error) {
    console.error('Error updating seizure:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Get old data for audit log
    const oldSeizure = await prisma.seizure.findUnique({
      where: { id }
    });

    if (!oldSeizure) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // For DELETE, we might need a way to know who deleted it. 
    // Assuming admin for now or passed in query/headers.
    const deletedById = 1; 

    await prisma.seizure.delete({
      where: { id }
    });

    // Create Audit Log
    await createAuditLog({
      tableName: 'seizure',
      recordId: id,
      action: 'DELETE',
      oldData: oldSeizure,
      performedById: deletedById,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting seizure:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
