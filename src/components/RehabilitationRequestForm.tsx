"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { 
  CalendarIcon, 
  Send, 
  ClipboardList,
  User,
  Info,
  CheckCircle2,
  FileText
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
import { CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  FullName: z.string().min(1, "الاسم الكامل مطلوب"),
  cin: z.string().min(1, "رقم البطاقة الوطنية مطلوب"),
  request_date: z.coerce.date({ invalid_type_error: "التاريخ غير صحيح" }),
  prosecution_inquiry_date: z.coerce.date().optional().nullable(),
  prosecution_opinion: z.string().optional(),
  request_status: z.string().min(1, "حالة الطلب مطلوبة"),
});

interface RehabilitationRequestFormProps {
  initialData?: z.infer<typeof formSchema> & { id?: number };
  onSuccess?: () => void;
}

export function RehabilitationRequestForm({ initialData, onSuccess }: RehabilitationRequestFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: initialData || {
        FullName: "",
        cin: "",
        request_date: new Date(),
        request_status: "PENDING",
        prosecution_opinion: "",
        prosecution_inquiry_date: null,
      },
    });

  // Reset form when initialData changes
  React.useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const url = initialData?.id 
        ? `/api/rehabilitation-requests/${initialData.id}` 
        : '/api/rehabilitation-requests';
      
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

      const data = await response.json();
      toast.success(initialData?.id ? "تم تحديث الطلب بنجاح" : `تم حفظ الطلب بنجاح (رقم: ${data.ordinalFull})`);
      
      if (onSuccess) {
        onSuccess();
      } else {
        if (!initialData?.id) form.reset();
        router.push('/rehabilitation-requests');
        router.refresh();
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 font-cairo" dir="rtl">
      <div className="bg-white dark:bg-[#24303F] shadow-sm rounded-[2rem] overflow-hidden border border-[#E2E8F0] dark:border-[#2E3A47]">
        <div className="bg-[#3C50E0] p-8 text-white text-center relative">
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg mb-2">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-3xl font-black mb-0">طلب رد الاعتبار</h4>
            <p className="text-blue-100/80 font-bold">تسجيل طلب جديد لرد الاعتبار</p>
          </div>
        </div>

        <CardContent className="p-8 md:p-12">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="FullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-right block font-black text-lg">الاسم الكامل</FormLabel>
                      <FormControl>
                        <Input className="h-14 text-right text-lg border-2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-right block font-black text-lg">رقم البطاقة الوطنية</FormLabel>
                      <FormControl>
                        <Input className="h-14 text-right text-lg border-2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="request_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-right block font-black text-lg">تاريخ الطلب</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className={cn("w-full text-right h-14 border-2 flex items-center justify-between", !field.value && "text-muted-foreground")}>
                              <CalendarIcon className="h-5 w-5 opacity-50" />
                              {field.value ? format(field.value, "yyyy-MM-dd") : <span>اختر التاريخ</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="request_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-right block font-black text-lg">حالة الطلب</FormLabel>
                      <FormControl>
                        <select 
                          className="w-full h-14 text-right text-lg border-2 rounded-md px-3 bg-background"
                          {...field}
                        >
                          <option value="PENDING">قيد الانتظار</option>
                          <option value="IN_PROGRESS">قيد المعالجة</option>
                          <option value="COMPLETED">مكتمل</option>
                          <option value="REJECTED">مرفوض</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="prosecution_opinion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right block font-black text-lg">رأي النيابة العامة</FormLabel>
                    <FormControl>
                      <Textarea rows={4} className="text-right text-lg border-2" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-80 h-16 text-xl font-black bg-[#3C50E0] hover:bg-[#3C50E0]/90 text-white rounded-2xl shadow-lg transition-all"
                >
                  {isSubmitting ? "جاري الحفظ..." : "حفظ الطلب"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </div>
    </div>
  );
}
