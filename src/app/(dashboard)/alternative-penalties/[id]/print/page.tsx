"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { Scale } from "lucide-react";

export default function PrintAlternativePenaltyPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/alternative-penalties/${id}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const result = await response.json();
        setData(result);
        
        // Trigger print after data is loaded and rendered
        setTimeout(() => {
          window.print();
        }, 500);
      } catch (error) {
        toast.error("حدث خطأ أثناء جلب البيانات");
      }
    }
    fetchData();
  }, [id]);

  if (!data) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
      <div className="p-12 max-w-4xl mx-auto space-y-10 font-cairo bg-white text-black" dir="rtl">
        <div className="text-center space-y-4 border-b-2 border-black pb-8">
          <h1 className="text-3xl font-black">المملكة المغربية</h1>
          <h2 className="text-2xl font-bold">وزارة العدل</h2>
          <h3 className="text-xl font-bold">سجل العقوبات البديلة</h3>
          <p className="text-lg font-bold">الرقم الترتيبي: {data.ordinal_full || `${data.serial_number}/${data.year || new Date().getFullYear()}`}</p>
        </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="col-span-2 bg-gray-50 p-4 border border-black">
          <h4 className="font-black text-lg mb-4 underline">بيانات المحكوم عليه:</h4>
          <div className="grid grid-cols-2 gap-4">
            <p><strong>الاسم الكامل:</strong> {data.full_name}</p>
            <p><strong>رقم البطاقة:</strong> {data.national_id}</p>
            <p className="col-span-2"><strong>العنوان:</strong> {data.address_contact}</p>
          </div>
        </div>

        <div className="col-span-2 bg-gray-50 p-4 border border-black">
          <h4 className="font-black text-lg mb-4 underline">البيانات القضائية:</h4>
          <div className="grid grid-cols-2 gap-4">
            <p><strong>المحكمة:</strong> {data.source_court}</p>
            <p><strong>رقم القضية:</strong> {data.case_number}</p>
            <p><strong>رقم الحكم:</strong> {data.judgment_number}</p>
            <p><strong>تاريخ الحكم:</strong> {data.judgment_date ? format(new Date(data.judgment_date), "yyyy-MM-dd") : "-"}</p>
            <p className="col-span-2"><strong>نوع الجريمة:</strong> {data.crime_type}</p>
          </div>
        </div>

        <div className="col-span-2 bg-gray-50 p-4 border border-black">
          <h4 className="font-black text-lg mb-4 underline">تفاصيل العقوبة البديلة:</h4>
          <div className="grid grid-cols-2 gap-4">
            <p><strong>نوع العقوبة:</strong> {data.alternative_penalty_type}</p>
            <p><strong>المؤسسة المشرفة:</strong> {data.supervising_institution}</p>
            <p className="col-span-2"><strong>ملاحظات:</strong> {data.judge_notes}</p>
          </div>
        </div>
      </div>

      <div className="mt-20 flex justify-between px-10">
        <div className="text-center">
          <p className="font-bold underline">توقيع الموظف</p>
        </div>
        <div className="text-center">
          <p className="font-bold underline">خاتم الإدارة</p>
        </div>
      </div>

      <style jsx global>{`
        @page {
          size: auto;
          margin: 20mm;
        }
        @media print {
          body { background: white; }
          .no-print { display: none; }
        }
      `}</style>
    </div>
  );
}
