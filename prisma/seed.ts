import { PrismaClient, Role, AuditAction, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // --- Users ---
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@adltrack.ma' },
    update: {},
    create: {
      fullName: 'أحمد بنعلي',
      email: 'admin@adltrack.ma',
      password: passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const clerk = await prisma.user.upsert({
    where: { email: 'clerk@adltrack.ma' },
    update: {},
    create: {
      fullName: 'فاطمة الزهراء العلوي',
      email: 'clerk@adltrack.ma',
      password: passwordHash,
      role: Role.CLERK,
      isActive: true,
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@adltrack.ma' },
    update: {},
    create: {
      fullName: 'يوسف المرابط',
      email: 'viewer@adltrack.ma',
      password: passwordHash,
      role: Role.VIEWER,
      isActive: true,
    },
  });

  const clerk2 = await prisma.user.upsert({
    where: { email: 'clerk2@adltrack.ma' },
    update: {},
    create: {
      fullName: 'خديجة بوزيد',
      email: 'clerk2@adltrack.ma',
      password: passwordHash,
      role: Role.CLERK,
      isActive: true,
    },
  });

  console.log(`Created ${4} users`);

  // --- Rehabilitation Requests ---
  const rehabData = [
    { ordinalNumber: 1, year: 2025, FullName: 'محمد الإدريسي', cin: 'AB123456', request_date: new Date('2025-01-15'), prosecution_inquiry_date: new Date('2025-02-01'), prosecution_opinion: 'موافقة على الطلب بعد المراجعة', request_status: 'APPROVED' },
    { ordinalNumber: 2, year: 2025, FullName: 'سعيد بن عمر', cin: 'CD789012', request_date: new Date('2025-02-20'), prosecution_inquiry_date: new Date('2025-03-10'), prosecution_opinion: 'قيد الدراسة', request_status: 'PENDING' },
    { ordinalNumber: 3, year: 2025, FullName: 'عبد الرحمان الحسني', cin: 'EF345678', request_date: new Date('2025-03-05'), prosecution_inquiry_date: null, prosecution_opinion: null, request_status: 'PENDING' },
    { ordinalNumber: 4, year: 2025, FullName: 'كريم الطاهري', cin: 'GH901234', request_date: new Date('2025-03-18'), prosecution_inquiry_date: new Date('2025-04-02'), prosecution_opinion: 'رفض الطلب لعدم استيفاء الشروط', request_status: 'REJECTED' },
    { ordinalNumber: 5, year: 2025, FullName: 'حسن المنصوري', cin: 'IJ567890', request_date: new Date('2025-04-10'), prosecution_inquiry_date: new Date('2025-04-25'), prosecution_opinion: 'موافقة', request_status: 'APPROVED' },
    { ordinalNumber: 6, year: 2025, FullName: 'عمر بنشريف', cin: 'KL234567', request_date: new Date('2025-05-01'), prosecution_inquiry_date: null, prosecution_opinion: null, request_status: 'PENDING' },
    { ordinalNumber: 7, year: 2025, FullName: 'ياسين العمري', cin: 'MN890123', request_date: new Date('2025-05-15'), prosecution_inquiry_date: new Date('2025-06-01'), prosecution_opinion: 'موافقة مشروطة', request_status: 'APPROVED' },
    { ordinalNumber: 8, year: 2025, FullName: 'رشيد بلحاج', cin: 'OP456789', request_date: new Date('2025-06-20'), prosecution_inquiry_date: null, prosecution_opinion: null, request_status: 'PENDING' },
    { ordinalNumber: 9, year: 2026, FullName: 'إبراهيم الفاسي', cin: 'QR012345', request_date: new Date('2026-01-05'), prosecution_inquiry_date: new Date('2026-01-20'), prosecution_opinion: 'رفض', request_status: 'REJECTED' },
    { ordinalNumber: 10, year: 2026, FullName: 'مصطفى الشرقاوي', cin: 'ST678901', request_date: new Date('2026-01-15'), prosecution_inquiry_date: null, prosecution_opinion: null, request_status: 'PENDING' },
  ];

  for (const data of rehabData) {
    await prisma.rehabilitationRequest.create({
      data: {
        ...data,
        ordinalFull: `${data.ordinalNumber}/${data.year}`,
        createdById: data.ordinalNumber % 2 === 0 ? clerk.id : admin.id,
      },
    });
  }

  console.log(`Created ${rehabData.length} rehabilitation requests`);

  // --- Alternative Penalties ---
  const courts = ['المحكمة الابتدائية بالرباط', 'المحكمة الابتدائية بالدار البيضاء', 'المحكمة الابتدائية بفاس', 'المحكمة الابتدائية بمراكش', 'المحكمة الابتدائية بطنجة'];
  const crimeTypes = ['سرقة بسيطة', 'إصدار شيك بدون رصيد', 'خيانة الأمانة', 'النصب والاحتيال', 'التزوير في محرر عرفي'];
  const originalPenalties = ['الحبس النافذ', 'الحبس الموقوف التنفيذ', 'الغرامة'];
  const altPenaltyTypes = ['العمل لأجل المنفعة العامة', 'تقييد بعض الحقوق', 'فرض تدابير رقابية أو علاجية أو تأهيلية', 'الغرامة اليومية'];
  const institutions = ['جمعية التنمية المحلية', 'المركز الاجتماعي للقرب', 'مؤسسة الأعمال الاجتماعية', 'المستشفى الجهوي', 'البلدية'];

  const altPenaltyData = [];
  for (let i = 1; i <= 15; i++) {
    const year = i <= 10 ? 2025 : 2026;
    const baseDate = i <= 10 ? new Date(2025, (i - 1) % 12, 10 + i) : new Date(2026, (i - 11) % 12, 5 + i);

    altPenaltyData.push({
      serial_number: i,
      year,
      ordinal_full: `${i}/${year}`,
      full_name: [
        'عبد الله الناصري', 'سمير المغربي', 'نور الدين البكري', 'طارق الأندلسي',
        'زكرياء الحمداني', 'بلال الرحماني', 'أنس الوزاني', 'هشام الشاوي',
        'عادل بن يحيى', 'منير الجزولي', 'فؤاد العراقي', 'وليد بنموسى',
        'سفيان الخطيب', 'رضا المهدي', 'جمال بنداود',
      ][i - 1],
      national_id: `Z${(100000 + i * 1111).toString()}`,
      address_contact: `حي ${['النهضة', 'السلام', 'المسيرة', 'الفتح', 'الأمل'][i % 5]}، ${['الرباط', 'الدار البيضاء', 'فاس', 'مراكش', 'طنجة'][i % 5]}`,
      source_court: courts[i % courts.length],
      case_number: `${1000 + i}/${year}`,
      judgment_number: `${2000 + i}/${year}`,
      judgment_date: new Date(baseDate.getTime() - 30 * 24 * 60 * 60 * 1000),
      crime_type: crimeTypes[i % crimeTypes.length],
      original_penalty_type: originalPenalties[i % originalPenalties.length],
      original_penalty_duration: `${(i % 6) + 1} أشهر`,
      alternative_penalty_type: altPenaltyTypes[i % altPenaltyTypes.length],
      alternative_penalty_details: `تنفيذ ${(i % 4 + 1) * 40} ساعة من العمل`,
      supervising_institution: institutions[i % institutions.length],
      prosecution_referral_date: baseDate,
      execution_decision_number: `ت.ب/${3000 + i}/${year}`,
      execution_decision_date: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      execution_decision_content: 'تنفيذ العقوبة البديلة وفق المقتضيات القانونية',
      followup_orders: i % 3 === 0 ? 'تقديم تقرير شهري عن سير التنفيذ' : null,
      report_received_date: i % 2 === 0 ? new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000) : null,
      responsible_authority: institutions[i % institutions.length],
      compliance_notes: i % 4 === 0 ? 'التزام تام بالعقوبة البديلة' : null,
      appellant_identity: i % 5 === 0 ? 'النيابة العامة' : null,
      dispute_date: i % 5 === 0 ? new Date(baseDate.getTime() + 45 * 24 * 60 * 60 * 1000) : null,
      dispute_subject: i % 5 === 0 ? 'طعن في قرار التنفيذ' : null,
      dispute_outcome: i % 5 === 0 ? 'رفض الطعن' : null,
      final_decision_date: i % 5 === 0 ? new Date(baseDate.getTime() + 60 * 24 * 60 * 60 * 1000) : null,
      appeal_deadline: i % 5 === 0 ? new Date(baseDate.getTime() + 75 * 24 * 60 * 60 * 1000) : null,
      notification_date: i % 2 === 0 ? new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000) : null,
      judge_notes: i % 3 === 0 ? 'ملاحظات القاضي حول سير التنفيذ' : null,
      createdById: [admin.id, clerk.id, clerk2.id][i % 3],
    });
  }

  for (const data of altPenaltyData) {
    await prisma.alternativePenalty.create({ data });
  }

  console.log(`Created ${altPenaltyData.length} alternative penalties`);

  // --- Audit Logs ---
  await prisma.auditLog.create({ data: { tableName: 'rehabilitation_requests', recordId: 1, action: AuditAction.CREATE, oldData: Prisma.JsonNull, newData: { FullName: 'محمد الإدريسي' }, performedById: admin.id } });
  await prisma.auditLog.create({ data: { tableName: 'rehabilitation_requests', recordId: 1, action: AuditAction.UPDATE, oldData: { request_status: 'PENDING' }, newData: { request_status: 'APPROVED' }, performedById: admin.id } });
  await prisma.auditLog.create({ data: { tableName: 'rehabilitation_requests', recordId: 4, action: AuditAction.UPDATE, oldData: { request_status: 'PENDING' }, newData: { request_status: 'REJECTED' }, performedById: clerk.id } });
  await prisma.auditLog.create({ data: { tableName: 'alternative_penalties_registry', recordId: 1, action: AuditAction.CREATE, oldData: Prisma.JsonNull, newData: { full_name: 'عبد الله الناصري' }, performedById: admin.id } });
  await prisma.auditLog.create({ data: { tableName: 'alternative_penalties_registry', recordId: 5, action: AuditAction.CREATE, oldData: Prisma.JsonNull, newData: { full_name: 'زكرياء الحمداني' }, performedById: clerk2.id } });

  console.log('Created 5 audit logs');

  // --- Notifications ---
  const notifData = [
    { userId: admin.id, title: 'طلب جديد', message: 'تم تقديم طلب رد اعتبار جديد رقم 10/2026', isRead: false },
    { userId: admin.id, title: 'تحديث حالة', message: 'تم تحديث حالة الطلب رقم 1/2025 إلى موافقة', isRead: true },
    { userId: clerk.id, title: 'طلب جديد', message: 'تم تقديم طلب رد اعتبار جديد رقم 9/2026', isRead: false },
    { userId: clerk.id, title: 'عقوبة بديلة جديدة', message: 'تم تسجيل عقوبة بديلة جديدة رقم 15/2026', isRead: false },
    { userId: viewer.id, title: 'مرحبا', message: 'مرحبا بك في نظام تتبع العدل', isRead: true },
    { userId: clerk2.id, title: 'تقرير شهري', message: 'يرجى تقديم التقرير الشهري لشهر يناير 2026', isRead: false },
  ];

  for (const data of notifData) {
    await prisma.notification.create({ data });
  }

  console.log(`Created ${notifData.length} notifications`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
