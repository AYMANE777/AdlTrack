"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Search, Eye, Edit, Trash2, Plus, FileDown, Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from 'next/navigation';
import { RehabilitationRequestRapport, Meta } from "@/types";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { RehabilitationRequestRapportForm } from "@/components/RehabilitationRequestRapportForm";

export function RehabilitationRequestRapportList() {
  const router = useRouter();
  const [data, setData] = useState<RehabilitationRequestRapport[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RehabilitationRequestRapport | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: debouncedSearch,
      });
      
      const response = await fetch(`/api/rehabilitation-requests-rapport?${params.toString()}`);
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
    if (!confirm("هل أنت متأكد من حذف هذا التقرير؟")) return;
    try {
      const response = await fetch(`/api/rehabilitation-requests-rapport/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      toast.success("تم الحذف بنجاح");
      fetchData();
    } catch (error) {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const openView = (item: RehabilitationRequestRapport) => {
    setSelectedItem(item);
    setIsViewOpen(true);
  };

  const openDownloadSelection = (item: RehabilitationRequestRapport) => {
    setSelectedItem(item);
    setIsDownloadOpen(true);
  };

  const handleGenerateDocx = async (item: RehabilitationRequestRapport, template: string = 'standard') => {
    try {
      toast.loading("جاري إنشاء الوثيقة...", { id: `docx-${item.id}` });
      const response = await fetch(`/api/rehabilitation-requests-rapport/${item.id}/generate?template=${template === '688' ? '688' : 'standard'}`);
      if (!response.ok) throw new Error('Failed to generate document');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const disposition = response.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename\*=UTF-8''(.+)/);
      a.download = match ? decodeURIComponent(match[1]) : `تقرير_رد_الاعتبار_${item.ordinalFull}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("تم تحميل الوثيقة بنجاح", { id: `docx-${item.id}` });
      setIsDownloadOpen(false);
    } catch (error) {
      toast.error("حدث خطأ أثناء إنشاء الوثيقة", { id: `docx-${item.id}` });
    }
  };

  const openEdit = (item: RehabilitationRequestRapport) => {
    const formattedItem = {
      ...item,
      date_naissance: new Date(item.date_naissance),
      date_de_faire: new Date(item.date_de_faire),
      date: new Date(item.date),
    };
    setSelectedItem(formattedItem as any);
    setIsEditOpen(true);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="bg-white dark:bg-[#24303F] shadow-sm rounded-2xl overflow-hidden border border-[#E2E8F0] dark:border-[#2E3A47]" dir="rtl">
      {/* View Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl font-cairo" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#1C2434] dark:text-white border-b pb-4 mb-4">
              تفاصيل تقرير رد الاعتبار: {selectedItem?.FullName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-6 p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl space-y-3">
                  <h4 className="font-black text-blue-600 mb-2">معلومات صاحب التقرير</h4>
                  <div className="flex justify-between border-b pb-2"><span className="font-bold text-slate-500">الاسم الكامل:</span> <span className="font-black">{selectedItem.FullName}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="font-bold text-slate-500">ابن (الأب):</span> <span className="font-black">{selectedItem.fils_de_pere}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="font-bold text-slate-500">ابن (الأم):</span> <span className="font-black">{selectedItem.fils_de_mere}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="font-bold text-slate-500">تاريخ الازدياد:</span> <span className="font-black">{format(new Date(selectedItem.date_naissance), 'yyyy-MM-dd')}</span></div>
                  <div className="flex justify-between"><span className="font-bold text-slate-500">العنوان:</span> <span className="font-black">{selectedItem.adresse || "—"}</span></div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl space-y-3">
                  <h4 className="font-black text-emerald-600 mb-2">معلومات التقرير</h4>
                  <div className="flex justify-between border-b pb-2"><span className="font-bold text-slate-500">الرقم الترتيبي:</span> <span className="font-black">{selectedItem.ordinalFull}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="font-bold text-slate-500">رقم الملف:</span> <span className="font-black">{selectedItem.num_dossier}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="font-bold text-slate-500">المحكمة:</span> <span className="font-black">{selectedItem.tribunal}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="font-bold text-slate-500">المدينة:</span> <span className="font-black">{selectedItem.ville}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="font-bold text-slate-500">تاريخ الواقعة:</span> <span className="font-black">{format(new Date(selectedItem.date_de_faire), 'yyyy-MM-dd')}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="font-bold text-slate-500">التاريخ:</span> <span className="font-black">{format(new Date(selectedItem.date), 'yyyy-MM-dd')}</span></div>
                  <div className="flex justify-between"><span className="font-bold text-slate-500">الحالة:</span> 
                    <Badge className={cn("font-bold", 
                      selectedItem.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-700" :
                      selectedItem.status === 'REJECTED' ? "bg-red-100 text-red-700" :
                      "bg-amber-100 text-amber-700"
                    )}>
                      {selectedItem.status === 'COMPLETED' ? "مكتمل" : 
                       selectedItem.status === 'REJECTED' ? "مرفوض" : 
                       selectedItem.status === 'IN_PROGRESS' ? "قيد المعالجة" : "قيد الانتظار"}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedItem.autre_condition && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl space-y-2">
                  <h4 className="font-black text-slate-700 dark:text-slate-300">شروط أخرى</h4>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border min-h-[80px] font-bold text-slate-600 dark:text-slate-400">
                    {selectedItem.autre_condition}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  onClick={() => setIsViewOpen(false)}
                  variant="outline"
                  className="font-black rounded-xl h-12 px-6"
                >
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Download Selection Modal */}
      <Dialog open={isDownloadOpen} onOpenChange={setIsDownloadOpen}>
        <DialogContent className="max-w-md font-cairo text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-[#1C2434] dark:text-white border-b pb-4 mb-2">
              اختر نموذج التقرير للتحميل
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedItem && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
                <h4 className="text-xs font-black text-slate-400 uppercase mb-2">مراجعة البيانات</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">الاسم:</span> <span className="font-bold">{selectedItem.FullName}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">رقم الملف:</span> <span className="font-bold">{selectedItem.num_dossier}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">الرقم الترتيبي:</span> <span className="font-bold">{selectedItem.ordinalFull}</span></div>
                </div>
              </div>
            )}
            
            <p className="text-sm font-bold text-slate-500 mb-4">
              يرجى اختيار النموذج الذي ترغب في استخدامه لإنشاء تقرير رد الاعتبار:
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              <Button 
                onClick={() => selectedItem && handleGenerateDocx(selectedItem, 'standard')}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-1 border-2 hover:border-blue-600 hover:bg-blue-50/50 group transition-all rounded-2xl"
              >
                <span className="font-black text-lg group-hover:text-blue-700">النموذج العادي</span>
                <span className="text-xs font-bold text-slate-400">rehabilitation_requests_rapport</span>
              </Button>
              
              <Button 
                onClick={() => selectedItem && handleGenerateDocx(selectedItem, '688')}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-1 border-2 hover:border-purple-600 hover:bg-purple-50/50 group transition-all rounded-2xl"
              >
                <span className="font-black text-lg group-hover:text-purple-700">النموذج 688</span>
                <span className="text-xs font-bold text-slate-400">rehabilitation_requests_rapport_688</span>
              </Button>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button 
                onClick={() => setIsDownloadOpen(false)}
                variant="ghost"
                className="font-bold text-slate-500"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl p-0 border-none bg-transparent shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>تعديل تقرير رد الاعتبار</DialogTitle>
          </DialogHeader>
          <div className="max-h-[90vh] overflow-y-auto custom-scrollbar p-1">
            {selectedItem && (
              <RehabilitationRequestRapportForm 
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
          <h3 className="text-xl font-black text-[#1C2434] dark:text-white mb-1">تقارير رد الاعتبار</h3>
          <p className="text-sm font-medium text-[#8A99AF]">متابعة ومعالجة تقارير رد الاعتبار المسجلة</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            onClick={() => router.push('/rehabilitation-requests-rapport/new')}
            className="h-11 px-6 rounded-xl bg-[#3C50E0] text-white gap-2 font-bold hover:bg-[#3C50E0]/90"
          >
            <Plus size={18} />
            تقرير جديد
          </Button>

          <div className="relative w-full md:w-64 group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8A99AF]" />
            <Input 
              placeholder="بحث بالرقم أو الاسم..." 
              className="pr-12 bg-[#F7F9FC] dark:bg-[#313D4A] border-none h-11 text-sm font-bold text-right"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#F7F9FC] dark:bg-[#313D4A]">
            <TableRow>
              <TableHead className="text-right py-5 px-8 text-xs font-black uppercase whitespace-nowrap">الرقم الترتيبي</TableHead>
              <TableHead className="text-right py-5 px-6 text-xs font-black uppercase whitespace-nowrap">رقم الملف</TableHead>
              <TableHead className="text-right py-5 px-6 text-xs font-black uppercase whitespace-nowrap">الاسم الكامل</TableHead>
              <TableHead className="text-right py-5 px-6 text-xs font-black uppercase whitespace-nowrap">المحكمة</TableHead>
              <TableHead className="text-right py-5 px-6 text-xs font-black uppercase whitespace-nowrap">المدينة</TableHead>
              <TableHead className="text-right py-5 px-6 text-xs font-black uppercase whitespace-nowrap">الحالة</TableHead>
              <TableHead className="text-center py-5 px-8 text-xs font-black uppercase whitespace-nowrap">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={7} className="py-8 px-8"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="h-40 text-center text-[#8A99AF] font-bold">لا توجد سجلات</TableCell></TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id} className="border-b hover:bg-[#F7F9FC] dark:hover:bg-[#313D4A]/50 transition-colors">
                  <TableCell className="py-5 px-8">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-black bg-[#3C50E0]/10 text-[#3C50E0]">
                      {item.ordinalFull}
                    </span>
                  </TableCell>
                  <TableCell className="py-5 px-6 font-bold text-[#64748B]">{item.num_dossier}</TableCell>
                  <TableCell className="py-5 px-6 font-bold">{item.FullName}</TableCell>
                  <TableCell className="py-5 px-6 font-bold text-[#64748B]">{item.tribunal}</TableCell>
                  <TableCell className="py-5 px-6 font-bold text-[#64748B]">{item.ville}</TableCell>
                  <TableCell className="py-5 px-6">
                    <Badge className={cn("font-bold px-3 py-1", 
                      item.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-700" :
                      item.status === 'REJECTED' ? "bg-red-100 text-red-700" :
                      "bg-amber-100 text-amber-700"
                    )}>
                      {item.status === 'COMPLETED' ? "مكتمل" : 
                       item.status === 'REJECTED' ? "مرفوض" : 
                       item.status === 'IN_PROGRESS' ? "قيد المعالجة" : "قيد الانتظار"}
                    </Badge>
                  </TableCell>
                    <TableCell className="py-5 px-8">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            onClick={() => openDownloadSelection(item)}
                            variant="ghost" size="icon" className="h-9 w-9 text-[#64748B] hover:text-purple-600"
                            title="تحميل وثيقة Word"
                          >
                            <FileDown size={18} />
                          </Button>
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
            variant="outline" size="sm" 
            className="h-10 px-4 rounded-xl border-[#E2E8F0] dark:border-[#2E3A47] font-bold text-[#64748B]" 
            disabled={currentPage <= 1 || loading}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            السابق
          </Button>
          <Button 
            variant="outline" size="sm" 
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
