"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search, 
  Eye, 
  Calendar as CalendarIcon,
  X,
  Printer,
  FileDown,
  Filter,
  Plus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';

interface Refund {
  id: number;
  seizureId: number;
  refundType: string;
  refundRapportType: string;
  printUser: string;
  createdAt: string;
  seizure: {
    ordinalFull: string;
    possessorInfo: string;
    registrationDate: string;
  };
}

export default function RefundsRegistryPage() {
  const [data, setData] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [printRapportType, setPrintRapportType] = useState<string>('');
  const [printDate, setPrintDate] = useState<Date | undefined>(new Date());
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  const months = [
    { value: '1', label: 'يناير' },
    { value: '2', label: 'فبراير' },
    { value: '3', label: 'مارس' },
    { value: '4', label: 'أبريل' },
    { value: '5', label: 'ماي' },
    { value: '6', label: 'يونيو' },
    { value: '7', label: 'يوليوز' },
    { value: '8', label: 'غشت' },
    { value: '9', label: 'شتنبر' },
    { value: '10', label: 'أكتوبر' },
    { value: '11', label: 'نونبر' },
    { value: '12', label: 'دجنبر' },
  ];

  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 5 + i).toString());

  const refundRapportTypes = [
    'قائمة مواد الغش',
    'محضر تسليم المحجوزات لادارة الأملاك المخزنية',
    'محضر إتلاف'
  ];

  const handleOpenPrintDialog = () => {
    setPrintRapportType('');
    setPrintDate(new Date());
    setIsPrintDialogOpen(true);
  };

  const handlePrintWithType = () => {
    if (!printRapportType) {
      toast.error("يرجى اختيار نوع التقرير");
      return;
    }
    if (!printDate) {
      toast.error("يرجى اختيار التاريخ");
      return;
    }

    const filteredByType = filteredData.filter(item => item.refundRapportType === printRapportType);
    
    if (filteredByType.length === 0) {
      toast.error("لا توجد استردادات من هذا النوع");
      return;
    }

    const monthName = selectedMonth ? months.find(m => m.value === selectedMonth)?.label : '';
    
    const printContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>${printRapportType}</title>
        <style>
        @page {
    size: A4;
    margin: 20mm;
}

body {
    font-family: "Times New Roman", serif;
    background: #fff;
    margin: 0;
    padding: 0;
}

/* IMPORTANT: no auto margin */
.page {
    width: 100%;
    min-height: 297mm;
    box-sizing: border-box;
}

/* ================= HEADER ================= */
.header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 30px;
}

/* RIGHT SIDE */
.header-right {
    text-align: center;
    font-size: 14px;
    line-height: 1.6;
}

.header-right .header-insider {
    border: 1px solid #000;
    padding: 6px 25px;
    font-size: 18px;
}

/* LOGO FIX (CLEAR & SHARP) */
.header-right img {
    width: 235px;
    height: auto;
    display: block;
    margin: 0 auto 5px;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
}

/* LEFT SIDE */
.header-left {
    border: 1px solid #000;
    padding: 6px 25px;
    font-weight: bold;
    margin-top: 70px;
    font-size: 16px;
    height: fit-content;
}

/* ================= TABLE ================= */
table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 30px;
    font-size: 14px;
}

th, td {
    border: 1px solid #000;
    padding: 6px;
    text-align: center;
}

th {
    font-weight: bold;
}

td.text-right {
    text-align: right;
    padding-right: 10px;
}

/* ================= PRINT ================= */
@media print {
    body {
        margin: 0;
    }
}
    .title {
            text-align: center;
            margin: 40px 0 20px 0;
            font-weight: bold;
            font-size: 16px;
            line-height: 1.8;
          }
        </style>
      </head>
      <body>
<div class="page">
        <div class="header">
          <div class="header-right">
            <img src="/MinistryofJustice.png" alt="logo">
            <div class="header-insider">
                <div>محكمة الاستئناف بتازة</div>
                <div>المحكمة الابتدائية بتازة</div>
            </div>
          </div>

         <!-- LEFT -->
        <div class="header-left">
           ${printRapportType}
        </div>
        </div>

   
        
        <div class="date-info">
          التاريخ: ${format(printDate, "yyyy-MM-dd")}
          ${monthName ? `<br>برسم شهر ${monthName}` : ''} ${selectedYear}
        </div>

        <table>
          <thead>
            <tr>
                <th>الرقم الترتيبي</th>
                <th>رقم المحجوز</th>
                <th>تاريخ التسجيل</th>
                <th>نوعه</th>
            </tr>
        </thead>
          </thead>
          <tbody>
            ${filteredByType.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.seizure.ordinalFull}</td>
                <td>${format(new Date(item.createdAt), "dd/MM/yyyy")}</td>
                <td>${item.refundType}</td>
                
                
              </tr>
            `).join('')}
          </tbody>
        </table>
</div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
    
    setIsPrintDialogOpen(false);
  };

  const handlePrint = () => {
    const monthName = selectedMonth ? months.find(m => m.value === selectedMonth)?.label : '';
    
    const printContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>سجل الاستردادات</title>
        <style>
          body {
            font-family: "Arial", "Tahoma", sans-serif;
            margin: 30px;
            color: #000;
            direction: rtl;
          }
          .header-container {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            direction: rtl;
            margin-bottom: 20px;
            position: relative;
          }
          .header-right {
            text-align: right;
            line-height: 1.4;
          }
          .header-right h3 {
            margin: 0;
            font-weight: normal;
            font-size: 16px;
          }
          .header-right .center-text {
            text-align: center;
          }
          .header-center {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            top: 0;
          }
          .header-center img {
            width: 120px;
            height: auto;
          }
          .title {
            text-align: center;
            margin: 40px 0 20px 0;
            font-weight: bold;
            font-size: 16px;
            line-height: 1.8;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #000;
            padding: 6px;
            text-align: center;
            vertical-align: middle;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
            font-size: 11px;
          }
          @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>

        <div class="header-container">
          <div class="header-right">
            <div class="center-text">
              <h3>المملكة المغربية</h3>
              <h3>وزارة العدل</h3>
            </div>
            <h3>محكمة الاستئناف بتازة</h3>
            <h3>المحكمة الابتدائية بتازة</h3>
          </div>

          <div class="header-center">
            <img src="/maroc.jpg" alt="شعار المملكة المغربية" onerror="this.style.display='none'">
          </div>
        </div>

        <br/>
        <div class="title">
          سجل الاستردادات
          <br>
          برسم ${monthName ? `شهر ${monthName}` : ''} ${selectedYear}
        </div>

        <table>
          <thead>
            <tr>
              <th>ر.ت</th>
              <th>رقم المحجوز</th>
              <th>معلومات الحائز</th>
              <th>نوع الاسترداد</th>
              <th>نوع التقرير</th>
              <th>المستخدم</th>
              <th>تاريخ الاسترداد</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.seizure.ordinalFull}</td>
                <td>${item.seizure.possessorInfo}</td>
                <td>${item.refundType}</td>
                <td>${item.refundRapportType}</td>
                <td>${item.printUser}</td>
                <td>${format(new Date(item.createdAt), "dd/MM/yyyy")}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const handleExportCSV = () => {
    const headers = ['رقم المحجوز', 'معلومات الحائز', 'نوع الاسترداد', 'نوع التقرير', 'المستخدم', 'تاريخ الاسترداد'];
    const csvContent = [
      headers.join(';'),
      ...filteredData.map(item => [
        `"${item.seizure.ordinalFull}"`,
        `"${item.seizure.possessorInfo}"`,
        `"${item.refundType}"`,
        `"${item.refundRapportType}"`,
        `"${item.printUser}"`,
        format(new Date(item.createdAt), "dd/MM/yyyy")
      ].join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `refunds_${selectedYear}${selectedMonth ? '_' + selectedMonth : ''}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("تم تصدير البيانات بنجاح");
  };

  const handleExportExcel = () => {
    const monthName = selectedMonth ? months.find(m => m.value === selectedMonth)?.label : '';
    
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>الاستردادات</x:Name><x:WorksheetOptions><x:DisplayGridlines/><x:DisplayRightToLeft/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          table { border-collapse: collapse; direction: rtl; }
          th, td { border: 1px solid #000; padding: 8px; text-align: center; }
          th { background: #e8e8e8; font-weight: bold; }
          .header { font-size: 16px; font-weight: bold; text-align: center; }
        </style>
      </head>
      <body>
        <table>
          <tr><td colspan="7" class="header">سجل الاستردادات - ${selectedYear} ${monthName ? `شهر ${monthName}` : ''}</td></tr>
          <tr>
            <th>ر.ت</th>
            <th>رقم المحجوز</th>
            <th>معلومات الحائز</th>
            <th>نوع الاسترداد</th>
            <th>نوع التقرير</th>
            <th>المستخدم</th>
            <th>تاريخ الاسترداد</th>
          </tr>
          ${filteredData.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.seizure.ordinalFull}</td>
              <td>${item.seizure.possessorInfo}</td>
              <td>${item.refundType}</td>
              <td>${item.refundRapportType}</td>
              <td>${item.printUser}</td>
              <td>${format(new Date(item.createdAt), "dd/MM/yyyy")}</td>
            </tr>
          `).join('')}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `refunds_${selectedYear}${selectedMonth ? '_' + selectedMonth : ''}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("تم تصدير البيانات إلى Excel بنجاح");
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedMonth('');
    setSelectedYear(new Date().getFullYear().toString());
    setSearchTerm('');
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/refunds');
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      toast.error("حدث خطأ أثناء جلب البيانات");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = data.filter(item => {
    const matchesSearch = 
      item.seizure.ordinalFull.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.seizure.possessorInfo.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.refundType.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.printUser.toLowerCase().includes(debouncedSearch.toLowerCase());

    const itemDate = new Date(item.createdAt);
    
    let matchesDateRange = true;
    if (startDate) {
      matchesDateRange = matchesDateRange && itemDate >= startDate;
    }
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      matchesDateRange = matchesDateRange && itemDate <= endOfDay;
    }

    let matchesMonthYear = true;
    if (selectedMonth) {
      matchesMonthYear = matchesMonthYear && (itemDate.getMonth() + 1) === parseInt(selectedMonth);
    }
    if (selectedYear) {
      matchesMonthYear = matchesMonthYear && itemDate.getFullYear() === parseInt(selectedYear);
    }

    return matchesSearch && matchesDateRange && matchesMonthYear;
  });

  const handleView = (item: Refund) => {
    setSelectedRefund(item);
    setIsViewOpen(true);
  };

  const handlePrintRefund = (refund: Refund) => {
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير الاسترداد</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Tajawal', sans-serif;
            padding: 40px;
            background: white;
            color: #1a1a1a;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px double #1C2434;
            padding-bottom: 20px;
          }
          .header h1 {
            font-size: 24px;
            color: #1C2434;
            margin-bottom: 8px;
          }
          .header p {
            color: #666;
            font-size: 14px;
          }
          .section {
            margin-bottom: 24px;
            padding: 16px;
            background: #f9fafb;
            border-radius: 8px;
            border-right: 4px solid #3C50E0;
          }
          .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #1C2434;
            margin-bottom: 12px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dashed #e5e7eb;
          }
          .row:last-child { border-bottom: none; }
          .label { color: #6b7280; font-weight: 500; }
          .value { color: #1a1a1a; font-weight: 600; }
          .footer {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
          }
          .signature {
            text-align: center;
            width: 200px;
          }
          .signature-line {
            border-top: 1px solid #1a1a1a;
            margin-top: 60px;
            padding-top: 8px;
          }
          .print-date {
            text-align: center;
            margin-top: 40px;
            color: #6b7280;
            font-size: 12px;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير الاسترداد</h1>
          <p>المملكة المغربية - وزارة العدل</p>
        </div>
        
        <div class="section">
          <div class="section-title">معلومات المحجوز</div>
          <div class="row">
            <span class="label">رقم التسلسل:</span>
            <span class="value">${refund.seizure?.ordinalFull || "-"}</span>
          </div>
          <div class="row">
            <span class="label">معلومات الحائز:</span>
            <span class="value">${refund.seizure?.possessorInfo || "-"}</span>
          </div>
          <div class="row">
            <span class="label">تاريخ التسجيل:</span>
            <span class="value">${refund.seizure?.registrationDate ? new Date(refund.seizure.registrationDate).toLocaleDateString("ar-MA") : "-"}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">تفاصيل الاسترداد</div>
          <div class="row">
            <span class="label">نوع الاسترداد:</span>
            <span class="value">${refund.refundType}</span>
          </div>
          <div class="row">
            <span class="label">نوع التقرير:</span>
            <span class="value">${refund.refundRapportType}</span>
          </div>
        </div>

        <div class="footer">
          <div class="signature">
            <div class="signature-line">توقيع المسؤول</div>
          </div>
          <div class="signature">
            <div class="signature-line">توقيع المستلم</div>
          </div>
        </div>

        <div class="print-date">
          تم الطباعة بواسطة: ${refund.printUser} | التاريخ: ${new Date().toLocaleDateString("ar-MA")} ${new Date().toLocaleTimeString("ar-MA")}
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2 text-[#1C2434] dark:text-white">سجل الاستردادات</h1>
        <p className="text-[#8A99AF] font-bold text-lg">عرض وتدقيق كافة الاستردادات المرتبطة بالمحجوزات.</p>
      </div>

      <div className="bg-white dark:bg-[#24303F] shadow-sm rounded-2xl overflow-hidden border border-[#E2E8F0] dark:border-[#2E3A47]" dir="rtl">
        <div className="p-6 md:p-8 border-b border-[#E2E8F0] dark:border-[#2E3A47] space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-right">
              <h3 className="text-xl font-black text-[#1C2434] dark:text-white mb-1">قائمة الاستردادات</h3>
              <p className="text-sm font-medium text-[#8A99AF]">عرض وتتبع كافة الاستردادات</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/refunds/new">
                <Button className="h-11 px-5 bg-[#3C50E0] hover:bg-[#3C50E0]/90 text-white font-black rounded-xl gap-2">
                  <Plus size={18} />
                  استرداد جديد
                </Button>
              </Link>

<Button
                  onClick={handleOpenPrintDialog}
                  variant="outline"
                  className="h-11 px-5 font-black rounded-xl gap-2 border-[#E2E8F0]"
                  disabled={loading || filteredData.length === 0}
                >
                  <Printer size={18} />
                  طباعة
                </Button>

              <Button
                onClick={handleExportExcel}
                className="h-11 px-5 bg-[#10B981] hover:bg-[#10B981]/90 text-white font-black rounded-xl gap-2"
                disabled={loading || filteredData.length === 0}
              >
                <FileDown size={18} />
                Excel
              </Button>

              <Button
                onClick={handleExportCSV}
                variant="outline"
                className="h-11 px-5 font-black rounded-xl gap-2 border-[#E2E8F0]"
                disabled={loading || filteredData.length === 0}
              >
                <FileDown size={18} />
                CSV
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 p-4 bg-[#F7F9FC] dark:bg-[#313D4A] rounded-xl">
            <Filter size={18} className="text-[#8A99AF]" />
            <span className="font-black text-[#1C2434] dark:text-white text-sm">تصفية حسب:</span>
            
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-10 px-4 bg-white dark:bg-[#24303F] border border-[#E2E8F0] dark:border-[#2E3A47] rounded-lg text-sm font-bold text-[#1C2434] dark:text-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-10 px-4 bg-white dark:bg-[#24303F] border border-[#E2E8F0] dark:border-[#2E3A47] rounded-lg text-sm font-bold text-[#1C2434] dark:text-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
            >
              <option value="">كل الشهور</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-4 font-bold rounded-lg border-[#E2E8F0] gap-2"
                >
                  <CalendarIcon size={16} />
                  {startDate ? format(startDate, "yyyy-MM-dd") : "من تاريخ"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-4 font-bold rounded-lg border-[#E2E8F0] gap-2"
                >
                  <CalendarIcon size={16} />
                  {endDate ? format(endDate, "yyyy-MM-dd") : "إلى تاريخ"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A99AF]" />
              <Input 
                placeholder="بحث برقم المحجوز أو الحائز..." 
                className="pr-10 bg-white dark:bg-[#24303F] border-[#E2E8F0] dark:border-[#2E3A47] h-10 text-sm font-bold rounded-lg text-right"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {(searchTerm || startDate || endDate || selectedMonth) && (
              <Button 
                variant="ghost" 
                onClick={clearFilters}
                className="h-10 px-4 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 gap-2 font-bold"
              >
                <X size={16} />
                مسح الفلاتر
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-[#1C2434] rounded-xl text-white">
            <div className="flex items-center gap-4">
              <span className="font-bold text-sm">عدد السجلات: <span className="text-[#3C50E0] font-black">{filteredData.length}</span></span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F7F9FC] dark:bg-[#313D4A]">
              <TableRow className="border-none">
                <TableHead className="text-right py-5 px-8 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">رقم المحجوز</TableHead>
                <TableHead className="text-right py-5 px-6 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">معلومات الحائز</TableHead>
                <TableHead className="text-right py-5 px-6 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">نوع الاسترداد</TableHead>
                <TableHead className="text-right py-5 px-6 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">نوع التقرير</TableHead>
                <TableHead className="text-right py-5 px-6 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">المستخدم</TableHead>
                <TableHead className="text-right py-5 px-6 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">التاريخ</TableHead>
                <TableHead className="text-center py-5 px-8 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7} className="py-8 px-8">
                      <Skeleton className="h-8 w-full rounded-lg" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                       <div className="bg-[#F7F9FC] dark:bg-[#313D4A] p-4 rounded-full">
                          <Search className="h-8 w-8 text-[#8A99AF]" />
                       </div>
                       <p className="text-[#8A99AF] font-bold">لا توجد استردادات مسجلة</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.id} className="border-b border-[#E2E8F0] dark:border-[#2E3A47] hover:bg-[#F7F9FC] dark:hover:bg-[#313D4A]/50 transition-colors group">
                      <TableCell className="py-5 px-8">
                        <span 
                          className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-black"
                          style={{ backgroundColor: "rgba(60, 80, 224, 0.05)", color: "#3C50E0" }}
                        >
                          {item.seizure.ordinalFull}
                        </span>
                      </TableCell>
                    <TableCell className="py-5 px-6">
                      <p className="text-sm font-bold text-[#1C2434] dark:text-white max-w-[150px] truncate">
                        {item.seizure.possessorInfo}
                      </p>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <p className="text-sm font-bold text-[#1C2434] dark:text-white max-w-[150px] truncate">
                        {item.refundType}
                      </p>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <span className="inline-flex items-center justify-center bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-sm font-bold">
                        {item.refundRapportType}
                      </span>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <span className="text-sm font-bold text-[#64748B] dark:text-[#AEB7C0]">
                        {item.printUser}
                      </span>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <span className="text-sm font-bold text-[#64748B] dark:text-[#AEB7C0]">
                        {format(new Date(item.createdAt), "yyyy-MM-dd")}
                      </span>
                    </TableCell>
                    <TableCell className="py-5 px-8">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-lg text-[#64748B] hover:text-primary hover:bg-primary/10 transition-all"
                          onClick={() => handleView(item)}
                        >
                          <Eye size={18} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-lg text-[#64748B] hover:text-green-600 hover:bg-green-50 transition-all"
                          onClick={() => handlePrintRefund(item)}
                        >
                          <Printer size={18} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl w-[95vw] border-none shadow-2xl rounded-2xl font-cairo bg-white" dir="rtl">
            <DialogHeader className="p-6 bg-white border-b border-[#E2E8F0] rounded-t-2xl">
              <div className="text-right space-y-1">
                <DialogTitle className="text-xl font-black text-[#1C2434]">تفاصيل الاسترداد</DialogTitle>
                <DialogDescription className="text-sm font-bold text-[#8A99AF]">عرض البيانات الكاملة للاسترداد</DialogDescription>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-6">
              {selectedRefund && (
                <div className="grid grid-cols-1 gap-6">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                        <Label className="text-[#8A99AF] font-bold text-xs">رقم المحجوز</Label>
                        <p className="font-black" style={{ color: "#3C50E0" }}>{selectedRefund.seizure.ordinalFull}</p>
                      </div>
                    <div className="space-y-1 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                      <Label className="text-[#8A99AF] font-bold text-xs">معلومات الحائز</Label>
                      <p className="font-black text-[#1C2434]">{selectedRefund.seizure.possessorInfo}</p>
                    </div>
                  </div>

                  <div className="space-y-1 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                    <Label className="text-[#8A99AF] font-bold text-xs">نوع الاسترداد</Label>
                    <p className="font-bold text-[#1C2434] whitespace-pre-wrap">{selectedRefund.refundType}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                      <Label className="text-[#8A99AF] font-bold text-xs">نوع التقرير</Label>
                      <p className="font-black text-amber-600">{selectedRefund.refundRapportType}</p>
                    </div>
                    <div className="space-y-1 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                      <Label className="text-[#8A99AF] font-bold text-xs">تاريخ الاسترداد</Label>
                      <p className="font-bold text-[#1C2434]">{format(new Date(selectedRefund.createdAt), "yyyy-MM-dd HH:mm")}</p>
                    </div>
                  </div>

                  <div className="space-y-1 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                    <Label className="text-[#8A99AF] font-bold text-xs">المستخدم</Label>
                    <p className="font-bold text-[#1C2434]">{selectedRefund.printUser}</p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="p-6 bg-white border-t border-[#E2E8F0] rounded-b-2xl flex gap-3">
              <Button 
                type="button" 
                onClick={() => selectedRefund && handlePrintRefund(selectedRefund)} 
                className="flex-1 h-12 bg-[#10B981] hover:bg-[#10B981]/90 text-white font-black rounded-xl gap-2"
              >
                <Printer size={18} />
                طباعة التقرير
              </Button>
              <Button 
                type="button" 
                onClick={() => setIsViewOpen(false)} 
                className="flex-1 h-12 bg-[#1C2434] hover:bg-[#2E3A47] text-white font-black rounded-xl"
              >
                إغلاق
              </Button>
            </DialogFooter>
</DialogContent>
          </Dialog>

          <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
            <DialogContent className="max-w-md w-[95vw] border-none shadow-2xl rounded-2xl font-cairo bg-white" dir="rtl">
              <DialogHeader className="p-6 bg-white border-b border-[#E2E8F0] rounded-t-2xl">
                <div className="text-right space-y-1">
                  <DialogTitle className="text-xl font-black text-[#1C2434]">طباعة التقرير</DialogTitle>
                  <DialogDescription className="text-sm font-bold text-[#8A99AF]">اختر نوع التقرير والتاريخ للطباعة</DialogDescription>
                </div>
              </DialogHeader>

              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-right block font-black text-[#1C2434] text-sm">نوع التقرير</Label>
                  <select
                    value={printRapportType}
                    onChange={(e) => setPrintRapportType(e.target.value)}
                    className="w-full h-12 px-4 bg-white border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#1C2434] focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  >
                    <option value="">-- اختر نوع التقرير --</option>
                    {refundRapportTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-right block font-black text-[#1C2434] text-sm">التاريخ</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-12 px-4 font-bold rounded-xl border-[#E2E8F0] justify-start gap-2"
                      >
                        <CalendarIcon size={16} />
                        {printDate ? format(printDate, "yyyy-MM-dd") : "اختر التاريخ"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={printDate}
                        onSelect={setPrintDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <DialogFooter className="p-6 bg-white border-t border-[#E2E8F0] rounded-b-2xl flex gap-3">
                <Button 
                  type="button" 
                  onClick={handlePrintWithType} 
                  className="flex-1 h-12 bg-[#3C50E0] hover:bg-[#3C50E0]/90 text-white font-black rounded-xl gap-2"
                >
                  <Printer size={18} />
                  طباعة
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setIsPrintDialogOpen(false)} 
                  variant="outline"
                  className="flex-1 h-12 font-black rounded-xl border-[#E2E8F0]"
                >
                  إلغاء
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }
