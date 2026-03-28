import { NextRequest, NextResponse } from 'next/server';
import { exportSeizures } from '@/lib/seizures';
import { format } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStart = searchParams.get('dateStart') || undefined;
    const dateEnd = searchParams.get('dateEnd') || undefined;
    const ordinalStart = searchParams.get('ordinalStart') ? parseInt(searchParams.get('ordinalStart')!) : undefined;
    const ordinalEnd = searchParams.get('ordinalEnd') ? parseInt(searchParams.get('ordinalEnd')!) : undefined;

    const data = await exportSeizures({
      dateStart,
      dateEnd,
      ordinalStart,
      ordinalEnd,
    });

    // Define CSV headers
    const headers = [
      "الرقم الترتيبي",
      "تاريخ التسجيل",
      "الرقم الموافق",
      "اسم الحائز",
      "المحجوزات العادية",
      "المحجوزات الثمينة",
      "شكل المحجوزات",
      "رقم كتابة الضبط",
      "تاريخ كتابة الضبط",
      "الحالة",
      "تم الإنشاء بواسطة"
    ];

    // Map data to rows
    const rows = data.map(item => {
      const escape = (val: any, forceText = false) => {
        const str = String(val ?? '').replace(/"/g, '""');
        return forceText ? `="${str}"` : `"${str}"`;
      };

      return [
        escape(item.ordinalFull, true),
        escape(format(new Date(item.registrationDate), "yyyy-MM-dd")),
        escape(item.matchingNumber, true),
        escape(item.possessorInfo),
        escape(item.regularSeizures),
        escape(item.preciousSeizures),
        escape(item.seizuresShape),
        escape(item.courtClerkNumber, true),
        escape(item.courtClerkDate ? format(new Date(item.courtClerkDate), "yyyy-MM-dd") : "-"),
        escape(item.status === 'FINI' ? "مكتمل" : "قيد التنفيذ"),
        escape(item.createdBy.fullName)
      ];
    });

    // Build CSV content with BOM for Excel Arabic support
    const csvContent = "\uFEFF" + [
      headers.map(h => `"${h}"`).join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const fileName = `seizures_export_${format(new Date(), "yyyyMMdd_HHmm")}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting seizures:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
