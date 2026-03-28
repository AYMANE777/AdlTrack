"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
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
    Edit2,
    Calendar as CalendarIcon,
  X,
  Loader2,
  Printer,
  FileDown,
  Filter
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
import { useAuth } from "@/context/AuthContext";

interface Deposit {
  id: number;
  seizureId: number;
  depositNumber: string;
  depositMontant: number;
  depositDescription: string | null;
  depositedBy: string;
  createdAt: string;
  createdBy?: {
    id: number;
    fullName: string;
    email: string;
  } | null;
  seizure: {
    ordinalFull: string;
    matchingNumber: string;
    possessorInfo: string;
    registrationDate: string;
  };
}

export function DepositsList() {
  const [data, setData] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
    const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [editForm, setEditForm] = useState({
      depositNumber: '',
      depositMontant: 0,
      depositedBy: '',
      depositDescription: ''
    });
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const printRef = useRef<HTMLDivElement>(null);
  
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [printMonth, setPrintMonth] = useState<string>('');
  const [printYear, setPrintYear] = useState<string>(new Date().getFullYear().toString());
  const [privateAccountNumber, setPrivateAccountNumber] = useState<string>('');
    const [savingPrint, setSavingPrint] = useState(false);
    const [alreadyPrintedRecord, setAlreadyPrintedRecord] = useState<{printedBy: string; accountNumber: string} | null>(null);
    
    const { user } = useAuth();
    
    const debouncedSearch = useDebounce(searchTerm, 500);

    const isMonthEnded = useCallback(() => {
      if (!printMonth || !printYear) return false;
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      
      const selectedY = parseInt(printYear);
      const selectedM = parseInt(printMonth);
      
      if (selectedY < currentYear) return true;
      if (selectedY > currentYear) return false;
      return selectedM < currentMonth;
    }, [printMonth, printYear]);

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

  const openPrintDialog = () => {
    setPrintMonth(selectedMonth || '');
    setPrintYear(selectedYear);
    setPrivateAccountNumber('');
    setAlreadyPrintedRecord(null);
    setIsPrintDialogOpen(true);
  };

  const getFilteredDataForPrint = () => {
    return data.filter(item => {
      const itemDate = new Date(item.createdAt);
      let matchesMonthYear = true;
      if (printMonth) {
        matchesMonthYear = matchesMonthYear && (itemDate.getMonth() + 1) === parseInt(printMonth);
      }
      if (printYear) {
        matchesMonthYear = matchesMonthYear && itemDate.getFullYear() === parseInt(printYear);
      }
      return matchesMonthYear;
    });
  };

    const handlePrintConfirm = async () => {
      if (!printMonth) {
        toast.error("يرجى اختيار الشهر");
        return;
      }

      const printData = getFilteredDataForPrint();
      if (printData.length === 0) {
        toast.error("لا توجد بيانات في هذا الشهر");
        return;
      }

      // If month not ended, just preview without saving
      if (!isMonthEnded()) {
        executePrint(printData, printMonth, printYear, privateAccountNumber || '........', true);
        toast.info("نمط المعاينة: الشهر لم ينتهِ بعد");
        return;
      }

      if (!privateAccountNumber.trim()) {
        toast.error("يرجى إدخال رقم الحساب الخصوصي");
        return;
      }

      setSavingPrint(true);

    
    try {
      const checkUrl = `/api/private-depo-acc?month=${printMonth}&year=${printYear}`;
      const checkResponse = await fetch(checkUrl);
      const existingRecords = await checkResponse.json();
      
      if (Array.isArray(existingRecords) && existingRecords.length > 0) {
        const record = existingRecords[0];
        setAlreadyPrintedRecord({
          printedBy: record.printedBy || 'مجهول',
          accountNumber: record.accountNumber
        });
        toast.error(`تمت الطباعة مسبقاً بواسطة: ${record.printedBy || 'مجهول'} - رقم الحساب: ${record.accountNumber}`);
        setSavingPrint(false);
        return;
      }

      const totalAmount = printData.reduce((sum, item) => sum + item.depositMontant, 0);
      
      const response = await fetch('/api/private-depo-acc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountNumber: privateAccountNumber,
          month: printMonth,
          year: printYear,
          totalAmount,
          depositsCount: printData.length,
          printedBy: user?.fullName || user?.username || 'مجهول',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to save');
      }

      const savedRecord = await response.json();
      console.log('Saved record:', savedRecord);

      executePrint(printData, printMonth, printYear, privateAccountNumber);
      setIsPrintDialogOpen(false);
      toast.success("تم حفظ وطباعة البيانات بنجاح");
    } catch (error) {
      console.error('Error saving print data:', error);
      toast.error("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setSavingPrint(false);
    }
  };

  const handleReprintOnly = () => {
    if (!alreadyPrintedRecord) return;
    const printData = getFilteredDataForPrint();
    executePrint(printData, printMonth, printYear, alreadyPrintedRecord.accountNumber);
    setIsPrintDialogOpen(false);
    toast.success("تمت إعادة الطباعة بنجاح");
  };

  const executePrint = (printData: Deposit[], month: string, year: string, accountNum: string, isPreview: boolean = false) => {
    const monthName = months.find(m => m.value === month)?.label || '';
    const totalAmount = printData.reduce((sum, item) => sum + item.depositMontant, 0);
    
    const printContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>المبالغ المالية المحجوزة والمودعة</title>
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
          .total-row {
            background-color: #e8e8e8;
            font-weight: bold;
          }
          .preview-note {
            margin-top: 50px;
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            color: #666;
            border: 2px dashed #ccc;
            padding: 15px;
            border-radius: 8px;
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
            المبالغ المالية المحجوزة والمودعة بحساب المحكمة المفتوح لدى صندوق الإيداع والتدبير
            <br>
            برسم شهر ${monthName || '........'} ${year} حساب خصوصي رقم ${accountNum}
          </div>

          <table>
            <thead>
              <tr>
                <th>رقم المحجوز بكتابة الضبط</th>
                <th>تاريخ التسجيل</th>
                <th>رقم المحجوز بالنيابة العامة</th>
                <th>مبلغ المال المحجوز بالدرهم</th>
                <th>اسم صاحب المحجوز</th>
                <th>رقم وصل الإيداع</th>
                <th>العملة الأجنبية</th>
                <th>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              ${printData.map((item) => `
                <tr>
                  <td>${item.seizure.ordinalFull}</td>
                  <td>${format(new Date(item.createdAt), "dd/MM/yyyy")}</td>
                  <td>${item.seizure.matchingNumber || item.seizure.ordinalFull}</td>
                  <td>${item.depositMontant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
                  <td>${item.depositedBy}</td>
                  <td>${item.depositNumber}</td>
                  <td></td>
                  <td>${item.depositDescription || ''}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3">المجموع</td>
                <td>${totalAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
                <td colspan="4"></td>
              </tr>
            </tbody>
          </table>

          ${isPreview ? `
            <div class="preview-note">
              هذه النسخة للمعاينة فقط - الشهر لم ينتهِ بعد
            </div>
          ` : ''}

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

  const handlePrint = () => {
    openPrintDialog();
  };

  const handleExportCSV = () => {
    const headers = ['رقم الإيداع', 'رقم المحجوز', 'المبلغ', 'المودع', 'تاريخ الإيداع', 'الوصف'];
    const csvContent = [
      headers.join(';'),
      ...filteredData.map(item => [
        `"${item.depositNumber}"`,
        `"${item.seizure.ordinalFull}"`,
        item.depositMontant,
        `"${item.depositedBy}"`,
        format(new Date(item.createdAt), "dd/MM/yyyy"),
        `"${item.depositDescription || ''}"`
      ].join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `deposits_${selectedYear}${selectedMonth ? '_' + selectedMonth : ''}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("تم تصدير البيانات بنجاح");
  };

  const handleExportExcel = () => {
    const totalAmount = filteredData.reduce((sum, item) => sum + item.depositMontant, 0);
    const monthName = selectedMonth ? months.find(m => m.value === selectedMonth)?.label : '';
    
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>الإيداعات</x:Name><x:WorksheetOptions><x:DisplayGridlines/><x:DisplayRightToLeft/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          table { border-collapse: collapse; direction: rtl; }
          th, td { border: 1px solid #000; padding: 8px; text-align: center; }
          th { background: #e8e8e8; font-weight: bold; }
          .header { font-size: 16px; font-weight: bold; text-align: center; }
          .total { background: #d9d9d9; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <tr><td colspan="8" class="header">قائمة المبالغ المودعة - ${selectedYear} ${monthName ? `شهر ${monthName}` : ''}</td></tr>
          <tr>
            <th>ر.ت</th>
            <th>رقم وصل الإيداع</th>
            <th>اسم المحجوز عليه</th>
            <th>مبلغ الأداء</th>
            <th>رقم الملف</th>
            <th>تاريخ التسجيل</th>
            <th>رقم المحجوز</th>
            <th>ملاحظة</th>
          </tr>
          ${filteredData.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>0010008522942</td>
              <td>${item.depositedBy}</td>
              <td>${item.depositMontant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
              <td>${item.seizure.ordinalFull}</td>
              <td>${format(new Date(item.createdAt), "dd/MM/yyyy")}</td>
              <td>${item.seizure.ordinalFull}</td>
              <td>${item.depositDescription || ''}</td>
            </tr>
          `).join('')}
          <tr class="total">
            <td colspan="3">المجموع</td>
            <td>${totalAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
            <td colspan="4"></td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `deposits_${selectedYear}${selectedMonth ? '_' + selectedMonth : ''}.xls`);
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
      const response = await fetch('/api/deposits');
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const result = await response.json();
      setData(result);
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
      item.depositNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.seizure.ordinalFull.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.depositedBy.toLowerCase().includes(debouncedSearch.toLowerCase());

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

    const handleView = (item: Deposit) => {
      setSelectedDeposit(item);
      setIsViewOpen(true);
    };

    const handleEdit = (item: Deposit) => {
      setSelectedDeposit(item);
      setEditForm({
        depositNumber: item.depositNumber,
        depositMontant: item.depositMontant,
        depositedBy: item.depositedBy,
        depositDescription: item.depositDescription || ''
      });
      setIsEditOpen(true);
    };

    const handleUpdate = async () => {
      if (!selectedDeposit || !user) return;
      
      setUpdating(true);
      try {
        const response = await fetch(`/api/deposits/${selectedDeposit.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...editForm,
            performedById: user.id
          }),
        });

        if (!response.ok) throw new Error('Failed to update deposit');
        
        toast.success("تم تحديث الإيداع بنجاح");
        setIsEditOpen(false);
        fetchData();
      } catch (error) {
        console.error('Update error:', error);
        toast.error("حدث خطأ أثناء تحديث الإيداع");
      } finally {
        setUpdating(false);
      }
    };

    const totalAmount = filteredData.reduce((sum, item) => sum + item.depositMontant, 0);

  return (
    <div className="bg-white dark:bg-[#24303F] shadow-sm rounded-2xl overflow-hidden border border-[#E2E8F0] dark:border-[#2E3A47]" dir="rtl">
      <div className="p-6 md:p-8 border-b border-[#E2E8F0] dark:border-[#2E3A47] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-right">
            <h3 className="text-xl font-black text-[#1C2434] dark:text-white mb-1">سجل الإيداعات</h3>
            <p className="text-sm font-medium text-[#8A99AF]">عرض وتتبع كافة الإيداعات المالية المرتبطة بالمحجوزات</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handlePrint}
              className="h-11 px-5 bg-[#3C50E0] hover:bg-[#3C50E0]/90 text-white font-black rounded-xl gap-2"
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
              placeholder="بحث برقم الإيداع أو المحجوز..." 
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
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">المجموع:</span>
            <span className="text-xl font-black text-[#10B981]">{totalAmount.toLocaleString()} درهم</span>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#F7F9FC] dark:bg-[#313D4A]">
            <TableRow className="border-none">
              <TableHead className="text-right py-5 px-8 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">رقم الإيداع</TableHead>
              <TableHead className="text-right py-5 px-6 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">رقم المحجوز</TableHead>
              <TableHead className="text-right py-5 px-6 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">المبلغ</TableHead>
              <TableHead className="text-right py-5 px-6 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">المودع</TableHead>
              <TableHead className="text-right py-5 px-6 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">تاريخ الإيداع</TableHead>
              <TableHead className="text-center py-5 px-8 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="py-8 px-8">
                    <Skeleton className="h-8 w-full rounded-lg" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                     <div className="bg-[#F7F9FC] dark:bg-[#313D4A] p-4 rounded-full">
                        <Search className="h-8 w-8 text-[#8A99AF]" />
                     </div>
                     <p className="text-[#8A99AF] font-bold">لا توجد إيداعات مسجلة</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => (
                <TableRow key={item.id} className="border-b border-[#E2E8F0] dark:border-[#2E3A47] hover:bg-[#F7F9FC] dark:hover:bg-[#313D4A]/50 transition-colors group">
                  <TableCell className="py-5 px-8">
                    <span className="text-sm font-black text-[#1C2434] dark:text-white">
                      {item.depositNumber}
                    </span>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <span className="inline-flex items-center justify-center bg-primary/5 text-primary px-3 py-1 rounded-lg text-sm font-black">
                      {item.seizure.ordinalFull}
                    </span>
                  </TableCell>
                  <TableCell className="py-5 px-6 whitespace-nowrap">
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {item.depositMontant.toLocaleString()} د.م
                    </span>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <p className="text-sm font-bold text-[#1C2434] dark:text-white max-w-[150px] truncate">
                      {item.depositedBy}
                    </p>
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
                        {user?.role === 'ADMIN' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-lg text-[#64748B] hover:text-amber-600 hover:bg-amber-50 transition-all"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit2 size={18} />
                          </Button>
                        )}
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
              <DialogTitle className="text-xl font-black text-[#1C2434]">تفاصيل الإيداع رقم {selectedDeposit?.depositNumber}</DialogTitle>
              <DialogDescription className="text-sm font-bold text-[#8A99AF]">عرض البيانات الكاملة للإيداع المالي</DialogDescription>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {selectedDeposit && (
              <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                    <Label className="text-[#8A99AF] font-bold text-xs">رقم الإيداع</Label>
                    <p className="font-black text-[#1C2434]">{selectedDeposit.depositNumber}</p>
                  </div>
                  <div className="space-y-1 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                    <Label className="text-[#8A99AF] font-bold text-xs">رقم المحجوز</Label>
                    <p className="font-black text-primary">{selectedDeposit.seizure.ordinalFull}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                    <Label className="text-[#8A99AF] font-bold text-xs">المبلغ</Label>
                    <p className="font-black text-emerald-600">{selectedDeposit.depositMontant.toLocaleString()} درهم</p>
                  </div>
                  <div className="space-y-1 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                    <Label className="text-[#8A99AF] font-bold text-xs">تاريخ الإيداع</Label>
                    <p className="font-bold text-[#1C2434]">{format(new Date(selectedDeposit.createdAt), "yyyy-MM-dd HH:mm")}</p>
                  </div>
                </div>

                <div className="space-y-1 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <Label className="text-[#8A99AF] font-bold text-xs">المودع</Label>
                  <p className="font-bold text-[#1C2434]">{selectedDeposit.depositedBy}</p>
                </div>

                  <div className="space-y-1 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                    <Label className="text-[#8A99AF] font-bold text-xs">وصف الإيداع</Label>
                    <p className="font-medium text-[#1C2434] whitespace-pre-wrap">{selectedDeposit.depositDescription || "لا يوجد وصف"}</p>
                  </div>

                  <div className="space-y-1 bg-[#ECFDF5] p-3 rounded-xl border border-[#A7F3D0]">
                    <Label className="text-[#059669] font-bold text-xs">تم الإضافة بواسطة</Label>
                    <p className="font-black text-[#047857]">{selectedDeposit.createdBy?.fullName || "غير معروف"}</p>
                  </div>

                <div className="bg-[#1C2434] text-white p-4 rounded-xl">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#8A99AF] mb-2">معلومات المحجوز المرتبط</h4>
                  <div className="space-y-2">
                    <p className="text-sm font-bold"><span className="text-[#8A99AF]">الرقم الموافق:</span> {selectedDeposit.seizure.matchingNumber}</p>
                    <p className="text-sm font-bold"><span className="text-[#8A99AF]">الحائز:</span> {selectedDeposit.seizure.possessorInfo}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

              <DialogFooter className="p-6 bg-white border-t border-[#E2E8F0] rounded-b-2xl">
                <Button 
                  type="button" 
                  onClick={() => setIsViewOpen(false)} 
                  className="w-full h-12 bg-[#1C2434] hover:bg-[#2E3A47] text-white font-black rounded-xl"
                >
                  إغلاق
                </Button>
              </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl w-[95vw] border-none shadow-2xl rounded-2xl font-cairo bg-white" dir="rtl">
            <DialogHeader className="p-6 bg-white border-b border-[#E2E8F0] rounded-t-2xl">
              <div className="text-right space-y-1">
                <DialogTitle className="text-xl font-black text-[#1C2434]">تعديل الإيداع رقم {selectedDeposit?.depositNumber}</DialogTitle>
                <DialogDescription className="text-sm font-bold text-[#8A99AF]">تعديل بيانات الإيداع المالي المختار</DialogDescription>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#1C2434] font-black text-sm">رقم الإيداع</Label>
                  <Input 
                    value={editForm.depositNumber}
                    onChange={(e) => setEditForm(prev => ({ ...prev, depositNumber: e.target.value }))}
                    className="h-12 bg-[#F8FAFC] border-[#E2E8F0] rounded-xl text-right font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#1C2434] font-black text-sm">المبلغ</Label>
                  <Input 
                    type="number"
                    value={editForm.depositMontant}
                    onChange={(e) => setEditForm(prev => ({ ...prev, depositMontant: parseFloat(e.target.value) || 0 }))}
                    className="h-12 bg-[#F8FAFC] border-[#E2E8F0] rounded-xl text-right font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#1C2434] font-black text-sm">المودع</Label>
                <Input 
                  value={editForm.depositedBy}
                  onChange={(e) => setEditForm(prev => ({ ...prev, depositedBy: e.target.value }))}
                  className="h-12 bg-[#F8FAFC] border-[#E2E8F0] rounded-xl text-right font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#1C2434] font-black text-sm">وصف الإيداع</Label>
                <textarea 
                  value={editForm.depositDescription}
                  onChange={(e) => setEditForm(prev => ({ ...prev, depositDescription: e.target.value }))}
                  className="w-full min-h-[100px] p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-right font-bold focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
            </div>

            <DialogFooter className="p-6 bg-white border-t border-[#E2E8F0] rounded-b-2xl flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setIsEditOpen(false)} 
                className="flex-1 h-12 font-black rounded-xl"
                disabled={updating}
              >
                إلغاء
              </Button>
              <Button 
                onClick={handleUpdate} 
                className="flex-1 h-12 bg-[#3C50E0] hover:bg-[#3C50E0]/90 text-white font-black rounded-xl gap-2"
                disabled={updating}
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <FileDown size={18} />
                    حفظ التعديلات
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
          <DialogContent className="max-w-md w-[95vw] border-none shadow-2xl rounded-2xl font-cairo bg-white" dir="rtl">
            <DialogHeader className="p-6 bg-white border-b border-[#E2E8F0] rounded-t-2xl">
                <div className="text-right space-y-1">
                  <DialogTitle className="text-xl font-black text-[#1C2434]">خيارات الطباعة</DialogTitle>
                  <DialogDescription className="text-sm font-bold text-[#8A99AF]">
                    {!isMonthEnded() 
                      ? "يمكنك معاينة البيانات فقط لأن الشهر لم ينتهِ بعد" 
                      : "اختر الشهر وأدخل رقم الحساب الخصوصي للطباعة النهائية"}
                  </DialogDescription>
                </div>

            </DialogHeader>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-right block font-black text-[#1C2434] text-sm">السنة</Label>
                <select
                  value={printYear}
                  onChange={(e) => setPrintYear(e.target.value)}
                  className="w-full h-12 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#1C2434] focus:ring-2 focus:ring-primary/20 focus:outline-none"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-right block font-black text-[#1C2434] text-sm">الشهر <span className="text-red-500">*</span></Label>
                <select
                  value={printMonth}
                  onChange={(e) => setPrintMonth(e.target.value)}
                  className="w-full h-12 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#1C2434] focus:ring-2 focus:ring-primary/20 focus:outline-none"
                >
                  <option value="">اختر الشهر</option>
                  {months.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-right block font-black text-[#1C2434] text-sm">حساب خصوصي رقم <span className="text-red-500">*</span></Label>
                <Input
                  value={privateAccountNumber}
                  onChange={(e) => setPrivateAccountNumber(e.target.value)}
                  placeholder="أدخل رقم الحساب الخصوصي"
                  className="h-12 bg-[#F8FAFC] border-[#E2E8F0] rounded-xl text-right font-bold"
                />
              </div>

              {printMonth && (
                <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl">
                  <p className="text-sm font-bold text-[#166534]">
                    عدد الإيداعات في شهر {months.find(m => m.value === printMonth)?.label} {printYear}: {getFilteredDataForPrint().length}
                  </p>
                  <p className="text-sm font-bold text-[#166534]">
                    المجموع: {getFilteredDataForPrint().reduce((sum, item) => sum + item.depositMontant, 0).toLocaleString()} درهم
                  </p>
                </div>
              )}

              {alreadyPrintedRecord && (
                <div className="px-6 pb-4">
                  <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl space-y-3">
                    <p className="text-sm font-bold text-[#DC2626]">
                      تمت الطباعة مسبقاً بواسطة: {alreadyPrintedRecord.printedBy}
                    </p>
                    <p className="text-sm font-bold text-[#DC2626]">
                      رقم الحساب: {alreadyPrintedRecord.accountNumber}
                    </p>
                    <Button 
                      type="button" 
                      onClick={handleReprintOnly} 
                      className="w-full h-10 bg-[#F97316] hover:bg-[#EA580C] text-white font-black rounded-xl gap-2"
                    >
                      <Printer size={16} />
                      إعادة الطباعة
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="p-6 bg-white border-t border-[#E2E8F0] rounded-b-2xl flex gap-3">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsPrintDialogOpen(false)} 
                className="flex-1 h-12 font-black rounded-xl"
                disabled={savingPrint}
              >
                إلغاء
              </Button>
                <Button 
                  type="button" 
                  onClick={handlePrintConfirm} 
                  className="flex-1 h-12 bg-[#3C50E0] hover:bg-[#3C50E0]/90 text-white font-black rounded-xl gap-2"
                  disabled={savingPrint}
                >
                  {savingPrint ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : !isMonthEnded() ? (
                    <>
                      <Eye size={18} />
                      معاينة
                    </>
                  ) : (
                    <>
                      <Printer size={18} />
                      طباعة
                    </>
                  )}
                </Button>

            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
