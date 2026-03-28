"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Printer, ArrowRight, FileText, User, CalendarIcon, BadgeInfo } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ViewRehabilitationRequestPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/rehabilitation-requests/${id}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const result = await response.json();
        setData(result);
      } catch (error) {
        toast.error("حدث خطأ أثناء جلب البيانات");
        router.push("/rehabilitation-requests");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, router]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64 mx-auto" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="py-6 max-w-5xl mx-auto space-y-8 font-cairo px-4" dir="rtl">
      <div className="flex items-center justify-between print:hidden">
        <Button variant="outline" onClick={() => router.back()} className="gap-2 font-bold">
          <ArrowRight size={18} />
          العودة للائحة
        </Button>
        <Button onClick={handlePrint} className="gap-2 font-bold bg-[#3C50E0] hover:bg-[#3C50E0]/90">
          <Printer size={18} />
          طباعة الطلب
        </Button>
      </div>

      <div className="bg-white dark:bg-[#24303F] shadow-sm rounded-[2rem] overflow-hidden border border-[#E2E8F0] dark:border-[#2E3A47] print:border-none print:shadow-none">
        <div className="bg-[#3C50E0] p-8 text-white text-center relative">
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg mb-2">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-3xl font-black mb-0">طلب رد الاعتبار</h4>
            <p className="text-blue-100/80 font-bold text-lg">تفاصيل ومعالجة ملف رد الاعتبار</p>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          {/* Section 1: Basic Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-r-4 border-[#3C50E0] pr-4">
              <User className="text-[#3C50E0]" size={24} />
              <h5 className="text-xl font-black text-[#1C2434] dark:text-white">بيانات صاحب الطلب</h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#F7F9FC] dark:bg-[#313D4A] p-6 rounded-2xl">
              <DetailItem label="الاسم الكامل" value={data.FullName} />
              <DetailItem label="رقم البطاقة الوطنية" value={data.cin} />
              <DetailItem label="رقم السجل" value={data.ordinalFull} />
              <DetailItem label="تاريخ الطلب" value={data.request_date ? format(new Date(data.request_date), "yyyy-MM-dd") : "-"} />
            </div>
          </div>

          {/* Section 2: Status */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-r-4 border-[#3C50E0] pr-4">
              <BadgeInfo className="text-[#3C50E0]" size={24} />
              <h5 className="text-xl font-black text-[#1C2434] dark:text-white">حالة ومعالجة الطلب</h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#F7F9FC] dark:bg-[#313D4A] p-6 rounded-2xl">
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#8A99AF]">حالة الطلب</p>
                <Badge className={cn("font-black text-lg px-4 py-1", 
                  data.request_status === 'COMPLETED' ? "bg-emerald-100 text-emerald-700" :
                  data.request_status === 'REJECTED' ? "bg-red-100 text-red-700" :
                  "bg-amber-100 text-amber-700"
                )}>
                  {data.request_status === 'COMPLETED' ? "مكتمل" : 
                   data.request_status === 'REJECTED' ? "مرفوض" : 
                   data.request_status === 'IN_PROGRESS' ? "قيد المعالجة" : "قيد الانتظار"}
                </Badge>
              </div>
              <DetailItem label="تاريخ إحالة النيابة" value={data.prosecution_inquiry_date ? format(new Date(data.prosecution_inquiry_date), "yyyy-MM-dd") : "-"} />
              <div className="md:col-span-2">
                <DetailItem label="ملاحظات" value={data.notes} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .rounded-\\[2rem\\] { border-radius: 0 !important; }
          .shadow-sm { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: any }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-bold text-[#8A99AF]">{label}</p>
      <p className="text-lg font-black text-[#1C2434] dark:text-white">{value || "-"}</p>
    </div>
  );
}
