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
  Plus,
  Scale,
  Printer
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from 'next/navigation';
import { AlternativePenalty, Meta } from "@/types";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import { AlternativePenaltyForm } from "@/components/AlternativePenaltyForm";

export function AlternativePenaltiesList() {
  const router = useRouter();
  const [data, setData] = useState<AlternativePenalty[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Modal states
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AlternativePenalty | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: debouncedSearch,
      });
      
      const response = await fetch(`/api/alternative-penalties?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const result = await response.json();
      setData(result.data);
      setMeta(result.meta);
    } catch (error) {
      toast.error("حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا السجل؟")) return;
    
    try {
      const response = await fetch(`/api/alternative-penalties/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      
      toast.success("تم الحذف بنجاح");
      fetchData();
    } catch (error) {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const handlePrint = (item: AlternativePenalty) => {
    window.open(`/alternative-penalties/${item.id}/print`, '_blank');
  };

  const openView = (item: AlternativePenalty) => {
    setSelectedItem(item);
    setIsViewOpen(true);
  };

  const openEdit = (item: AlternativePenalty) => {
    // Format dates for the form
    const formattedItem = {
      ...item,
      judgment_date: item.judgment_date ? new Date(item.judgment_date) : null,
      prosecution_referral_date: item.prosecution_referral_date ? new Date(item.prosecution_referral_date) : null,
      execution_decision_date: item.execution_decision_date ? new Date(item.execution_decision_date) : null,
      report_received_date: item.report_received_date ? new Date(item.report_received_date) : null,
      dispute_date: item.dispute_date ? new Date(item.dispute_date) : null,
      final_decision_date: item.final_decision_date ? new Date(item.final_decision_date) : null,
      appeal_deadline: item.appeal_deadline ? new Date(item.appeal_deadline) : null,
      notification_date: item.notification_date ? new Date(item.notification_date) : null,
    };
    setSelectedItem(formattedItem as any);
    setIsEditOpen(true);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="bg-white dark:bg-[#24303F] shadow-sm rounded-2xl overflow-hidden border border-[#E2E8F0] dark:border-[#2E3A47]" dir="rtl">
        {/* View Modal */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-4xl p-0 border-none shadow-2xl font-cairo" dir="rtl">
            <DialogHeader className="sr-only">
              <DialogTitle>تفاصيل العقوبة البديلة</DialogTitle>
            </DialogHeader>
            <div className="max-h-[90vh] overflow-y-auto custom-scrollbar bg-white dark:bg-[#24303F] rounded-2xl">
              {selectedItem && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="bg-gradient-to-l from-emerald-600 to-emerald-500 p-6 text-white rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-100 text-sm font-bold mb-1">الرقم الترتيبي</p>
                        <p className="text-2xl font-black">{selectedItem.ordinal_full || `${selectedItem.serial_number}/${selectedItem.year || new Date().getFullYear()}`}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-emerald-100 text-sm font-bold mb-1">المحكوم عليه</p>
                        <p className="text-xl font-black">{selectedItem.full_name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6 space-y-5">
                    {/* بيانات المحكوم عليه */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                      <h4 className="font-black text-sm text-blue-600 mb-3 flex items-center gap-2">
                        <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                        بيانات المحكوم عليه
                      </h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 font-medium">الاسم الكامل</p>
                          <p className="font-bold text-slate-800 dark:text-white">{selectedItem.full_name || '---'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 font-medium">رقم البطاقة</p>
                          <p className="font-bold text-slate-800 dark:text-white">{selectedItem.national_id || '---'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 font-medium">العنوان</p>
                          <p className="font-bold text-slate-800 dark:text-white">{selectedItem.address_contact || '---'}</p>
                        </div>
                      </div>
                    </div>

                    {/* البيانات القضائية */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                      <h4 className="font-black text-sm text-purple-600 mb-3 flex items-center gap-2">
                        <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                        البيانات القضائية
                      </h4>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 font-medium">المحكمة</p>
                          <p className="font-bold text-slate-800 dark:text-white">{selectedItem.source_court || '---'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 font-medium">رقم القضية</p>
                          <p className="font-bold text-slate-800 dark:text-white">{selectedItem.case_number || '---'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 font-medium">رقم الحكم</p>
                          <p className="font-bold text-slate-800 dark:text-white">{selectedItem.judgment_number || '---'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 font-medium">تاريخ الحكم</p>
                          <p className="font-bold text-slate-800 dark:text-white">{selectedItem.judgment_date ? format(new Date(selectedItem.judgment_date), 'yyyy-MM-dd') : '---'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 font-medium">نوع الجريمة</p>
                          <p className="font-bold text-slate-800 dark:text-white">{selectedItem.crime_type || '---'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 font-medium">العقوبة الأصلية</p>
                          <p className="font-bold text-slate-800 dark:text-white">{selectedItem.original_penalty_type || '---'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 font-medium">مدة العقوبة</p>
                          <p className="font-bold text-slate-800 dark:text-white">{selectedItem.original_penalty_duration || '---'}</p>
                        </div>
                      </div>
                    </div>

                    {/* تفاصيل العقوبة البديلة */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                      <h4 className="font-black text-sm text-emerald-600 mb-3 flex items-center gap-2">
                        <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                        تفاصيل العقوبة البديلة
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 font-medium">نوع العقوبة البديلة</p>
                          <p className="font-bold text-emerald-600">{selectedItem.alternative_penalty_type || '---'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 font-medium">المؤسسة المشرفة</p>
                          <p className="font-bold text-slate-800 dark:text-white">{selectedItem.supervising_institution || '---'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-slate-500 font-medium">التفاصيل</p>
                          <p className="font-bold text-slate-800 dark:text-white">{selectedItem.alternative_penalty_details || '---'}</p>
                        </div>
                      </div>
                    </div>

                    {/* المقررات التنفيذية */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                      <h4 className="font-black text-sm text-orange-600 mb-3 flex items-center gap-2">
                        <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                        المقررات التنفيذية
                      </h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 font-medium">تاريخ الإحالة</p>
                          <p className="font-bold text-slate-800 dark:text-white">{selectedItem.prosecution_referral_date ? format(new Date(selectedItem.prosecution_referral_date), 'yyyy-MM-dd') : '---'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 font-medium">رقم قرار التنفيذ</p>
                          <p className="font-bold text-slate-800 dark:text-white">{selectedItem.execution_decision_number || '---'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 font-medium">تاريخ قرار التنفيذ</p>
                          <p className="font-bold text-slate-800 dark:text-white">{selectedItem.execution_decision_date ? format(new Date(selectedItem.execution_decision_date), 'yyyy-MM-dd') : '---'}</p>
                        </div>
                        <div className="col-span-3">
                          <p className="text-slate-500 font-medium">مضمون القرار</p>
                          <p className="font-bold text-slate-800 dark:text-white">{selectedItem.execution_decision_content || '---'}</p>
                        </div>
                      </div>
                    </div>

                    {/* التقارير والمتابعة */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                      <h4 className="font-black text-sm text-cyan-600 mb-3 flex items-center gap-2">
                        <div className="w-1 h-4 bg-cyan-500 rounded-full"></div>
                        التقارير والمتابعة
                      </h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 font-medium">تاريخ استلام التقرير</p>
                          <p className="font-bold text-slate-800 dark:text-white">{selectedItem.report_received_date ? format(new Date(selectedItem.report_received_date), 'yyyy-MM-dd') : '---'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 font-medium">الجهة المسؤولة</p>
                          <p className="font-bold text-slate-800 dark:text-white">{selectedItem.responsible_authority || '---'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 font-medium">ملاحظات الامتثال</p>
                          <p className="font-bold text-slate-800 dark:text-white">{selectedItem.compliance_notes || '---'}</p>
                        </div>
                      </div>
                    </div>

                    {/* القرار النهائي */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                      <h4 className="font-black text-sm text-green-600 mb-3 flex items-center gap-2">
                        <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                        القرار النهائي
                      </h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 font-medium">تاريخ القرار النهائي</p>
                          <p className="font-bold text-slate-800 dark:text-white">{selectedItem.final_decision_date ? format(new Date(selectedItem.final_decision_date), 'yyyy-MM-dd') : '---'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 font-medium">أجل الطعن</p>
                          <p className="font-bold text-slate-800 dark:text-white">{selectedItem.appeal_deadline ? format(new Date(selectedItem.appeal_deadline), 'yyyy-MM-dd') : '---'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 font-medium">تاريخ التبليغ</p>
                          <p className="font-bold text-slate-800 dark:text-white">{selectedItem.notification_date ? format(new Date(selectedItem.notification_date), 'yyyy-MM-dd') : '---'}</p>
                        </div>
                      </div>
                    </div>

                    {/* ملاحظات القاضي */}
                    {selectedItem.judge_notes && (
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                        <h4 className="font-black text-sm text-indigo-600 mb-3 flex items-center gap-2">
                          <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                          ملاحظات القاضي
                        </h4>
                        <p className="font-bold text-slate-800 dark:text-white text-sm">{selectedItem.judge_notes}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <Button 
                        onClick={() => {
                          setIsViewOpen(false);
                          openEdit(selectedItem);
                        }}
                        variant="outline"
                        className="font-bold px-6 h-11 rounded-xl gap-2"
                      >
                        <Edit size={16} />
                        تعديل
                      </Button>
                      <Button 
                        onClick={() => handlePrint(selectedItem)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 h-11 rounded-xl gap-2"
                      >
                        <Printer size={16} />
                        طباعة
                      </Button>
                      <Button 
                        onClick={() => setIsViewOpen(false)}
                        variant="ghost"
                        className="font-bold px-6 h-11 rounded-xl"
                      >
                        إغلاق
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-5xl p-0 border-none bg-transparent shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>تعديل العقوبة البديلة</DialogTitle>
          </DialogHeader>
          <div className="max-h-[90vh] overflow-y-auto custom-scrollbar p-1">
            {selectedItem && (
              <AlternativePenaltyForm 
                initialData={selectedItem as any} 
                onSuccess={() => {
                  setIsEditOpen(false);
                  fetchData();
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="p-6 md:p-8 border-b border-[#E2E8F0] dark:border-[#2E3A47] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-right">
          <h3 className="text-xl font-black text-[#1C2434] dark:text-white mb-1">سجل العقوبات البديلة</h3>
          <p className="text-sm font-medium text-[#8A99AF]">متابعة تنفيذ العقوبات البديلة</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            onClick={() => window.print()}
            variant="outline"
            className="h-11 px-6 rounded-xl border-[#E2E8F0] dark:border-[#2E3A47] gap-2 font-bold"
          >
            <Printer size={18} />
            طباعة اللائحة
          </Button>

          <Button 
            onClick={() => router.push('/alternative-penalties/new')}
            className="h-11 px-6 rounded-xl bg-[#10B981] text-white gap-2 font-bold hover:bg-[#10B981]/90"
          >
            <Plus size={18} />
            تسجيل عقوبة
          </Button>

          <div className="relative w-full md:w-64 group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8A99AF]" />
            <Input 
              placeholder="بحث بالاسم أو رقم البطاقة..." 
              className="pr-12 bg-[#F7F9FC] dark:bg-[#313D4A] border-none h-11 text-sm font-bold text-right"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto print:overflow-visible">
        <Table className="print:text-black">
          <TableHeader className="bg-[#F7F9FC] dark:bg-[#313D4A]">
            <TableRow>
              <TableHead className="text-right py-5 px-8 text-xs font-black uppercase whitespace-nowrap">الرقم الترتيبي</TableHead>
              <TableHead className="text-right py-5 px-6 text-xs font-black uppercase whitespace-nowrap">الاسم الكامل</TableHead>
              <TableHead className="text-right py-5 px-6 text-xs font-black uppercase whitespace-nowrap">رقم البطاقة</TableHead>
              <TableHead className="text-right py-5 px-6 text-xs font-black uppercase whitespace-nowrap">المحكمة</TableHead>
              <TableHead className="text-right py-5 px-6 text-xs font-black uppercase whitespace-nowrap">نوع العقوبة</TableHead>
              <TableHead className="text-center py-5 px-8 text-xs font-black uppercase whitespace-nowrap print:hidden">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={6} className="py-8 px-8"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-40 text-center text-[#8A99AF] font-bold">لا توجد سجلات</TableCell></TableRow>
            ) : (
                data.map((item) => (
                  <TableRow key={item.id} className="border-b hover:bg-[#F7F9FC] dark:hover:bg-[#313D4A]/50 transition-colors">
                    <TableCell className="py-5 px-8">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-black bg-[#10B981]/10 text-[#10B981]">
                        {item.ordinal_full || `${item.serial_number}/${item.year || new Date().getFullYear()}`}
                      </span>
                    </TableCell>
                  <TableCell className="py-5 px-6 font-bold">{item.full_name}</TableCell>
                  <TableCell className="py-5 px-6 font-bold text-[#64748B]">{item.national_id}</TableCell>
                  <TableCell className="py-5 px-6 text-[#64748B] font-bold">{item.source_court}</TableCell>
                  <TableCell className="py-5 px-6 font-bold text-[#64748B]">{item.alternative_penalty_type}</TableCell>
                  <TableCell className="py-5 px-8 print:hidden">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          onClick={() => openView(item)}
                          variant="ghost" size="icon" className="h-9 w-9 text-[#64748B] hover:text-blue-600"
                        >
                          <Eye size={18} />
                        </Button>
                        <Button 
                          onClick={() => openEdit(item)}
                          variant="ghost" size="icon" className="h-9 w-9 text-[#64748B] hover:text-emerald-600"
                        >
                          <Edit size={18} />
                        </Button>
                        <Button 
                          onClick={() => handlePrint(item)}
                          variant="ghost" size="icon" className="h-9 w-9 text-[#64748B] hover:text-orange-600"
                        >
                          <Printer size={18} />
                        </Button>
                        <Button 
                          onClick={() => handleDelete(item.id)}
                          variant="ghost" size="icon" className="h-9 w-9 text-[#64748B] hover:text-red-600"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="p-6 md:p-8 border-t border-[#E2E8F0] dark:border-[#2E3A47] flex items-center justify-between flex-row-reverse">
          <p className="text-sm font-bold text-[#64748B]">
            عرض {data.length > 0 ? (meta.page - 1) * meta.limit + 1 : 0} - {Math.min(meta.page * meta.limit, meta.total)} من أصل {meta.total} سجل
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
      </div>
    );
  }
