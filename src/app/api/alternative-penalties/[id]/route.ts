import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const penalty = await prisma.alternativePenalty.findUnique({
      where: { id },
      include: {
        createdBy: { select: { fullName: true } },
        updatedBy: { select: { fullName: true } },
      },
    });

    if (!penalty) {
      return NextResponse.json({ error: 'Penalty not found' }, { status: 404 });
    }

    return NextResponse.json(penalty);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await req.json();
    
    const oldPenalty = await prisma.alternativePenalty.findUnique({ where: { id } });
    if (!oldPenalty) {
      return NextResponse.json({ error: 'Penalty not found' }, { status: 404 });
    }

    const updatedById = body.updatedById ? parseInt(body.updatedById) : 1;

    const penalty = await prisma.alternativePenalty.update({
      where: { id },
      data: {
        full_name: body.full_name,
        national_id: body.national_id,
        address_contact: body.address_contact,
        source_court: body.source_court,
        case_number: body.case_number,
        judgment_number: body.judgment_number,
        judgment_date: body.judgment_date ? new Date(body.judgment_date) : null,
        crime_type: body.crime_type,
        original_penalty_type: body.original_penalty_type,
        original_penalty_duration: body.original_penalty_duration,
        alternative_penalty_type: body.alternative_penalty_type,
        alternative_penalty_details: body.alternative_penalty_details,
        supervising_institution: body.supervising_institution,
        prosecution_referral_date: body.prosecution_referral_date ? new Date(body.prosecution_referral_date) : null,
        execution_decision_number: body.execution_decision_number,
        execution_decision_date: body.execution_decision_date ? new Date(body.execution_decision_date) : null,
        execution_decision_content: body.execution_decision_content,
        followup_orders: body.followup_orders,
        report_received_date: body.report_received_date ? new Date(body.report_received_date) : null,
        responsible_authority: body.responsible_authority,
        compliance_notes: body.compliance_notes,
        appellant_identity: body.appellant_identity,
        dispute_date: body.dispute_date ? new Date(body.dispute_date) : null,
        dispute_subject: body.dispute_subject,
        dispute_outcome: body.dispute_outcome,
        final_decision_date: body.final_decision_date ? new Date(body.final_decision_date) : null,
        appeal_deadline: body.appeal_deadline ? new Date(body.appeal_deadline) : null,
        notification_date: body.notification_date ? new Date(body.notification_date) : null,
        judge_notes: body.judge_notes,
        updatedById: updatedById,
      },
    });

    await createAuditLog({
      tableName: 'alternative_penalties_registry',
      recordId: penalty.id,
      action: 'UPDATE',
      oldData: oldPenalty,
      newData: penalty,
      performedById: updatedById,
    });

    return NextResponse.json(penalty);
  } catch (error) {
    console.error('Error updating alternative penalty:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const oldPenalty = await prisma.alternativePenalty.findUnique({ where: { id } });
    
    await prisma.alternativePenalty.delete({ where: { id } });

    const performedById = 1; // Default
    await createAuditLog({
      tableName: 'alternative_penalties_registry',
      recordId: id,
      action: 'DELETE',
      oldData: oldPenalty,
      performedById: performedById,
    });

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
