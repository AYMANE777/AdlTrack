import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';


export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    
    const { 
      depositNumber, 
      depositMontant, 
      depositDescription, 
      depositedBy,
      performedById 
    } = body;

    if (!id || !performedById) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch existing record for audit log
    const existingDeposit = await prisma.depot.findUnique({
      where: { id },
    });

    if (!existingDeposit) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    }

    // Update the deposit
    const updatedDeposit = await prisma.depot.update({
      where: { id },
      data: {
        depositNumber: depositNumber !== undefined ? depositNumber : undefined,
        depositMontant: depositMontant !== undefined ? parseFloat(depositMontant.toString()) : undefined,
        depositDescription: depositDescription !== undefined ? depositDescription : undefined,
        depositedBy: depositedBy !== undefined ? depositedBy : undefined,
      },
    });

    // Create Audit Log
    await createAuditLog({
      tableName: 'depot',
      recordId: id,
      action: 'UPDATE',
      oldData: existingDeposit,
      newData: updatedDeposit,
      performedById: parseInt(performedById.toString()),
    });

    return NextResponse.json(updatedDeposit);
  } catch (error) {
    console.error('Error updating deposit:', error);
    return NextResponse.json({ error: 'Failed to update deposit' }, { status: 500 });
  }
}
