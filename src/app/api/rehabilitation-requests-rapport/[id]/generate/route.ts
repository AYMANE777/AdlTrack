import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import path from 'path';
import fs from 'fs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    try {
      const { id: idStr } = await params;
      const id = parseInt(idStr);

      const searchParams = req.nextUrl.searchParams;
      const template = searchParams.get('template') || 'rehabilitation_requests_rapport';

      const rapport = await prisma.rehabilitationRequestRapport.findUnique({
        where: { id },
      });

      if (!rapport) {
        return NextResponse.json({ error: 'Rapport not found' }, { status: 404 });
      }

      // Also fetch the linked rehabilitation request for CIN
      const rehabRequest = rapport.rehabilitationRequestId
        ? await prisma.rehabilitationRequest.findUnique({
            where: { id: rapport.rehabilitationRequestId },
          })
        : null;

      // Load docxtemplater dynamically (server-side only)
      const PizZip = (await import('pizzip')).default;
      const Docxtemplater = (await import('docxtemplater')).default;

      const templateFileName = template === '688' 
        ? 'rehabilitation_requests_rapport_688.docx' 
        : 'rehabilitation_requests_rapport.docx';
      
      const templatePath = path.join(process.cwd(), 'docx', templateFileName);
      
      if (!fs.existsSync(templatePath)) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      
      const templateContent = fs.readFileSync(templatePath, 'binary');

    const zip = new PizZip(templateContent);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    const statusLabel =
      rapport.status === 'COMPLETED' ? 'مكتمل' :
      rapport.status === 'REJECTED' ? 'مرفوض' :
      rapport.status === 'IN_PROGRESS' ? 'قيد المعالجة' : 'قيد الانتظار';

    doc.render({
      ordinalFull: rapport.ordinalFull,
      num_dossier: rapport.num_dossier,
      'prenom + nom': rapport.FullName,
      'prenom et nom': rapport.FullName,
      fils_de_pere: rapport.fils_de_pere,
      fils_de_mere: rapport.fils_de_mere,
      date_naissance: format(new Date(rapport.date_naissance), 'dd/MM/yyyy'),
      adresse: rapport.adresse || '',
      ville: rapport.ville,
      CIN: rehabRequest?.cin || '',
      tribunal: rapport.tribunal,
      date_de_faire: format(new Date(rapport.date_de_faire), 'dd/MM/yyyy'),
      'date de faire': format(new Date(rapport.date_de_faire), 'dd/MM/yyyy'),
      cause: rapport.autre_condition || '',
      'cause guide': rapport.autre_condition || '',
      status: statusLabel,
      autre_condition: rapport.autre_condition || '',
      date: format(new Date(rapport.date), 'dd/MM/yyyy'),
    });

    const buffer = doc.getZip().generate({ type: 'nodebuffer' });

    const fileName = `تقرير_رد_الاعتبار_${rapport.ordinalFull.replace(/\//g, '-')}.docx`;

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      },
    });
  } catch (error) {
    console.error('Error generating docx:', error);
    return NextResponse.json({ error: 'Failed to generate document' }, { status: 500 });
  }
}
