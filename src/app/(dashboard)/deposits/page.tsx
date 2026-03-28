import React from "react";
import { DepositsList } from "@/components/DepositsList";

export default function DepositsRegistryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2 text-[#1C2434] dark:text-white">سجل الإيداعات</h1>
        <p className="text-[#8A99AF] font-bold text-lg">عرض وتدقيق كافة الإيداعات المالية المرتبطة بالمحجوزات.</p>
      </div>
      <DepositsList />
    </div>
  );
}
