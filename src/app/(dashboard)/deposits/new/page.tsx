"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  Calendar, 
  User, 
  Hash,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface Seizure {
  id: number;
  ordinalFull: string;
  registrationDate: string;
  matchingNumber: string;
  possessorInfo: string;
}

export default function NewDepositPage() {
  const [step, setStep] = useState(1);
  const [seizures, setSeizures] = useState<Seizure[]>([]);
  const [selectedSeizure, setSelectedSeizure] = useState<Seizure | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    depositNumber: "",
    depositMontant: "",
    depositDescription: "",
    depositedBy: "",
  });

  useEffect(() => {
    fetchSeizures();
  }, []);

  async function fetchSeizures() {
    setLoading(true);
    try {
      const response = await fetch("/api/seizures/en-cours");
      if (response.ok) {
        const data = await response.json();
        setSeizures(data);
      }
    } catch (error) {
      toast.error("خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  }

  const filteredSeizures = seizures.filter(s => 
    s.ordinalFull.includes(search) || 
    s.possessorInfo.includes(search) || 
    s.matchingNumber.includes(search)
  );

  const handleSelectSeizure = (seizure: Seizure) => {
    setSelectedSeizure(seizure);
    setStep(2);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeizure) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          seizureId: selectedSeizure.id,
        }),
      });

      if (response.ok) {
        toast.success("تم تسجيل الإيداع بنجاح");
        setStep(3);
      } else {
        const error = await response.json();
        toast.error(error.error || "خطأ في الحفظ");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-[#1C2434] dark:text-white tracking-tight">تسجيل إيداع جديد</h1>
        <p className="text-[#8A99AF] font-medium">قم باختيار المحجوز أولاً ثم أدخل بيانات الإيداع</p>
      </div>

      {/* Stepper Header */}
      <div className="flex items-center justify-between px-4 max-w-2xl mx-auto">
        {[1, 2].map((i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${
                step === i ? "bg-[#3C50E0] border-[#3C50E0] text-white scale-110 shadow-lg" : 
                step > i ? "bg-[#10B981] border-[#10B981] text-white" : 
                "bg-white dark:bg-[#24303F] border-slate-200 dark:border-slate-700 text-slate-400"
              }`}>
                {step > i ? <CheckCircle2 size={20} /> : i}
              </div>
              <span className={`text-xs font-black uppercase tracking-wider ${
                step === i ? "text-[#3C50E0]" : "text-[#8A99AF]"
              }`}>
                {i === 1 ? "اختيار المحجوز" : "بيانات الإيداع"}
              </span>
            </div>
            {i === 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${step > 1 ? "bg-[#10B981]" : "bg-slate-200 dark:bg-slate-700"}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-black">قائمة المحجوزات قيد التنفيذ</CardTitle>
                    <CardDescription>اختر المحجوز الذي ترغب بربط الإيداع به</CardDescription>
                  </div>
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      placeholder="بحث برقم السجل أو الاسم..." 
                      className="pl-10 h-11 rounded-xl"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-12 text-center text-slate-400 font-medium">جاري التحميل...</div>
                ) : filteredSeizures.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                      <AlertCircle size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-600 dark:text-slate-300 text-lg">لا توجد محجوزات حالياً</p>
                      <p className="text-slate-400">جميع المحجوزات تم تسويتها أو لا توجد بيانات مطابقة للبحث</p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredSeizures.map((seizure) => (
                      <div 
                        key={seizure.id} 
                        className="p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                        onClick={() => handleSelectSeizure(seizure)}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-3">
                              <div className="bg-[#3C50E0]/10 text-[#3C50E0] px-4 py-1.5 rounded-full text-sm font-black">
                                {seizure.ordinalFull}
                              </div>
                              <div className="flex items-center gap-2 text-[#8A99AF] text-sm font-medium">
                                <Calendar size={14} />
                                {format(new Date(seizure.registrationDate), 'yyyy/MM/dd')}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-start gap-3">
                                <User className="text-slate-400 mt-1" size={18} />
                                <div>
                                  <p className="text-xs text-slate-400 font-bold uppercase">بيانات الحائز</p>
                                  <p className="text-[#1C2434] dark:text-white font-bold">{seizure.possessorInfo}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <Hash className="text-slate-400 mt-1" size={18} />
                                <div>
                                  <p className="text-xs text-slate-400 font-bold uppercase">رقم المباشرة</p>
                                  <p className="text-[#1C2434] dark:text-white font-bold">{seizure.matchingNumber}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            className="rounded-xl group-hover:bg-[#3C50E0] group-hover:text-white group-hover:border-[#3C50E0] transition-all gap-2"
                          >
                            <span>اختيار</span>
                            <ArrowLeft size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 2 && selectedSeizure && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Seizure Summary Card */}
            <Card className="border-none shadow-sm bg-[#3C50E0]/5 dark:bg-[#3C50E0]/10 border-r-4 border-[#3C50E0]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#24303F] flex items-center justify-center text-[#3C50E0] shadow-sm">
                      <FileText size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-[#3C50E0] font-black uppercase">المحجوز المختار</p>
                      <h3 className="text-xl font-black text-[#1C2434] dark:text-white">{selectedSeizure.ordinalFull} - {selectedSeizure.possessorInfo}</h3>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setStep(1)}
                    className="text-[#3C50E0] hover:bg-[#3C50E0]/10 gap-2"
                  >
                    <ArrowRight size={18} />
                    <span>تغيير المحجوز</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Deposit Form */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>بيانات الإيداع</CardTitle>
                <CardDescription>يرجى تعبئة كافة الحقول الإلزامية لتسجيل الإيداع</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-black text-sm text-slate-600 dark:text-slate-400">رقم الإيداع <span className="text-red-500">*</span></Label>
                      <Input 
                        name="depositNumber"
                        required
                        value={formData.depositNumber}
                        onChange={handleFormChange}
                        placeholder="مثال: DEP-2026-001"
                        className="h-12 rounded-xl border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#3C50E0]/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-sm text-slate-600 dark:text-slate-400">مبلغ الإيداع (درهم) <span className="text-red-500">*</span></Label>
                      <Input 
                        name="depositMontant"
                        type="number"
                        step="0.01"
                        required
                        value={formData.depositMontant}
                        onChange={handleFormChange}
                        placeholder="0.00"
                        className="h-12 rounded-xl border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#3C50E0]/20"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="font-black text-sm text-slate-600 dark:text-slate-400">أودع من طرف <span className="text-red-500">*</span></Label>
                      <Input 
                        name="depositedBy"
                        required
                        value={formData.depositedBy}
                        onChange={handleFormChange}
                        placeholder="الاسم الكامل للمودع"
                        className="h-12 rounded-xl border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#3C50E0]/20"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="font-black text-sm text-slate-600 dark:text-slate-400">ملاحظات / وصف</Label>
                      <Textarea 
                        name="depositDescription"
                        rows={4}
                        value={formData.depositDescription}
                        onChange={handleFormChange}
                        placeholder="أي تفاصيل إضافية حول الإيداع..."
                        className="rounded-xl border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#3C50E0]/20"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setStep(1)}
                      className="h-12 px-8 rounded-xl"
                    >
                      إلغاء
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      className="h-12 px-12 rounded-xl bg-[#3C50E0] hover:bg-[#2D3BB1] text-white font-black transition-all shadow-lg shadow-[#3C50E0]/20"
                    >
                      {submitting ? "جاري الحفظ..." : "تأكيد وحفظ الإيداع"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <Card className="border-none shadow-xl overflow-hidden text-center py-12 px-6">
              <div className="w-24 h-24 bg-[#10B981]/10 text-[#10B981] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={64} />
              </div>
              <CardTitle className="text-2xl font-black mb-2">تم التسجيل بنجاح!</CardTitle>
              <CardDescription className="text-lg mb-8">تم ربط الإيداع بالمحجوز بنجاح وتسجيله في النظام.</CardDescription>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => {
                    setStep(1);
                    setFormData({
                      depositNumber: "",
                      depositMontant: "",
                      depositDescription: "",
                      depositedBy: "",
                    });
                    setSelectedSeizure(null);
                    fetchSeizures();
                  }}
                  className="h-12 rounded-xl bg-[#3C50E0] hover:bg-[#2D3BB1]"
                >
                  تسجيل إيداع آخر
                </Button>
                <Button 
                  variant="outline" 
                  asChild
                  className="h-12 rounded-xl"
                >
                  <a href="/">العودة للرئيسية</a>
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
