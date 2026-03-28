import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';


export async function GET(req: NextRequest) {
  try {
    const seizures = await prisma.seizure.findMany({
        where: {
          status: 'EN_COURS' as any,
          deposit: null
        },
        orderBy: { registrationDate: 'desc' },
      select: {
        id: true,
        ordinalFull: true,
        registrationDate: true,
        matchingNumber: true,
        possessorInfo: true,
      }
    });

    return NextResponse.json(seizures);
  } catch (error) {
    console.error('Error fetching en-cours seizures:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
