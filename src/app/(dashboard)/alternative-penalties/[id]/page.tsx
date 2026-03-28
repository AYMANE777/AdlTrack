"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Printer, ArrowRight, Scale, User, Gavel, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ViewAlternativePenaltyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/alternative-penalties/${id}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const result = await response.json();
        setData(result);
      } catch (error) {
        toast.error("حدث خطأ أثناء جلب البيانات");
        router.push("/alternative-penalties");
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
        <Button onClick={handlePrint} className="gap-2 font-bold bg-[#10B981] hover:bg-[#10B981]/90">
          <Printer size={18} />
          طباعة السجل
        </Button>
      </div>

      <div className="bg-white dark:bg-[#24303F] shadow-sm rounded-[2rem] overflow-hidden border border-[#E2E8F0] dark:border-[#2E3A47] print:border-none print:shadow-none">
        <div className="bg-[#10B981] p-8 text-white text-center relative">
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg mb-2">
              <Scale className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-3xl font-black mb-0">سجل العقوبات البديلة</h4>
            <p className="text-emerald-100/80 font-bold text-lg">تفاصيل العقوبة البديلة للمحكوم عليه</p>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          {/* Section 1: Personal Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-r-4 border-[#10B981] pr-4">
              <User className="text-[#10B981]" size={24} />
              <h5 className="text-xl font-black text-[#1C2434] dark:text-white">البيانات التعريفية للمحكوم عليه</h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#F7F9FC] dark:bg-[#313D4A] p-6 rounded-2xl">
              <DetailItem label="الاسم الكامل" value={data.full_name} />
              <DetailItem label="رقم البطاقة الوطنية" value={data.national_id} />
              <div className="md:col-span-2">
                <DetailItem label="العنوان والاتصال" value={data.address_contact} />
              </div>
            </div>
          </div>

          {/* Section 2: Judicial Data */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-r-4 border-[#10B981] pr-4">
              <Gavel className="text-[#10B981]" size={24} />
              <h5 className="text-xl font-black text-[#1C2434] dark:text-white">البيانات القضائية</h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-[#F7F9FC] dark:bg-[#313D4A] p-6 rounded-2xl">
              <DetailItem label="المحكمة المصدرة" value={data.source_court} />
              <DetailItem label="رقم القضية" value={data.case_number} />
              <DetailItem label="رقم الحكم" value={data.judgment_number} />
              <DetailItem label="تاريخ الحكم" value={data.judgment_date ? format(new Date(data.judgment_date), "yyyy-MM-dd") : "-"} />
              <DetailItem label="نوع الجريمة" value={data.crime_type} />
            </div>
          </div>

          {/* Section 3: Alternative Penalty Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-r-4 border-[#10B981] pr-4">
              <Scale className="text-[#10B981]" size={24} />
              <h5 className="text-xl font-black text-[#1C2434] dark:text-white">تفاصيل العقوبة البديلة</h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#F7F9FC] dark:bg-[#313D4A] p-6 rounded-2xl">
              <DetailItem label="نوع العقوبة البديلة" value={data.alternative_penalty_type} />
              <DetailItem label="المؤسسة المشرفة" value={data.supervising_institution} />
              <div className="md:col-span-2">
                <DetailItem label="ملاحظات إضافية" value={data.judge_notes} />
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
