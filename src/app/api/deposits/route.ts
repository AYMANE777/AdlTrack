import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import { createNotificationForAllUsers } from '@/lib/notifications';


export async function GET(req: NextRequest) {
  try {
    const deposits = await prisma.depot.findMany({
      include: {
        seizure: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(deposits);
  } catch (error) {
    console.error('Error fetching deposits:', error);
    return NextResponse.json({ error: 'Failed to fetch deposits' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const { 
      seizureId, 
      depositNumber, 
      depositMontant, 
      depositDescription, 
      depositedBy,
      performedById 
    } = body;

    if (!seizureId || !depositNumber || depositMontant === undefined || !depositedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use a transaction to create deposit and update seizure status
    const deposit = await prisma.$transaction(async (tx) => {
      // 1. Check if seizure already has a deposit (optional but good for UX error)
      const existingDepot = await tx.depot.findFirst({
        where: { seizureId: parseInt(seizureId) }
      });

      if (existingDepot) {
        throw new Error('This seizure already has a deposit');
      }

        // 2. Create the deposit
        const newDeposit = await tx.depot.create({
          data: {
            seizureId: parseInt(seizureId),
            depositNumber,
            depositMontant: parseFloat(depositMontant),
            depositDescription,
            depositedBy,
            createdById: performedById ? parseInt(performedById.toString()) : null,
          },
        });

      // 3. Update seizure status to 'FINI'
      const updatedSeizure = await tx.seizure.update({
        where: { id: parseInt(seizureId.toString()) },
        data: { status: 'FINI' as any },
      });

      return { newDeposit, updatedSeizure };
    });

    // Create Audit Log for Deposit
    await createAuditLog({
      tableName: 'depot',
      recordId: deposit.newDeposit.id,
      action: 'CREATE',
      newData: deposit.newDeposit,
      performedById: performedById ? parseInt(performedById.toString()) : 1,
    });

    // Create Audit Log for Seizure Status Change
    await createAuditLog({
      tableName: 'seizure',
      recordId: parseInt(seizureId.toString()),
      action: 'UPDATE',
      newData: { status: 'FINI' },
      performedById: performedById ? parseInt(performedById.toString()) : 1,
    });

    // Create notifications for all users
    await createNotificationForAllUsers({
      type: 'NEW_DEPOSIT',
      title: 'إيداع جديد',
      message: `تم إضافة إيداع جديد برقم ${depositNumber}`,
      entityType: 'DEPOT',
      entityId: deposit.newDeposit.id,
    });

    return NextResponse.json(deposit.newDeposit);
  } catch (error) {
    console.error('Error creating deposit:', error);
    return NextResponse.json({ error: 'Failed to save deposit' }, { status: 500 });
  }
}
