import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';


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
    const { accountNumber, performedById, role } = body;

    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can edit account number' }, { status: 403 });
    }

    if (!accountNumber) {
      return NextResponse.json({ error: 'Account number is required' }, { status: 400 });
    }

    // Get old data for audit log
    const oldRecord = await prisma.privateDepoAcc.findUnique({
      where: { id }
    });

    if (!oldRecord) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const updatedRecord = await prisma.privateDepoAcc.update({
      where: { id },
      data: {
        accountNumber: String(accountNumber)
      }
    });

    // Create Audit Log
    await createAuditLog({
      tableName: 'PrivateDepoAcc',
      recordId: id,
      action: 'UPDATE',
      oldData: oldRecord,
      newData: updatedRecord,
      performedById: parseInt(performedById) || 1,
    });

    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error('Error updating private depo account:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
