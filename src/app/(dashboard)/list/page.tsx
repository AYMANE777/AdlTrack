import { CorrespondenceList } from "@/components/CorrespondenceList";

export default function ListPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2 text-[#1C2434] dark:text-white">قائمة المحجوزات</h1>
        <p className="text-[#8A99AF] font-bold text-lg">عرض وإدارة كافة السجلات المسجلة في النظام.</p>
      </div>
      <CorrespondenceList />
    </div>
  );
}
