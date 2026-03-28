import React from "react";
import { PrivateDepoAccList } from "@/components/PrivateDepoAccList";

export default function PrivateDepoAccPage() {
  return (
    <div className="space-y-8 font-cairo" dir="rtl">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2 text-[#1C2434] dark:text-white">سجل الحسابات الخصوصية</h1>
        <p className="text-[#8A99AF] font-bold text-lg">عرض وإدارة أرقام الحسابات الخصوصية للتقارير الشهرية.</p>
      </div>
      <PrivateDepoAccList />
    </div>
  );
}
