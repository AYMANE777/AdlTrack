import React from "react";
import { CorrespondenceList } from "@/components/CorrespondenceList";
import { getSeizures } from "@/lib/seizures";
import { Seizure } from "@/types";

export default async function ListPage() {
  const { data, meta } = await getSeizures(1, 10);
  
  const formattedData = data.map(s => ({
    ...s,
    registrationDate: s.registrationDate.toISOString(),
    courtClerkDate: s.courtClerkDate?.toISOString() || null,
    deliveryRightsHoldersDate: s.deliveryRightsHoldersDate?.toISOString() || null,
    deliveryStatePropertyDate: s.deliveryStatePropertyDate?.toISOString() || null,
    statePropertyListDate: s.statePropertyListDate?.toISOString() || null,
    destructionMinutesDate: s.destructionMinutesDate?.toISOString() || null,
  })) as unknown as Seizure[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2 text-[#1C2434] dark:text-white">قائمة المحجوزات</h1>
        <p className="text-[#8A99AF] font-bold text-lg">عرض وإدارة كافة السجلات المسجلة في النظام.</p>
      </div>
      <CorrespondenceList initialData={formattedData} initialMeta={meta} />
    </div>
  );
}
