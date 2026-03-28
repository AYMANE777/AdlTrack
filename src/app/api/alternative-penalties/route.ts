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
        { full_name: { contains: search } },
        { national_id: { contains: search } },
        { judgment_number: { contains: search } },
      ];
    }

    const [penalties, total] = await Promise.all([
        prisma.alternativePenalty.findMany({
          where,
          skip,
          take: limit,
          orderBy: [
            { year: 'desc' },
            { serial_number: 'desc' }
          ],
          include: {
            createdBy: { select: { fullName: true } }
          }
        }),
        prisma.alternativePenalty.count({ where })
      ]);

    return NextResponse.json({
      data: penalties,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching alternative penalties:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const currentYear = new Date().getFullYear();
    
    // Find the last penalty for the current year
    const lastPenaltyThisYear = await prisma.alternativePenalty.findFirst({
      where: { year: currentYear },
      orderBy: { serial_number: 'desc' },
    });

    // Reset serial number to 1 for new year, or increment for same year
    const nextSerial = lastPenaltyThisYear ? lastPenaltyThisYear.serial_number + 1 : 1;
    const ordinalFull = `${nextSerial}/${currentYear}`;
    const createdById = body.createdById ? parseInt(body.createdById) : 1;

    const penalty = await prisma.alternativePenalty.create({
      data: {
        serial_number: nextSerial,
        year: currentYear,
        ordinal_full: ordinalFull,
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
        createdById: createdById,
      },
    });

    await createAuditLog({
      tableName: 'alternative_penalties_registry',
      recordId: penalty.id,
      action: 'CREATE',
      newData: penalty,
      performedById: createdById,
    });

    return NextResponse.json(penalty);
  } catch (error) {
    console.error('Error creating alternative penalty:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
