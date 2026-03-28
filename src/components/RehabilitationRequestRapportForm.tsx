"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  FileText,
  Search,
  User,
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Scale,
  Hash,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface RehabRequest {
  id: number;
  ordinalFull: string;
  FullName: string;
  cin: string;
  request_date: string;
  request_status: string;
}

const formSchema = z.object({
  rehabilitationRequestId: z.number({ required_error: "يجب اختيار طلب رد الاعتبار" }),
  num_dossier: z.string().min(1, "رقم الملف مطلوب"),
  FullName: z.string().min(1, "الاسم الكامل مطلوب"),
  fils_de_pere: z.string().min(1, "اسم الأب مطلوب"),
  fils_de_mere: z.string().min(1, "اسم الأم مطلوب"),
  date_naissance: z.coerce.date({ invalid_type_error: "التاريخ غير صحيح" }),
  adresse: z.string().optional(),
  date_de_faire: z.coerce.date({ invalid_type_error: "التاريخ غير صحيح" }),
  tribunal: z.string().min(1, "المحكمة مطلوبة"),
  ville: z.string().min(1, "المدينة مطلوبة"),
  status: z.string().min(1, "الحالة مطلوبة"),
  autre_condition: z.string().optional(),
  date: z.coerce.date({ invalid_type_error: "التاريخ غير صحيح" }),
});

type FormValues = z.infer<typeof formSchema>;

interface RehabilitationRequestRapportFormProps {
  initialData?: FormValues & { id?: number };
  onSuccess?: () => void;
}

// ─── Step definitions ────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    title: "ربط الطلب",
    subtitle: "اختيار طلب رد الاعتبار",
    icon: Hash,
    fields: ["rehabilitationRequestId"] as (keyof FormValues)[],
  },
  {
    id: 2,
    title: "البيانات الشخصية",
    subtitle: "هوية صاحب التقرير",
    icon: User,
    fields: ["num_dossier", "FullName", "fils_de_pere", "fils_de_mere", "date_naissance"] as (keyof FormValues)[],
  },
  {
    id: 3,
    title: "بيانات القضية",
    subtitle: "المعلومات القضائية",
    icon: Scale,
    fields: ["tribunal", "ville", "date_de_faire", "date", "status"] as (keyof FormValues)[],
  },
  {
    id: 4,
    title: "العنوان والملاحظات",
    subtitle: "بيانات تكميلية",
    icon: MapPin,
    fields: ["adresse", "autre_condition"] as (keyof FormValues)[],
  },
];

// ─── Step Progress Bar ────────────────────────────────────────────────────────
function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="bg-white dark:bg-[#24303F] border-b border-slate-200 dark:border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between relative">
        {/* connector line */}
        <div className="absolute top-5 right-[2.5rem] left-[2.5rem] h-0.5 bg-slate-200 dark:bg-slate-700 z-0" />
        <div
          className="absolute top-5 right-[2.5rem] h-0.5 bg-[#3C50E0] z-0 transition-all duration-500"
          style={{ width: `calc(${((current - 1) / (total - 1)) * 100}% - 0rem)` }}
        />

        {STEPS.map((step) => {
          const done = current > step.id;
          const active = current === step.id;
          const Icon = step.icon;
          return (
            <div key={step.id} className="flex flex-col items-center z-10 gap-1.5 flex-1">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-black text-sm",
                  done && "bg-[#3C50E0] border-[#3C50E0] text-white shadow-md shadow-[#3C50E0]/30",
                  active && "bg-white dark:bg-[#24303F] border-[#3C50E0] text-[#3C50E0] shadow-md shadow-[#3C50E0]/20 scale-110",
                  !done && !active && "bg-white dark:bg-[#24303F] border-slate-300 dark:border-slate-600 text-slate-400"
                )}
              >
                {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
              </div>
              <div className="text-center hidden sm:block">
                <p className={cn(
                  "text-xs font-black leading-none",
                  active ? "text-[#3C50E0]" : done ? "text-[#3C50E0]/70" : "text-slate-400"
                )}>
                  {step.title}
                </p>
                <p className={cn(
                  "text-[10px] mt-0.5 leading-none",
                  active || done ? "text-slate-500" : "text-slate-400"
                )}>
                  {step.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile step label */}
      <div className="mt-3 sm:hidden text-center">
        <span className="text-xs font-black text-[#3C50E0]">
          الخطوة {current} من {total}: {STEPS[current - 1].title}
        </span>
      </div>
    </div>
  );
}

// ─── Date picker field ────────────────────────────────────────────────────────
function DatePickerField({
  field,
  inputClass,
}: {
  field: { value: Date; onChange: (v: Date) => void };
  inputClass: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full h-10 text-right text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1A2233] rounded-lg px-3 shadow-sm font-normal flex items-center justify-between hover:bg-slate-50",
            !field.value && "text-slate-400"
          )}
        >
          {field.value ? format(field.value, "yyyy-MM-dd") : <span>اختر التاريخ</span>}
          <CalendarIcon className="h-4 w-4 text-slate-400 mr-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
      </PopoverContent>
    </Popover>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function RehabilitationRequestRapportForm({
  initialData,
  onSuccess,
}: RehabilitationRequestRapportFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(1);
  const isEdit = !!initialData?.id;

  // Search state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [requests, setRequests] = React.useState<RehabRequest[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [selectedRequest, setSelectedRequest] = React.useState<RehabRequest | null>(null);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      rehabilitationRequestId: undefined,
      num_dossier: "",
      FullName: "",
      fils_de_pere: "",
      fils_de_mere: "",
      date_naissance: new Date(),
      adresse: "",
      date_de_faire: new Date(),
      tribunal: "",
      ville: "",
      status: "PENDING",
      autre_condition: "",
      date: new Date(),
    },
    mode: "onChange",
  });

  React.useEffect(() => {
    if (initialData) form.reset(initialData);
  }, [initialData, form]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 1) {
        setIsSearching(true);
        try {
          const res = await fetch(
            `/api/rehabilitation-requests?search=${encodeURIComponent(searchQuery)}&limit=20`
          );
          const data = await res.json();
          setRequests(data.data || []);
          setShowDropdown(true);
        } catch {
          setRequests([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setRequests([]);
        setShowDropdown(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  function handleSelectRequest(req: RehabRequest) {
    setSelectedRequest(req);
    setShowDropdown(false);
    setSearchQuery(req.FullName);
    form.setValue("rehabilitationRequestId", req.id);
    form.setValue("FullName", req.FullName);
    form.clearErrors("rehabilitationRequestId");
  }

  // Validate current step fields before advancing
  async function handleNext() {
    const stepFields = STEPS[currentStep - 1].fields;
    const valid = await form.trigger(stepFields);
    if (valid) setCurrentStep((s) => Math.min(s + 1, STEPS.length));
  }

  function handleBack() {
    setCurrentStep((s) => Math.max(s - 1, 1));
  }

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const url = initialData?.id
        ? `/api/rehabilitation-requests-rapport/${initialData.id}`
        : "/api/rehabilitation-requests-rapport";
      const method = initialData?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          [initialData?.id ? "updatedById" : "createdById"]: user?.id || 1,
        }),
      });

      if (!response.ok) throw new Error("Failed to save data");
      const data = await response.json();
      toast.success(
        initialData?.id
          ? "تم تحديث التقرير بنجاح"
          : `تم حفظ التقرير بنجاح (رقم: ${data.ordinalFull})`
      );

      if (onSuccess) {
        onSuccess();
      } else {
        if (!initialData?.id) form.reset();
        router.push("/rehabilitation-requests-rapport");
        router.refresh();
      }
    } catch {
      toast.error("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "h-10 text-right text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1A2233] rounded-lg px-3 shadow-sm focus:ring-2 focus:ring-[#3C50E0]/20 focus:border-[#3C50E0] transition-all";

  const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <FormLabel className="text-right block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1.5">
      {children}
      {required && <span className="text-red-500 mr-1">*</span>}
    </FormLabel>
  );

  return (
    <div className="w-full font-cairo" dir="rtl">

      {/* ── Compact Header ── */}
      <div className="bg-[#3C50E0] px-8 py-4 flex items-center gap-4">
        <div className="bg-white/15 p-2 rounded-lg border border-white/20 shrink-0">
          <FileText className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-black text-white leading-tight">
            {isEdit ? "تعديل تقرير رد الاعتبار" : "تقرير رد الاعتبار"}
          </h1>
          <p className="text-blue-200 text-xs font-medium mt-0.5">
            {isEdit ? "تحديث بيانات التقرير المسجل" : "تسجيل تقرير جديد لرد الاعتبار"}
          </p>
        </div>
        {!onSuccess && (
          <button
            type="button"
            onClick={() => router.back()}
            className="mr-auto flex items-center gap-1.5 text-blue-200 hover:text-white text-xs font-bold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            رجوع
          </button>
        )}
      </div>

      {/* ── Breadcrumb ── */}
      {!onSuccess && (
        <div className="bg-white dark:bg-[#24303F] border-b border-slate-100 dark:border-slate-700 px-8 py-2">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <span>الرئيسية</span>
            <ChevronLeft className="w-3 h-3" />
            <span>تقارير رد الاعتبار</span>
            <ChevronLeft className="w-3 h-3" />
            <span className="text-[#3C50E0] font-bold">
              {isEdit ? "تعديل" : "إضافة جديد"}
            </span>
          </nav>
        </div>
      )}

      {/* ── Step Progress Bar ── */}
      <StepBar current={currentStep} total={STEPS.length} />

      {/* ── Form Body ── */}
      <div className="bg-[#F7F9FC] dark:bg-[#1A2233] p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()}>

            {/* ════ STEP 1: Link to Request ════ */}
            {currentStep === 1 && (
              <div className="bg-white dark:bg-[#24303F] rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#3C50E0]/10 shrink-0">
                    <Hash className="w-4 h-4 text-[#3C50E0]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#1C2434] dark:text-white leading-none">ربط بطلب رد الاعتبار</h3>
                    <p className="text-xs text-slate-500 mt-0.5">اختر طلب رد الاعتبار المرتبط بهذا التقرير</p>
                  </div>
                </div>

                <div ref={dropdownRef} className="relative">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      className={cn(
                        "w-full h-11 text-right text-sm border bg-white dark:bg-[#1A2233] rounded-xl pr-9 pl-3 outline-none transition-all shadow-sm",
                        form.formState.errors.rehabilitationRequestId
                          ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                          : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#3C50E0]/20 focus:border-[#3C50E0]"
                      )}
                      placeholder="ابحث بالاسم أو رقم البطاقة أو الرقم الترتيبي..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (selectedRequest) {
                          setSelectedRequest(null);
                          form.setValue("rehabilitationRequestId", undefined as any);
                          form.setValue("FullName", "");
                        }
                      }}
                    />
                  </div>

                  {selectedRequest && (
                    <div className="mt-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center shrink-0">
                        <Check className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-emerald-800 dark:text-emerald-300 leading-none">
                          {selectedRequest.FullName}
                        </p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                          الرقم: {selectedRequest.ordinalFull} — ب.و.ت: {selectedRequest.cin}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRequest(null);
                          setSearchQuery("");
                          form.setValue("rehabilitationRequestId", undefined as any);
                          form.setValue("FullName", "");
                        }}
                        className="mr-auto text-xs text-red-400 hover:text-red-600 font-bold transition-colors"
                      >
                        تغيير
                      </button>
                    </div>
                  )}

                  {showDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#24303F] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-5 text-center text-sm text-slate-500">
                          <div className="w-5 h-5 border-2 border-[#3C50E0]/30 border-t-[#3C50E0] rounded-full animate-spin mx-auto mb-2" />
                          جاري البحث...
                        </div>
                      ) : requests.length === 0 ? (
                        <div className="p-5 text-center text-sm text-slate-500">لا توجد نتائج</div>
                      ) : (
                        requests.map((req) => (
                          <button
                            key={req.id}
                            type="button"
                            className="w-full text-right px-4 py-3 hover:bg-[#3C50E0]/5 dark:hover:bg-[#3C50E0]/10 transition-colors border-b last:border-b-0 border-slate-100 dark:border-slate-700 flex items-center gap-3"
                            onClick={() => handleSelectRequest(req)}
                          >
                            <div className="w-8 h-8 rounded-lg bg-[#3C50E0]/10 flex items-center justify-center shrink-0">
                              <User className="h-4 w-4 text-[#3C50E0]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-sm text-[#1C2434] dark:text-white">{req.FullName}</div>
                              <div className="text-xs text-slate-500 flex gap-3 mt-0.5">
                                <span>الرقم: {req.ordinalFull}</span>
                                <span>ب.و.ت: {req.cin}</span>
                                <span className={cn(
                                  "px-1.5 py-0.5 rounded-full font-bold",
                                  req.request_status === "PENDING" && "bg-amber-100 text-amber-700",
                                  req.request_status === "IN_PROGRESS" && "bg-blue-100 text-blue-700",
                                  req.request_status === "COMPLETED" && "bg-emerald-100 text-emerald-700",
                                  req.request_status === "REJECTED" && "bg-red-100 text-red-700"
                                )}>
                                  {req.request_status === "PENDING" ? "قيد الانتظار"
                                    : req.request_status === "IN_PROGRESS" ? "قيد المعالجة"
                                    : req.request_status === "COMPLETED" ? "مكتمل" : "مرفوض"}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {form.formState.errors.rehabilitationRequestId && (
                  <p className="text-xs font-medium text-red-500 mt-2 text-right">
                    {form.formState.errors.rehabilitationRequestId.message}
                  </p>
                )}
              </div>
            )}

            {/* ════ STEP 2: Personal Info ════ */}
            {currentStep === 2 && (
              <div className="bg-white dark:bg-[#24303F] rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#3C50E0]/10 shrink-0">
                    <User className="w-4 h-4 text-[#3C50E0]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#1C2434] dark:text-white leading-none">البيانات الشخصية</h3>
                    <p className="text-xs text-slate-500 mt-0.5">معلومات هوية صاحب التقرير</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="num_dossier"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel required>رقم الملف</FieldLabel>
                        <FormControl><Input className={inputClass} {...field} /></FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="FullName"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel required>الاسم الكامل</FieldLabel>
                        <FormControl>
                          <Input
                            className={cn(inputClass, "bg-slate-50 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed")}
                            {...field}
                            readOnly
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fils_de_pere"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel required>ابن (الأب)</FieldLabel>
                        <FormControl><Input className={inputClass} {...field} /></FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fils_de_mere"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel required>ابن (الأم)</FieldLabel>
                        <FormControl><Input className={inputClass} {...field} /></FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date_naissance"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FieldLabel required>تاريخ الازدياد</FieldLabel>
                        <FormControl>
                          <DatePickerField field={field as any} inputClass={inputClass} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* ════ STEP 3: Judicial Info ════ */}
            {currentStep === 3 && (
              <div className="bg-white dark:bg-[#24303F] rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#3C50E0]/10 shrink-0">
                    <Scale className="w-4 h-4 text-[#3C50E0]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#1C2434] dark:text-white leading-none">بيانات القضية</h3>
                    <p className="text-xs text-slate-500 mt-0.5">المعلومات القضائية والجهة المختصة</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="tribunal"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel required>المحكمة</FieldLabel>
                        <FormControl><Input className={inputClass} {...field} /></FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ville"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel required>المدينة</FieldLabel>
                        <FormControl><Input className={inputClass} {...field} /></FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date_de_faire"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FieldLabel required>تاريخ الواقعة</FieldLabel>
                        <FormControl>
                          <DatePickerField field={field as any} inputClass={inputClass} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FieldLabel required>تاريخ التقرير</FieldLabel>
                        <FormControl>
                          <DatePickerField field={field as any} inputClass={inputClass} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FieldLabel required>حالة التقرير</FieldLabel>
                        <FormControl>
                          <select
                            className={cn(inputClass, "w-full md:w-1/2 appearance-none cursor-pointer")}
                            {...field}
                          >
                            <option value="PENDING">قيد الانتظار</option>
                            <option value="IN_PROGRESS">قيد المعالجة</option>
                            <option value="COMPLETED">مكتمل</option>
                            <option value="REJECTED">مرفوض</option>
                          </select>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* ════ STEP 4: Address & Notes ════ */}
            {currentStep === 4 && (
              <div className="bg-white dark:bg-[#24303F] rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#3C50E0]/10 shrink-0">
                    <MapPin className="w-4 h-4 text-[#3C50E0]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#1C2434] dark:text-white leading-none">العنوان والملاحظات</h3>
                    <p className="text-xs text-slate-500 mt-0.5">بيانات إضافية تكميلية</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="adresse"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel>العنوان</FieldLabel>
                        <FormControl>
                          <Textarea
                            rows={3}
                            className="text-right text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1A2233] rounded-xl px-3 py-2.5 shadow-sm focus:ring-2 focus:ring-[#3C50E0]/20 focus:border-[#3C50E0] transition-all resize-none w-full outline-none"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="autre_condition"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel>شروط أخرى</FieldLabel>
                        <FormControl>
                          <Textarea
                            rows={3}
                            className="text-right text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1A2233] rounded-xl px-3 py-2.5 shadow-sm focus:ring-2 focus:ring-[#3C50E0]/20 focus:border-[#3C50E0] transition-all resize-none w-full outline-none"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* ── Navigation Bar ── */}
            <div className="mt-5 bg-white dark:bg-[#24303F] rounded-xl border border-slate-200 dark:border-slate-700 px-6 py-4 shadow-sm flex items-center justify-between gap-4">

              {/* Left: step indicator */}
              <div className="flex items-center gap-2">
                {STEPS.map((s) => (
                  <div
                    key={s.id}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      s.id === currentStep
                        ? "w-6 bg-[#3C50E0]"
                        : s.id < currentStep
                        ? "w-2 bg-[#3C50E0]/40"
                        : "w-2 bg-slate-200 dark:bg-slate-700"
                    )}
                  />
                ))}
                <span className="text-xs text-slate-400 mr-1">{currentStep}/{STEPS.length}</span>
              </div>

              {/* Right: buttons */}
              <div className="flex items-center gap-3">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="h-10 px-5 text-sm font-bold rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-4 h-4" />
                    السابق
                  </Button>
                )}

                {!onSuccess && currentStep === 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="h-10 px-5 text-sm font-bold rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    إلغاء
                  </Button>
                )}

                {currentStep < STEPS.length ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="h-10 px-7 text-sm font-black bg-[#3C50E0] hover:bg-[#3346C8] text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                  >
                    التالي
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => form.handleSubmit(onSubmit)()}
                    className="h-10 px-8 text-sm font-black bg-[#3C50E0] hover:bg-[#3346C8] text-white rounded-lg shadow-sm transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : isEdit ? (
                      "تحديث التقرير"
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        حفظ التقرير
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

          </form>
        </Form>
      </div>
    </div>
  );
}
