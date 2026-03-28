"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { 
  CalendarIcon, 
  Scale,
  User,
  Gavel,
  FileText,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Check
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

const formSchema = z.object({
  full_name: z.string().min(1, "الاسم الكامل مطلوب"),
  national_id: z.string().min(1, "رقم البطاقة الوطنية مطلوب"),
  address_contact: z.string().optional(),
  source_court: z.string().optional(),
  case_number: z.string().optional(),
  judgment_number: z.string().optional(),
  judgment_date: z.coerce.date().optional().nullable(),
  crime_type: z.string().optional(),
  original_penalty_type: z.string().optional(),
  original_penalty_duration: z.string().optional(),
  alternative_penalty_type: z.string().optional(),
  alternative_penalty_details: z.string().optional(),
  supervising_institution: z.string().optional(),
  prosecution_referral_date: z.coerce.date().optional().nullable(),
  execution_decision_number: z.string().optional(),
  execution_decision_date: z.coerce.date().optional().nullable(),
  execution_decision_content: z.string().optional(),
  followup_orders: z.string().optional(),
  report_received_date: z.coerce.date().optional().nullable(),
  responsible_authority: z.string().optional(),
  compliance_notes: z.string().optional(),
  appellant_identity: z.string().optional(),
  dispute_date: z.coerce.date().optional().nullable(),
  dispute_subject: z.string().optional(),
  dispute_outcome: z.string().optional(),
  final_decision_date: z.coerce.date().optional().nullable(),
  appeal_deadline: z.coerce.date().optional().nullable(),
  notification_date: z.coerce.date().optional().nullable(),
  judge_notes: z.string().optional(),
});

interface AlternativePenaltyFormProps {
  initialData?: z.infer<typeof formSchema> & { id?: number };
  onSuccess?: () => void;
}

const steps = [
  { id: 1, title: "المحكوم عليه", icon: User, color: "blue" },
  { id: 2, title: "البيانات القضائية", icon: Gavel, color: "purple" },
  { id: 3, title: "العقوبة البديلة", icon: Scale, color: "emerald" },
  { id: 4, title: "التنفيذ والمتابعة", icon: FileText, color: "orange" },
];

export function AlternativePenaltyForm({ initialData, onSuccess }: AlternativePenaltyFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      full_name: "",
      national_id: "",
      address_contact: "",
      source_court: "",
      case_number: "",
      judgment_number: "",
      judgment_date: null,
      crime_type: "",
      original_penalty_type: "",
      original_penalty_duration: "",
      alternative_penalty_type: "",
      alternative_penalty_details: "",
      supervising_institution: "",
      prosecution_referral_date: null,
      execution_decision_number: "",
      execution_decision_date: null,
      execution_decision_content: "",
      followup_orders: "",
      report_received_date: null,
      responsible_authority: "",
      compliance_notes: "",
      appellant_identity: "",
      dispute_date: null,
      dispute_subject: "",
      dispute_outcome: "",
      final_decision_date: null,
      appeal_deadline: null,
      notification_date: null,
      judge_notes: "",
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const getFieldsForStep = (step: number): string[] => {
    switch (step) {
      case 1: return ["full_name", "national_id", "address_contact"];
      case 2: return ["source_court", "case_number", "judgment_number", "judgment_date", "crime_type", "original_penalty_type", "original_penalty_duration"];
      case 3: return ["alternative_penalty_type", "alternative_penalty_details", "supervising_institution"];
      case 4: return [];
      default: return [];
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Check if step 4 fields are empty and show confirmation
    const step4Fields = [
      values.prosecution_referral_date,
      values.execution_decision_number,
      values.execution_decision_date,
      values.report_received_date,
      values.final_decision_date
    ];
    
    const hasStep4Data = step4Fields.some(field => field !== null && field !== undefined && field !== "");
    
    if (!hasStep4Data && !showConfirmDialog) {
      setShowConfirmDialog(true);
      return;
    }
    
    setShowConfirmDialog(false);
    setIsSubmitting(true);
    try {
      const url = initialData?.id 
        ? `/api/alternative-penalties/${initialData.id}` 
        : '/api/alternative-penalties';
      
      const method = initialData?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          [initialData?.id ? 'updatedById' : 'createdById']: user?.id || 1
        }),
      });

      if (!response.ok) throw new Error('Failed to save data');

      toast.success(initialData?.id ? "تم تحديث العقوبة البديلة بنجاح" : "تم تسجيل العقوبة البديلة بنجاح");
      
      if (onSuccess) {
        onSuccess();
      } else {
        if (!initialData?.id) form.reset();
        router.push('/alternative-penalties');
        router.refresh();
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setIsSubmitting(false);
    }
  }

  const DatePickerField = ({ name, label }: { name: any; label: string }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="text-right font-bold text-sm text-slate-600 dark:text-slate-300">{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button variant="outline" className={cn("w-full text-right h-11 border rounded-xl justify-between font-medium bg-white dark:bg-slate-800", !field.value && "text-muted-foreground")}>
                  {field.value ? format(new Date(field.value), "yyyy-MM-dd") : <span className="text-slate-400">اختر التاريخ</span>}
                  <CalendarIcon className="h-4 w-4 text-slate-400" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={field.onChange} initialFocus />
            </PopoverContent>
          </Popover>
        </FormItem>
      )}
    />
  );

  const InputField = ({ name, label, required = false, placeholder = "" }: { name: any; label: string; required?: boolean; placeholder?: string }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-right font-bold text-sm text-slate-600 dark:text-slate-300">
            {label} {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl>
            <Input 
              className="h-11 text-right rounded-xl bg-white dark:bg-slate-800 border font-medium" 
              placeholder={placeholder}
              {...field} 
              value={field.value || ""} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const TextAreaField = ({ name, label, rows = 2, placeholder = "" }: { name: any; label: string; rows?: number; placeholder?: string }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-right font-bold text-sm text-slate-600 dark:text-slate-300">{label}</FormLabel>
          <FormControl>
            <Textarea 
              rows={rows} 
              className="text-right rounded-xl bg-white dark:bg-slate-800 border font-medium resize-none" 
              placeholder={placeholder}
              {...field} 
              value={field.value || ""} 
            />
          </FormControl>
        </FormItem>
      )}
    />
  );

  return (
    <div className="w-full max-w-4xl mx-auto font-cairo" dir="rtl">
      <div className="bg-white dark:bg-[#24303F] shadow-xl rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700">
        {/* Compact Header */}
        <div className="bg-gradient-to-l from-emerald-600 to-emerald-500 px-8 py-6 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-2xl font-black">{initialData?.id ? "تعديل العقوبة البديلة" : "تسجيل عقوبة بديلة"}</h4>
              <p className="text-emerald-100 text-sm font-medium">الخطوة {currentStep} من {steps.length}</p>
            </div>
          </div>
        </div>

          {/* Progress Steps */}
          <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = completedSteps.includes(step.id);
                
                return (
                  <React.Fragment key={step.id}>
                    <button
                      type="button"
                      onClick={() => (isCompleted || step.id < currentStep) && setCurrentStep(step.id)}
                      disabled={!isCompleted && step.id > currentStep}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl transition-all",
                        isActive && "bg-emerald-100 dark:bg-emerald-900/30",
                        (isCompleted || step.id < currentStep) && "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700",
                        !isCompleted && step.id > currentStep && "cursor-not-allowed opacity-60"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                        isActive && "bg-emerald-500 text-white",
                        isCompleted && !isActive && "bg-emerald-500 text-white",
                        !isActive && !isCompleted && "bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400"
                      )}>
                        {isCompleted && !isActive ? <Check className="h-4 w-4" /> : step.id}
                      </div>
                      <span className={cn(
                        "text-sm font-bold hidden sm:block",
                        isActive && "text-emerald-700 dark:text-emerald-400",
                        isCompleted && !isActive && "text-emerald-600 dark:text-emerald-500",
                        !isActive && !isCompleted && "text-slate-400"
                      )}>
                        {step.title}
                      </span>
                    </button>
                    {index < steps.length - 1 && (
                      <div className={cn(
                        "flex-1 h-0.5 mx-2",
                        completedSteps.includes(step.id) ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-600"
                      )} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

        {/* Form Content */}
        <div className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              
              {/* Step 1: بيانات المحكوم عليه */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <h5 className="text-lg font-black text-slate-800 dark:text-white">بيانات المحكوم عليه</h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField name="full_name" label="الاسم الكامل" required placeholder="أدخل الاسم الكامل" />
                    <InputField name="national_id" label="رقم البطاقة الوطنية" required placeholder="مثال: AB123456" />
                  </div>
                  <TextAreaField name="address_contact" label="العنوان ومعلومات الاتصال" placeholder="أدخل العنوان الكامل ورقم الهاتف" />
                </div>
              )}

              {/* Step 2: البيانات القضائية */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                      <Gavel className="h-5 w-5 text-purple-600" />
                    </div>
                    <h5 className="text-lg font-black text-slate-800 dark:text-white">البيانات القضائية</h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <InputField name="source_court" label="المحكمة المصدرة" placeholder="مثال: المحكمة الابتدائية" />
                    <InputField name="case_number" label="رقم القضية" placeholder="رقم الملف" />
                    <InputField name="judgment_number" label="رقم الحكم" />
                    <DatePickerField name="judgment_date" label="تاريخ الحكم" />
                    <InputField name="crime_type" label="نوع الجريمة" />
                    <InputField name="original_penalty_type" label="نوع العقوبة الأصلية" />
                    <InputField name="original_penalty_duration" label="مدة العقوبة الأصلية" placeholder="مثال: 6 أشهر" />
                  </div>
                </div>
              )}

              {/* Step 3: تفاصيل العقوبة البديلة */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                      <Scale className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h5 className="text-lg font-black text-slate-800 dark:text-white">تفاصيل العقوبة البديلة</h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField name="alternative_penalty_type" label="نوع العقوبة البديلة" placeholder="مثال: العمل لأجل المنفعة العامة" />
                    <InputField name="supervising_institution" label="المؤسسة المشرفة" placeholder="اسم المؤسسة" />
                  </div>
                  <TextAreaField name="alternative_penalty_details" label="تفاصيل العقوبة البديلة" rows={3} placeholder="وصف تفصيلي للعقوبة البديلة" />
                </div>
              )}

              {/* Step 4: التنفيذ والمتابعة */}
              {currentStep === 4 && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  {/* المقررات التنفيذية */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-orange-600" />
                      </div>
                      <h5 className="text-lg font-black text-slate-800 dark:text-white">المقررات التنفيذية</h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <DatePickerField name="prosecution_referral_date" label="تاريخ الإحالة" />
                      <InputField name="execution_decision_number" label="رقم قرار التنفيذ" />
                      <DatePickerField name="execution_decision_date" label="تاريخ قرار التنفيذ" />
                    </div>
                    <div className="mt-4">
                      <TextAreaField name="execution_decision_content" label="مضمون قرار التنفيذ" rows={2} />
                    </div>
                  </div>

                  {/* التقارير والمتابعة */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-cyan-100 dark:bg-cyan-900/30 p-2 rounded-lg">
                        <ClipboardCheck className="h-5 w-5 text-cyan-600" />
                      </div>
                      <h5 className="text-lg font-black text-slate-800 dark:text-white">التقارير والمتابعة</h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DatePickerField name="report_received_date" label="تاريخ استلام التقرير" />
                      <InputField name="responsible_authority" label="الجهة المسؤولة" />
                    </div>
                    <div className="mt-4">
                      <TextAreaField name="compliance_notes" label="ملاحظات الامتثال" rows={2} />
                    </div>
                  </div>

                  {/* القرار النهائي */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <h5 className="text-lg font-black text-slate-800 dark:text-white">القرار النهائي</h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <DatePickerField name="final_decision_date" label="تاريخ القرار النهائي" />
                      <DatePickerField name="appeal_deadline" label="أجل الطعن" />
                      <DatePickerField name="notification_date" label="تاريخ التبليغ" />
                    </div>
                  </div>

                  {/* ملاحظات */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-indigo-600" />
                      </div>
                      <h5 className="text-lg font-black text-slate-800 dark:text-white">ملاحظات القاضي</h5>
                    </div>
                    <TextAreaField name="judge_notes" label="الملاحظات" rows={3} placeholder="أي ملاحظات إضافية..." />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-200 dark:border-slate-700">
                <Button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  variant="outline"
                  className="h-12 px-6 rounded-xl font-bold gap-2"
                >
                  <ChevronRight className="h-5 w-5" />
                  السابق
                </Button>

                {currentStep < steps.length ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="h-12 px-8 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
                  >
                    التالي
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 px-10 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
                  >
                    {isSubmitting ? "جاري الحفظ..." : (initialData?.id ? "تحديث" : "حفظ وتسجيل")}
                    <Check className="h-5 w-5" />
                  </Button>
                )}
                </div>

                {/* Confirmation Dialog */}
                {showConfirmDialog && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full">
                          <AlertTriangle className="h-6 w-6 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white">تأكيد التسجيل</h3>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mb-6 font-medium">
                        لم يتم ملء بيانات التنفيذ والمتابعة. هل تريد المتابعة بدون هذه البيانات؟
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                        يمكنك إضافة هذه البيانات لاحقاً من خلال تعديل السجل.
                      </p>
                      <div className="flex gap-3 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowConfirmDialog(false)}
                          className="rounded-xl font-bold"
                        >
                          العودة للتعديل
                        </Button>
                        <Button
                          type="submit"
                          className="rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                          تأكيد التسجيل
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </div>
        </div>
      </div>
    );
}
