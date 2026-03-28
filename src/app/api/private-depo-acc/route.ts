import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const where: { month?: number; year?: number } = {};
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);

    const records = await prisma.privateDepoAcc.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching private depo accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const { 
      accountNumber, 
      month, 
      year, 
      totalAmount, 
      depositsCount,
      printedBy,
      notes 
    } = body;

    console.log('Received data:', { accountNumber, month, year, totalAmount, depositsCount });

    if (!accountNumber || month === undefined || month === '' || year === undefined || year === '') {
      return NextResponse.json({ error: 'Missing required fields', received: { accountNumber, month, year } }, { status: 400 });
    }

    const record = await prisma.privateDepoAcc.create({
      data: {
        accountNumber: String(accountNumber),
        month: parseInt(String(month)),
        year: parseInt(String(year)),
        totalAmount: parseFloat(String(totalAmount)) || 0,
        depositsCount: parseInt(String(depositsCount)) || 0,
        printedBy: printedBy || null,
        notes: notes || null,
      },
    });

    console.log('Created record:', record);
    return NextResponse.json(record);
  } catch (error) {
    console.error('Error creating private depo account:', error);
    return NextResponse.json({ error: 'Failed to save record', details: String(error) }, { status: 500 });
  }
}
