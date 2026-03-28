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
  Edit, 
  History,
  Save,
  Loader2,
  Calendar as CalendarIcon,
  X
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
import { Label } from "@/components/ui/label";
import { useAuth } from '@/context/AuthContext';
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface PrivateDepoAcc {
  id: number;
  accountNumber: string;
  month: number;
  year: number;
  totalAmount: number;
  depositsCount: number;
  printedAt: string;
  printedBy: string | null;
  notes: string | null;
  updatedAt: string;
}

interface AuditLog {
  id: number;
  action: string;
  oldData: any;
  newData: any;
  performedBy: {
    fullName: string;
  };
  performedAt: string;
}

const months = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

export function PrivateDepoAccList() {
  const [data, setData] = useState<PrivateDepoAcc[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  
  const [selectedRecord, setSelectedRecord] = useState<PrivateDepoAcc | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<AuditLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAccountNumber, setNewAccountNumber] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (yearFilter) params.append('year', yearFilter);
      
      const response = await fetch(`/api/private-depo-acc?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const result = await response.json();
      setData(result);
    } catch (error) {
      toast.error("حدث خطأ أثناء جلب البيانات");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [yearFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (record: PrivateDepoAcc) => {
    if (user?.role !== 'ADMIN') {
      toast.error("عذراً، فقط المسؤول يمكنه تعديل رقم الحساب");
      return;
    }
    setSelectedRecord(record);
    setNewAccountNumber(record.accountNumber);
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !user) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/private-depo-acc/${selectedRecord.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountNumber: newAccountNumber,
          performedById: user.id,
          role: user.role
        }),
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update');
      }
      
      toast.success("تم تحديث رقم الحساب بنجاح");
      setIsEditOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء التحديث");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchHistory = async (record: PrivateDepoAcc) => {
    setSelectedRecord(record);
    setIsHistoryOpen(true);
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/audit-logs?tableName=PrivateDepoAcc&recordId=${record.id}`);
      if (!response.ok) throw new Error('Failed to fetch history');
      const result = await response.json();
      setHistory(result.logs || []);
    } catch (error) {
      toast.error("حدث خطأ أثناء جلب سجل التعديلات");
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredData = data.filter(item => 
    item.accountNumber.includes(searchTerm) || 
    months[item.month - 1].includes(searchTerm) ||
    item.printedBy?.includes(searchTerm)
  );

  return (
    <div className="bg-white dark:bg-[#24303F] shadow-sm rounded-2xl overflow-hidden border border-[#E2E8F0] dark:border-[#2E3A47]" dir="rtl">
      <div className="p-6 md:p-8 border-b border-[#E2E8F0] dark:border-[#2E3A47] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-right">
          <h3 className="text-xl font-black text-[#1C2434] dark:text-white mb-1">سجل الحسابات الخصوصية</h3>
          <p className="text-sm font-medium text-[#8A99AF]">متابعة وتدقيق أرقام الحسابات الخصوصية المطبوعة</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full md:w-64 group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8A99AF] group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="بحث بالحساب، الشهر، أو المستخدم..." 
              className="pr-12 bg-[#F7F9FC] dark:bg-[#313D4A] border-none h-11 text-sm font-bold text-[#1C2434] dark:text-white rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 text-right"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative w-full md:w-32 group">
            <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8A99AF] group-focus-within:text-primary transition-colors pointer-events-none" />
            <Input 
              placeholder="السنة"
              className="pr-12 bg-[#F7F9FC] dark:bg-[#313D4A] border-none h-11 text-sm font-bold text-[#1C2434] dark:text-white rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 text-right"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            />
          </div>

          {(searchTerm || yearFilter) && (
            <Button 
              variant="ghost" 
              onClick={() => {setSearchTerm(''); setYearFilter('');}}
              className="h-11 px-4 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 gap-2 font-bold"
            >
              <X size={18} />
              مسح
            </Button>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#F7F9FC] dark:bg-[#313D4A]">
            <TableRow className="border-none">
              <TableHead className="text-right py-5 px-8 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">السنة / الشهر</TableHead>
              <TableHead className="text-right py-5 px-6 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">رقم الحساب الخصوصي</TableHead>
              <TableHead className="text-right py-5 px-6 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">عدد الإيداعات</TableHead>
              <TableHead className="text-right py-5 px-6 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">المجموع (درهم)</TableHead>
              <TableHead className="text-right py-5 px-6 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">تمت الطباعة بواسطة</TableHead>
              <TableHead className="text-right py-5 px-6 text-xs font-black text-[#1C2434] dark:text-white uppercase tracking-widest whitespace-nowrap">تاريخ الطباعة</TableHead>
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
                  <p className="text-[#8A99AF] font-bold">لا توجد سجلات مطابقة</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => (
                <TableRow key={item.id} className="border-b border-[#E2E8F0] dark:border-[#2E3A47] hover:bg-[#F7F9FC] dark:hover:bg-[#313D4A]/50 transition-colors">
                  <TableCell className="py-5 px-8">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-black bg-primary/10 text-primary">
                      {item.year} / {months[item.month - 1]}
                    </span>
                  </TableCell>
                  <TableCell className="py-5 px-6 whitespace-nowrap">
                    <span className="text-sm font-black text-[#1C2434] dark:text-white">
                      {item.accountNumber}
                    </span>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <span className="text-sm font-bold text-[#64748B] dark:text-[#AEB7C0]">
                      {item.depositsCount}
                    </span>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <span className="text-sm font-black text-emerald-600">
                      {item.totalAmount.toLocaleString()} درهم
                    </span>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <span className="text-sm font-bold text-[#64748B] dark:text-[#AEB7C0]">
                      {item.printedBy || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <span className="text-sm font-bold text-[#64748B] dark:text-[#AEB7C0]">
                      {format(new Date(item.printedAt), "yyyy-MM-dd HH:mm")}
                    </span>
                  </TableCell>
                  <TableCell className="py-5 px-8">
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-lg text-[#64748B] hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => handleEdit(item)}
                        disabled={user?.role !== 'ADMIN'}
                        title="تعديل رقم الحساب"
                      >
                        <Edit size={18} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-lg text-[#64748B] hover:text-amber-600 hover:bg-amber-50"
                        onClick={() => fetchHistory(item)}
                        title="سجل التعديلات"
                      >
                        <History size={18} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Account Number Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="font-cairo" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right font-black">تعديل رقم الحساب الخصوصي</DialogTitle>
            <DialogDescription className="text-right font-bold">
              تعديل رقم الحساب لتقرير شهر {selectedRecord && months[selectedRecord.month - 1]} سنة {selectedRecord?.year}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="font-bold">رقم الحساب الجديد</Label>
              <Input 
                value={newAccountNumber}
                onChange={(e) => setNewAccountNumber(e.target.value)}
                className="font-black text-lg h-12"
                required
              />
            </div>
            <DialogFooter className="flex-row-reverse gap-2 mt-6">
              <Button type="submit" disabled={isSubmitting} className="font-black h-11 px-8">
                {isSubmitting ? <Loader2 className="animate-spin ml-2 h-4 w-4" /> : <Save className="ml-2 h-4 w-4" />}
                حفظ التعديل
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="font-black h-11">إلغاء</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-2xl font-cairo" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right font-black">سجل تعديلات الحساب</DialogTitle>
            <DialogDescription className="text-right font-bold">
              عرض كافة العمليات التي تمت على هذا السجل
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto space-y-4 mt-4">
            {loadingHistory ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
            ) : history.length === 0 ? (
              <p className="text-center py-8 text-[#8A99AF] font-bold">لا توجد تعديلات سابقة</p>
            ) : (
              history.map((log) => (
                <div key={log.id} className="p-4 bg-slate-50 dark:bg-[#1A2233] rounded-xl border border-[#E2E8F0] dark:border-[#2E3A47] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-sm text-primary">{log.performedBy.fullName}</span>
                    <span className="text-xs text-[#8A99AF] font-bold">{format(new Date(log.performedAt), "yyyy-MM-dd HH:mm")}</span>
                  </div>
                  <div className="text-xs font-bold text-[#64748B]">
                    تم تغيير رقم الحساب من <span className="text-red-500 line-through">{(log.oldData as any)?.accountNumber}</span> إلى <span className="text-emerald-600 font-black">{(log.newData as any)?.accountNumber}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setIsHistoryOpen(false)} className="w-full font-black h-11 mt-4">إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
