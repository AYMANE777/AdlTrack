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
  Edit, 
  Trash2, 
  MoreVertical,
  Download,
  Filter,
  Calendar as CalendarIcon,
  X,
  Save,
    Loader2,
    Printer,
    CheckCircle2,
    Clock
  } from "lucide-react";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { Badge } from "@/components/ui/badge";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/context/AuthContext';

import { Seizure, Meta } from "@/types";

interface CorrespondenceListProps {
  initialData?: Seizure[];
  initialMeta?: Meta;
}

export function CorrespondenceList({ initialData, initialMeta }: CorrespondenceListProps) {
  const [data, setData] = useState<Seizure[]>(initialData || []);
  const [meta, setMeta] = useState<Meta>(initialMeta || { total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(!initialData);
  
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modals state
  const [selectedSeizure, setSelectedSeizure] = useState<Seizure | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    // Export state
    const [exportFilters, setExportFilters] = useState({
      dateStart: '',
      dateEnd: '',
      ordinalStart: '',
      ordinalEnd: ''
    });

    // Edit form state

  const [editFormData, setEditFormData] = useState<Partial<Seizure>>({});
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: debouncedSearch,
        date: dateFilter
      });
      
      const response = await fetch(`/api/seizures?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const result = await response.json();
      setData(result.data);
      setMeta(result.meta);
    } catch (error) {
      toast.error("حدث خطأ أثناء جلب البيانات");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, dateFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

    // Reset to first page when search changes
    useEffect(() => {
      setCurrentPage(1);
    }, [debouncedSearch, dateFilter]);
  
    const handlePrint = (item: Seizure) => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
  
      const registrationDate = item.registrationDate ? format(new Date(item.registrationDate), "yyyy-MM-dd") : "-";
      const courtClerkDate = item.courtClerkDate ? format(new Date(item.courtClerkDate), "yyyy-MM-dd") : "-";
  
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>طباعة المحجوز - ${item.ordinalFull}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
              body { font-family: 'Cairo', sans-serif; padding: 40px; color: #1C2434; }
              .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #1C2434; padding-bottom: 20px; }
              .section { margin-bottom: 30px; }
              .section-title { font-weight: bold; font-size: 1.2rem; margin-bottom: 15px; background: #f8fafc; padding: 8px 15px; border-right: 5px solid #1C2434; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
              .item { margin-bottom: 10px; }
              .label { font-weight: bold; color: #64748B; font-size: 0.9rem; margin-bottom: 4px; }
              .value { font-size: 1.1rem; font-weight: bold; }
              .full-width { grid-column: span 2; }
              .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 0.8rem; color: #8A99AF; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0; font-size: 1.8rem;">المملكة المغربية</h1>
              <h2 style="margin: 5px 0; font-size: 1.4rem;">وزارة العدل</h2>
              <h3 style="margin: 10px 0; color: #1C2434;">بطاقة المحجوز رقم: ${item.ordinalFull}</h3>
            </div>
            
            <div class="section">
              <div class="section-title">بيانات التسجيل</div>
              <div class="grid">
                <div class="item"><div class="label">تاريخ التسجيل:</div><div class="value">${registrationDate}</div></div>
                <div class="item"><div class="label">الرقم الموافق:</div><div class="value">${item.matchingNumber}</div></div>
                <div class="item full-width"><div class="label">اسم الحائز:</div><div class="value">${item.possessorInfo}</div></div>
              </div>
            </div>
  
            <div class="section">
              <div class="section-title">بيانات كتابة الضبط</div>
              <div class="grid">
                <div class="item"><div class="label">رقم كتابة الضبط:</div><div class="value">${item.courtClerkNumber}</div></div>
                <div class="item"><div class="label">تاريخ كتابة الضبط:</div><div class="value">${courtClerkDate}</div></div>
              </div>
            </div>
  
            <div class="section">
              <div class="section-title">تفاصيل المحجوزات</div>
              <div class="grid">
                <div class="item full-width"><div class="label">المحجوزات العادية:</div><div class="value">${item.regularSeizures || "لا يوجد"}</div></div>
                <div class="item full-width"><div class="label">المحجوزات الثمينة:</div><div class="value" style="color: #dc2626;">${item.preciousSeizures || "لا يوجد"}</div></div>
                <div class="item full-width"><div class="label">شكل المحجوزات:</div><div class="value">${item.seizuresShape || "غير محدد"}</div></div>
              </div>
            </div>
  
            <div class="section">
              <div class="section-title">الحالة والعمليات</div>
              <div class="grid">
                <div class="item"><div class="label">حالة السجل:</div><div class="value">${item.status === 'EN_COURS' ? 'قيد التنفيذ' : 'مكتمل'}</div></div>
                <div class="item"><div class="label">تم الإنشاء بواسطة:</div><div class="value">${item.createdBy.fullName}</div></div>
              </div>
            </div>
  
            <div class="footer">
              تاريخ الطباعة: ${format(new Date(), "yyyy-MM-dd HH:mm")} | نظام إدارة المحجوزات القضائية
            </div>
  
            <div class="no-print" style="margin-top: 50px; text-align: center;">
              <button onclick="window.print()" style="padding: 12px 30px; background: #1C2434; color: white; border: none; border-radius: 8px; cursor: pointer; font-family: 'Cairo', sans-serif; font-weight: bold; font-size: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">تأكيد الطباعة</button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    };
  
    const handleView = (item: Seizure) => {
    setSelectedSeizure(item);
    setIsViewOpen(true);
  };

  const handleEdit = (item: Seizure) => {
    setSelectedSeizure(item);
    setEditFormData({
      ...item,
      registrationDate: item.registrationDate ? format(new Date(item.registrationDate), "yyyy-MM-dd") : "",
      courtClerkDate: item.courtClerkDate ? format(new Date(item.courtClerkDate), "yyyy-MM-dd") : "",
      deliveryRightsHoldersDate: item.deliveryRightsHoldersDate ? format(new Date(item.deliveryRightsHoldersDate), "yyyy-MM-dd") : "",
      deliveryStatePropertyDate: item.deliveryStatePropertyDate ? format(new Date(item.deliveryStatePropertyDate), "yyyy-MM-dd") : "",
      statePropertyListDate: item.statePropertyListDate ? format(new Date(item.statePropertyListDate), "yyyy-MM-dd") : "",
      destructionMinutesDate: item.destructionMinutesDate ? format(new Date(item.destructionMinutesDate), "yyyy-MM-dd") : "",
    });
    setIsEditOpen(true);
  };

  const handleDeleteClick = (item: Seizure) => {
    setSelectedSeizure(item);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSeizure) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/seizures/${selectedSeizure.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      
      toast.success("تم حذف السجل بنجاح");
      setIsDeleteOpen(false);
      fetchData();
    } catch (error) {
      toast.error("حدث خطأ أثناء الحذف");
    } finally {
      setIsSubmitting(false);
    }
  };

    const handleUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedSeizure) return;
      
      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/seizures/${selectedSeizure.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...editFormData,
            updatedById: user?.id
          }),
        });
        
        if (!response.ok) throw new Error('Failed to update');
        
        toast.success("تم تحديث السجل بنجاح");
        setIsEditOpen(false);
        fetchData();
      } catch (error) {
        toast.error("حدث خطأ أثناء التحديث");
      } finally {
        setIsSubmitting(false);
      }
    };
  
    const handleExport = async () => {
      setIsSubmitting(true);
      try {
        const params = new URLSearchParams();
        if (exportFilters.dateStart) params.append('dateStart', exportFilters.dateStart);
        if (exportFilters.dateEnd) params.append('dateEnd', exportFilters.dateEnd);
        if (exportFilters.ordinalStart) params.append('ordinalStart', exportFilters.ordinalStart);
        if (exportFilters.ordinalEnd) params.append('ordinalEnd', exportFilters.ordinalEnd);

        const response = await fetch(`/api/seizures/export?${params.toString()}`);
        if (!response.ok) throw new Error('Export failed');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export_${format(new Date(), "yyyyMMdd")}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success("تم تصدير البيانات بنجاح");
        setIsExportOpen(false);
      } catch (error) {
        toast.error("حدث خطأ أثناء تصدير البيانات");
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const clearFilters = () => {

    setSearchTerm('');
    setDateFilter('');
  };

  return (
    <div className="bg-white dark:bg-[#24303F] shadow-sm rounded-2xl overflow-hidden border border-[#E2E8F0] dark:border-[#2E3A47]" dir="rtl">
      <div className="p-6 md:p-8 border-b border-[#E2E8F0] dark:border-[#2E3A47] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-right">
          <h3 className="text-xl font-black text-[#1C2434] dark:text-white mb-1">سجل المحجوزات</h3>
          <p className="text-sm font-medium text-[#8A99AF]">إدارة ومتابعة كافة المحجوزات المسجلة في النظام</p>
        </div>
        
          <div className="flex flex-wrap items-center gap-3">
<Button 
                onClick={() => setIsExportOpen(true)}
                className="h-11 px-6 rounded-xl text-white gap-2 font-bold"
                style={{ backgroundColor: "#059669", boxShadow: "0 10px 15px -3px rgba(5, 150, 105, 0.2)" }}
              >
                <Download size={18} />
                تصدير CSV
              </Button>

            <div className="relative w-full md:w-64 group">

            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8A99AF] group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="بحث بالرقم أو الاسم..." 
              className="pr-12 bg-[#F7F9FC] dark:bg-[#313D4A] border-none h-11 text-sm font-bold text-[#1C2434] dark:text-white rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 text-right"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative w-full md:w-48 group">
            <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8A99AF] group-focus-within:text-primary transition-colors pointer-events-none" />
            <Input 
              type="date"
              className="pr-12 bg-[#F7F9FC] dark:bg-[#313D4A] border-none h-11 text-sm font-bold text-[#1C2434] dark:text-white rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 text-right"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          {(searchTerm || dateFilter) && (
            <Button 
              variant="ghost" 
              onClick={clearFilters}
              className="h-11 px-4 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 gap-2 font-bold"
            >
              <X size={18} />
              مسح التصفية
            </Button>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
            <TableHeader className="bg-[#F7F9FC] dark:bg-[#313D4A]">
              <TableRow className="border-none">
                <TableHead className="text-right py-5 px-8 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">الرقم الترتيبي</TableHead>
                <TableHead className="text-right py-5 px-6 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">تاريخ التسجيل</TableHead>
                <TableHead className="text-right py-5 px-6 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">الرقم الموافق</TableHead>
                <TableHead className="text-right py-5 px-6 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">اسم الحائز</TableHead>
                <TableHead className="text-right py-5 px-6 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">المحجوزات</TableHead>
                  <TableHead className="text-right py-5 px-6 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">كتابة الضبط</TableHead>
                  <TableHead className="text-right py-5 px-6 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">الحالة</TableHead>
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
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                       <div className="bg-[#F7F9FC] dark:bg-[#313D4A] p-4 rounded-full">
                          <Search className="h-8 w-8 text-[#8A99AF]" />
                       </div>
                       <p className="text-[#8A99AF] font-bold">لا توجد سجلات مطابقة للبحث</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => {
                  return (
                    <TableRow key={item.id} className="border-b border-[#E2E8F0] dark:border-[#2E3A47] hover:bg-[#F7F9FC] dark:hover:bg-[#313D4A]/50 transition-colors group">
                      <TableCell className="py-5 px-8">
                          <span 
                            className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-black"
                            style={{ backgroundColor: "rgba(60, 80, 224, 0.1)", color: "#3C50E0" }}
                          >
                            {item.ordinalFull}
                          </span>
                        </TableCell>
                      <TableCell className="py-5 px-6 whitespace-nowrap">
                        <span className="text-sm font-bold text-[#64748B] dark:text-[#AEB7C0]">
                          {item.registrationDate ? format(new Date(item.registrationDate), "yyyy-MM-dd") : "-"}
                        </span>
                      </TableCell>
                      <TableCell className="py-5 px-6">
                        <span className="text-sm font-bold text-[#64748B] dark:text-[#AEB7C0]">
                          {item.matchingNumber}
                        </span>
                      </TableCell>
                      <TableCell className="py-5 px-6">
                        <p className="text-sm font-black text-[#1C2434] dark:text-white max-w-[200px] truncate">
                          {item.possessorInfo}
                        </p>
                      </TableCell>
                      <TableCell className="py-5 px-6">
                        <div className="flex flex-col gap-1">
                          {item.regularSeizures && (
                            <span className="text-sm font-bold text-[#64748B] dark:text-[#AEB7C0] truncate max-w-[150px]">
                              {item.regularSeizures}
                            </span>
                          )}
                          {item.preciousSeizures && (
                            <span className="text-sm font-black text-red-600 truncate max-w-[150px]">
                              {item.preciousSeizures}
                            </span>
                          )}
                        </div>
                      </TableCell>
                        <TableCell className="py-5 px-6">
                          <div className="flex flex-col text-xs font-bold gap-1">
                            <span style={{ color: "#3C50E0" }}>{item.courtClerkNumber}</span>
                            <span className="text-[#8A99AF]">
                              {item.courtClerkDate ? format(new Date(item.courtClerkDate), "yyyy-MM-dd") : "-"}
                            </span>
                          </div>
                        </TableCell>
<TableCell className="py-5 px-6">
                            {item.status === 'FINI' ? (
                              <Badge 
                                className="gap-1.5 font-bold py-1 px-3 rounded-lg border"
                                style={{ backgroundColor: "#ecfdf5", color: "#059669", borderColor: "#d1fae5" }}
                              >
                                <CheckCircle2 size={12} />
                                مكتمل
                              </Badge>
                            ) : (
                              <Badge 
                                className="gap-1.5 font-bold py-1 px-3 rounded-lg border"
                                style={{ backgroundColor: "#fffbeb", color: "#d97706", borderColor: "#fef3c7" }}
                              >
                                <Clock size={12} />
                                قيد التنفيذ
                              </Badge>
                            )}
                          </TableCell>
                        <TableCell className="py-5 px-8">
                          <div className="flex items-center justify-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 rounded-lg text-[#64748B] hover:text-primary hover:bg-primary/10 transition-all"
                              onClick={() => handleView(item)}
                              title="عرض"
                            >
                              <Eye size={18} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 rounded-lg text-[#64748B] hover:text-amber-600 hover:bg-amber-50 transition-all"
                              onClick={() => handlePrint(item)}
                              title="طباعة"
                            >
                              <Printer size={18} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 rounded-lg text-[#64748B] hover:text-blue-600 hover:bg-blue-50 transition-all"
                              onClick={() => handleEdit(item)}
                              title="تعديل"
                            >
                              <Edit size={18} />
                            </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-[#64748B] hover:bg-[#F7F9FC] dark:hover:bg-[#313D4A]">
                                <MoreVertical size={18} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 p-2 dark:bg-[#24303F] dark:border-[#2E3A47]">
                              <DropdownMenuItem className="gap-3 h-10 rounded-lg cursor-pointer dark:text-white flex-row-reverse text-right">
                                <Download size={16} className="text-[#64748B]" />
                                <span className="text-sm font-bold">تحميل البيانات</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-3 h-10 rounded-lg cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600 flex-row-reverse text-right"
                                onClick={() => handleDeleteClick(item)}
                              >
                                <Trash2 size={16} />
                                <span className="text-sm font-bold">حذف السجل</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
        </Table>
      </div>
      
      <div className="p-6 md:p-8 border-t border-[#E2E8F0] dark:border-[#2E3A47] flex items-center justify-between flex-row-reverse">
         <p className="text-sm font-bold text-[#64748B]">
           عرض {(meta.page - 1) * meta.limit + 1} - {Math.min(meta.page * meta.limit, meta.total)} من أصل {meta.total} سجل
         </p>
         <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-10 px-4 rounded-xl border-[#E2E8F0] dark:border-[#2E3A47] font-bold text-[#64748B]" 
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              السابق
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-10 px-4 rounded-xl border-[#E2E8F0] dark:border-[#2E3A47] font-bold text-[#1C2434] dark:text-white hover:bg-[#F7F9FC] dark:hover:bg-[#313D4A]" 
              disabled={currentPage >= meta.totalPages || loading}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              التالي
            </Button>
         </div>
      </div>

      {/* View Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 border-none shadow-2xl rounded-2xl font-cairo bg-[#F7F8FA]" dir="rtl">
          <DialogHeader className="p-6 pb-4 bg-white border-b border-[#E2E8F0] sticky top-0 z-10 flex flex-row items-center justify-between">
            <div className="text-right space-y-1">
              <DialogTitle className="text-xl font-black text-[#1C2434]">تفاصيل السجل {selectedSeizure?.ordinalFull}</DialogTitle>
              <DialogDescription className="text-sm font-bold text-[#8A99AF]">عرض البيانات الكاملة ومعلومات التدقيق</DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 bg-white space-y-8">
            {selectedSeizure && (
              <>
                {/* Section 1: Registration Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-primary rounded-full"></div>
                    <h4 className="text-base font-black text-[#1C2434]">بيانات التسجيل الأساسية</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-6 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                    <div className="space-y-1">
                      <Label className="text-[#8A99AF] font-bold text-xs">تاريخ التسجيل</Label>
                      <p className="font-black text-[#1C2434]">{format(new Date(selectedSeizure.registrationDate), "yyyy-MM-dd")}</p>
                    </div>
                      <div className="space-y-1">
                        <Label className="text-[#8A99AF] font-bold text-xs">الرقم الموافق</Label>
                        <p className="font-black text-[#1C2434]">{selectedSeizure.matchingNumber}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[#8A99AF] font-bold text-xs">حالة السجل</Label>
<div className="flex items-center gap-2">
                            {selectedSeizure.status === 'FINI' ? (
                              <Badge 
                                className="font-bold border"
                                style={{ backgroundColor: "#ecfdf5", color: "#059669", borderColor: "#d1fae5" }}
                              >مكتمل</Badge>
                            ) : (
                              <Badge 
                                className="font-bold border"
                                style={{ backgroundColor: "#fffbeb", color: "#d97706", borderColor: "#fef3c7" }}
                              >قيد التنفيذ</Badge>
                            )}
                          </div>
                      </div>
                      <div className="col-span-2 space-y-1 border-t border-[#E2E8F0] pt-3 mt-1">
                        <Label className="text-[#8A99AF] font-bold text-xs">اسم الحائز والمعلومات الكاملة</Label>
                        <p className="font-bold text-[#1C2434] leading-relaxed break-words whitespace-pre-wrap">{selectedSeizure.possessorInfo}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Court Clerk Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
                      <h4 className="text-base font-black text-[#1C2434]">بيانات كتابة الضبط</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-6 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                      <div className="space-y-1">
                        <Label className="text-[#8A99AF] font-bold text-xs">رقم كتابة الضبط</Label>
                        <p className="font-black text-[#1C2434] break-words">{selectedSeizure.courtClerkNumber}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[#8A99AF] font-bold text-xs">تاريخ كتابة الضبط</Label>
                        <p className="font-black text-[#1C2434]">{selectedSeizure.courtClerkDate ? format(new Date(selectedSeizure.courtClerkDate), "yyyy-MM-dd") : "غير مسجل"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Seizures Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-1 rounded-full" style={{ backgroundColor: "#f59e0b" }}></div>
                      <h4 className="text-base font-black text-[#1C2434]">تفاصيل المحجوزات</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-6 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                      <div className="space-y-1">
                        <Label className="text-[#8A99AF] font-bold text-xs">المحجوزات العادية</Label>
                        <p className="font-bold text-[#1C2434] break-words whitespace-pre-wrap">{selectedSeizure.regularSeizures || "لا يوجد"}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-red-500 font-bold text-xs">المحجوزات الثمينة</Label>
                        <p className="font-black text-red-600 break-words whitespace-pre-wrap">{selectedSeizure.preciousSeizures || "لا يوجد"}</p>
                      </div>
                      <div className="col-span-2 space-y-1 border-t border-[#E2E8F0] pt-3 mt-1">
                        <Label className="text-[#8A99AF] font-bold text-xs">شكل المحجوزات</Label>
                        <p className="font-bold text-[#1C2434] break-words whitespace-pre-wrap">{selectedSeizure.seizuresShape || "غير محدد"}</p>
                      </div>
                    </div>
                  </div>

                {/* Section 4: Delivery and Audit */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1 rounded-full" style={{ backgroundColor: "#10b981" }}></div>
                    <h4 className="text-base font-black text-[#1C2434]">التسليم والبيانات النهائية</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                    <div className="space-y-1">
                      <Label className="text-[#8A99AF] font-bold text-xs">تسليم ذوي الحقوق</Label>
                      <p className="font-bold text-sm">{selectedSeizure.deliveryRightsHoldersDate ? format(new Date(selectedSeizure.deliveryRightsHoldersDate), "yyyy-MM-dd") : "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[#8A99AF] font-bold text-xs">تسليم أملاك الدولة</Label>
                      <p className="font-bold text-sm">{selectedSeizure.deliveryStatePropertyDate ? format(new Date(selectedSeizure.deliveryStatePropertyDate), "yyyy-MM-dd") : "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[#8A99AF] font-bold text-xs">قائمة أملاك الدولة</Label>
                      <p className="font-bold text-sm">{selectedSeizure.statePropertyListNumber ? `#${selectedSeizure.statePropertyListNumber}` : "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[#8A99AF] font-bold text-xs">محضر الإتلاف</Label>
                      <p className="font-bold text-sm">{selectedSeizure.destructionMinutesDate ? format(new Date(selectedSeizure.destructionMinutesDate), "yyyy-MM-dd") : "-"}</p>
                    </div>
                  </div>
                </div>

                {/* Audit Info Section */}
                <div className="bg-[#1C2434] text-white p-6 rounded-2xl space-y-4 shadow-xl">
                   <div className="flex items-center gap-3 mb-2">
                     <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                     <h4 className="text-sm font-black uppercase tracking-widest text-[#8A99AF]">سجل العمليات</h4>
                   </div>
                   <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-1">
                        <p className="text-[#8A99AF] text-[10px] font-bold uppercase">تم الإنشاء بواسطة</p>
                        <p className="text-sm font-black">{selectedSeizure.createdBy.fullName}</p>
                        <p className="text-[10px] text-[#8A99AF]">{format(new Date(selectedSeizure.registrationDate), "yyyy-MM-dd HH:mm")}</p>
                     </div>
                     {selectedSeizure.updatedBy && (
                       <div className="space-y-1 border-r border-white/10 pr-6">
                          <p className="text-primary text-[10px] font-bold uppercase">آخر تعديل بواسطة</p>
                          <p className="text-sm font-black">{selectedSeizure.updatedBy.fullName}</p>
                          <p className="text-[10px] text-[#8A99AF]">قام بتحديث البيانات الأساسية</p>
                       </div>
                     )}
                   </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="p-6 bg-white border-t border-[#E2E8F0] sticky bottom-0 z-10">
            <Button 
              type="button" 
              onClick={() => setIsViewOpen(false)} 
              className="w-full h-12 bg-[#1C2434] hover:bg-[#2E3A47] text-white font-black rounded-xl transition-all"
            >
              إغلاق النافذة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-6xl w-[95vw] max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 border-none shadow-2xl rounded-2xl font-cairo bg-[#F7F8FA]" dir="rtl">
          <DialogHeader className="p-6 pb-4 bg-white border-b border-[#E2E8F0] sticky top-0 z-10 flex flex-row items-center justify-between">
            <div className="text-right space-y-1">
              <DialogTitle className="text-xl font-black text-[#1C2434]">تعديل السجل {selectedSeizure?.ordinalFull}</DialogTitle>
              <DialogDescription className="text-sm font-bold text-[#8A99AF]">تحديث بيانات السجل في سجل المحجوزات</DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 bg-white">
            <form id="edit-form" onSubmit={handleUpdate} className="space-y-8">
              {/* Section 1: Registration Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-primary rounded-full"></div>
                  <h4 className="text-base font-black text-[#1C2434]">بيانات التسجيل الأساسية</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-[#1C2434] mr-1">تاريخ التسجيل <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A99AF] pointer-events-none" />
                      <Input 
                        type="date" 
                        value={editFormData.registrationDate || ""}
                        onChange={(e) => setEditFormData({...editFormData, registrationDate: e.target.value})}
                        className="pl-10 h-11 border-[#E2E8F0] rounded-xl focus-visible:ring-primary/20 font-bold"
                        required
                      />
                    </div>
                  </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-[#1C2434] mr-1">الرقم الموافق <span className="text-red-500">*</span></Label>
                      <Input 
                        value={editFormData.matchingNumber || ""}
                        onChange={(e) => setEditFormData({...editFormData, matchingNumber: e.target.value})}
                        placeholder="أدخل الرقم الموافق"
                        className="h-11 border-[#E2E8F0] rounded-xl focus-visible:ring-primary/20 font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-[#1C2434] mr-1">حالة السجل <span className="text-red-500">*</span></Label>
                      <Select 
                        value={editFormData.status || "EN_COURS"} 
                        onValueChange={(value) => setEditFormData({...editFormData, status: value as 'EN_COURS' | 'FINI'})}
                      >
                        <SelectTrigger className="h-11 border-[#E2E8F0] rounded-xl focus:ring-primary/20 font-bold">
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                        <SelectContent className="font-cairo">
                          <SelectItem value="EN_COURS" className="font-bold">قيد التنفيذ</SelectItem>
                          <SelectItem value="FINI" className="font-bold">مكتمل</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label className="text-sm font-bold text-[#1C2434] mr-1">اسم الحائز والمعلومات الكاملة <span className="text-red-500">*</span></Label>
                    <Textarea 
                      value={editFormData.possessorInfo || ""}
                      onChange={(e) => setEditFormData({...editFormData, possessorInfo: e.target.value})}
                      placeholder="أدخل تفاصيل الحائز..."
                      className="min-h-[100px] border-[#E2E8F0] rounded-xl focus-visible:ring-primary/20 font-bold p-4"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-[#F1F5F9]"></div>

              {/* Section 2: Court Clerk Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
                  <h4 className="text-base font-black text-[#1C2434]">بيانات كتابة الضبط</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-[#1C2434] mr-1">رقم كتابة الضبط</Label>
                    <Input 
                      value={editFormData.courtClerkNumber || ""}
                      onChange={(e) => setEditFormData({...editFormData, courtClerkNumber: e.target.value})}
                      placeholder="00/00"
                      className="h-11 border-[#E2E8F0] rounded-xl focus-visible:ring-primary/20 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-[#1C2434] mr-1">تاريخ كتابة الضبط</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A99AF] pointer-events-none" />
                      <Input 
                        type="date"
                        value={editFormData.courtClerkDate || ""}
                        onChange={(e) => setEditFormData({...editFormData, courtClerkDate: e.target.value})}
                        className="pl-10 h-11 border-[#E2E8F0] rounded-xl focus-visible:ring-primary/20 font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-[#F1F5F9]"></div>

              {/* Section 3: Seizures Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 rounded-full" style={{ backgroundColor: "#f59e0b" }}></div>
                  <h4 className="text-base font-black text-[#1C2434]">تفاصيل المحجوزات</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-[#1C2434] mr-1">المحجوزات العادية</Label>
                    <Textarea 
                      value={editFormData.regularSeizures || ""}
                      onChange={(e) => setEditFormData({...editFormData, regularSeizures: e.target.value})}
                      placeholder="وصف المحجوزات العادية..."
                      className="min-h-[80px] border-[#E2E8F0] rounded-xl focus-visible:ring-primary/20 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-red-600 mr-1">المحجوزات الثمينة</Label>
                    <Textarea 
                      value={editFormData.preciousSeizures || ""}
                      onChange={(e) => setEditFormData({...editFormData, preciousSeizures: e.target.value})}
                      placeholder="وصف المحجوزات الثمينة..."
                      className="min-h-[80px] border-red-100 bg-red-50/30 rounded-xl focus-visible:ring-red-200 font-bold text-red-700"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label className="text-sm font-bold text-[#1C2434] mr-1">شكل المحجوزات</Label>
                    <Input 
                      value={editFormData.seizuresShape || ""}
                      onChange={(e) => setEditFormData({...editFormData, seizuresShape: e.target.value})}
                      placeholder="مثال: طرد، صندوق، مغلف..."
                      className="h-11 border-[#E2E8F0] rounded-xl focus-visible:ring-primary/20 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-[#F1F5F9]"></div>

              {/* Section 4: Delivery and State Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 rounded-full" style={{ backgroundColor: "#10b981" }}></div>
                  <h4 className="text-base font-black text-[#1C2434]">التسليم وأملاك الدولة</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-[#1C2434] mr-1">تاريخ التسليم لذوي الحقوق</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A99AF] pointer-events-none" />
                      <Input 
                        type="date"
                        value={editFormData.deliveryRightsHoldersDate || ""}
                        onChange={(e) => setEditFormData({...editFormData, deliveryRightsHoldersDate: e.target.value})}
                        className="pl-10 h-11 border-[#E2E8F0] rounded-xl focus-visible:ring-primary/20 font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-[#1C2434] mr-1">تاريخ التسليم لأملاك الدولة</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A99AF] pointer-events-none" />
                      <Input 
                        type="date"
                        value={editFormData.deliveryStatePropertyDate || ""}
                        onChange={(e) => setEditFormData({...editFormData, deliveryStatePropertyDate: e.target.value})}
                        className="pl-10 h-11 border-[#E2E8F0] rounded-xl focus-visible:ring-primary/20 font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-[#1C2434] mr-1">رقم قائمة أملاك الدولة</Label>
                    <Input 
                      value={editFormData.statePropertyListNumber || ""}
                      onChange={(e) => setEditFormData({...editFormData, statePropertyListNumber: e.target.value})}
                      placeholder="000"
                      className="h-11 border-[#E2E8F0] rounded-xl focus-visible:ring-primary/20 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-[#1C2434] mr-1">تاريخ قائمة أملاك الدولة</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A99AF] pointer-events-none" />
                      <Input 
                        type="date"
                        value={editFormData.statePropertyListDate || ""}
                        onChange={(e) => setEditFormData({...editFormData, statePropertyListDate: e.target.value})}
                        className="pl-10 h-11 border-[#E2E8F0] rounded-xl focus-visible:ring-primary/20 font-bold"
                      />
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label className="text-sm font-bold text-[#1C2434] mr-1">تاريخ محضر الإتلاف</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A99AF] pointer-events-none" />
                      <Input 
                        type="date"
                        value={editFormData.destructionMinutesDate || ""}
                        onChange={(e) => setEditFormData({...editFormData, destructionMinutesDate: e.target.value})}
                        className="pl-10 h-11 border-[#E2E8F0] rounded-xl focus-visible:ring-primary/20 font-bold w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-[#F1F5F9]"></div>

              {/* Section 5: Notes */}
              <div className="space-y-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-slate-400 rounded-full"></div>
                  <h4 className="text-base font-black text-[#1C2434]">ملاحظات إضافية</h4>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-[#1C2434] mr-1">ملاحظات</Label>
                  <Textarea 
                    value={editFormData.notes || ""}
                    onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                    placeholder="أي ملاحظات إضافية حول هذا السجل..."
                    className="min-h-[80px] border-[#E2E8F0] rounded-xl focus-visible:ring-primary/20 font-bold p-4"
                  />
                </div>
              </div>
            </form>
          </div>

          <DialogFooter className="p-6 bg-[#F7F8FA] border-t border-[#E2E8F0] flex flex-row gap-3 sticky bottom-0 z-10">
            <Button 
              type="submit" 
              form="edit-form"
              disabled={isSubmitting} 
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? <Loader2 className="animate-spin ml-2 h-5 w-5" /> : <Save className="ml-2 h-5 w-5" />}
              حفظ التعديلات
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsEditOpen(false)} 
              className="flex-1 h-12 border-[#E2E8F0] bg-white text-[#64748B] font-black rounded-xl hover:bg-gray-50 transition-all"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="font-cairo" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right font-black">هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription className="text-right font-bold">
              سيتم حذف السجل رقم ({selectedSeizure?.ordinalFull}) نهائياً من النظام. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2 sm:justify-start">
<AlertDialogAction 
                onClick={confirmDelete} 
                className="font-black text-white"
                style={{ backgroundColor: "#dc2626" }}
                disabled={isSubmitting}
              >
              {isSubmitting ? "جاري الحذف..." : "نعم، احذف السجل"}
            </AlertDialogAction>
            <AlertDialogCancel className="font-black">إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Export Dialog */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent className="max-w-md w-[95vw] border-none shadow-2xl rounded-2xl font-cairo bg-white p-0 overflow-hidden" dir="rtl">
          <DialogHeader className="p-6 pb-4 bg-white border-b border-[#E2E8F0]">
            <div className="text-right space-y-1">
              <DialogTitle className="text-xl font-black text-[#1C2434]">تصدير البيانات إلى CSV</DialogTitle>
              <DialogDescription className="text-sm font-bold text-[#8A99AF]">اختر معايير التصفية لتصدير البيانات المطلوبة</DialogDescription>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon size={16} className="text-primary" />
                <h4 className="text-sm font-black text-[#1C2434]">التصفية حسب التاريخ</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#64748B] mr-1">من تاريخ</Label>
                  <Input 
                    type="date"
                    value={exportFilters.dateStart}
                    onChange={(e) => setExportFilters({...exportFilters, dateStart: e.target.value})}
                    className="h-10 border-[#E2E8F0] rounded-xl focus:ring-primary/20 font-bold text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#64748B] mr-1">إلى تاريخ</Label>
                  <Input 
                    type="date"
                    value={exportFilters.dateEnd}
                    onChange={(e) => setExportFilters({...exportFilters, dateEnd: e.target.value})}
                    className="h-10 border-[#E2E8F0] rounded-xl focus:ring-primary/20 font-bold text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-[#F1F5F9]"></div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Filter size={16} className="text-primary" />
                <h4 className="text-sm font-black text-[#1C2434]">التصفية حسب الرقم الترتيبي</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#64748B] mr-1">من الرقم</Label>
                  <Input 
                    type="number"
                    placeholder="مثال: 1"
                    value={exportFilters.ordinalStart}
                    onChange={(e) => setExportFilters({...exportFilters, ordinalStart: e.target.value})}
                    className="h-10 border-[#E2E8F0] rounded-xl focus:ring-primary/20 font-bold text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#64748B] mr-1">إلى الرقم</Label>
                  <Input 
                    type="number"
                    placeholder="مثال: 100"
                    value={exportFilters.ordinalEnd}
                    onChange={(e) => setExportFilters({...exportFilters, ordinalEnd: e.target.value})}
                    className="h-10 border-[#E2E8F0] rounded-xl focus:ring-primary/20 font-bold text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-[#F7F8FA] border-t border-[#E2E8F0] flex flex-row gap-3">
<Button 
                onClick={handleExport}
                disabled={isSubmitting}
                className="flex-1 h-12 text-white font-black rounded-xl transition-all active:scale-[0.98]"
                style={{ backgroundColor: "#059669", boxShadow: "0 10px 15px -3px rgba(5, 150, 105, 0.2)" }}
              >
                {isSubmitting ? <Loader2 className="animate-spin ml-2 h-5 w-5" /> : <Download className="ml-2 h-5 w-5" />}
                تأكيد التصدير
              </Button>
            <Button 
              variant="outline"
              onClick={() => setIsExportOpen(false)}
              className="flex-1 h-12 border-[#E2E8F0] bg-white text-[#64748B] font-black rounded-xl"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
