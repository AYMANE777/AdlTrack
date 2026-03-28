"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Printer, FileText, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Seizure {
  id: number;
  ordinalFull: string;
  possessorInfo: string;
  registrationDate: string;
  regularSeizures: string | null;
  preciousSeizures: string | null;
}

const REFUND_RAPPORT_TYPES = [
  { value: "محضر تسليم المحجوزات لادارة الأملاك المخزنية", label: "محضر تسليم المحجوزات لادارة الأملاك المخزنية" },
  { value: "قائمة مواد الغش", label: "قائمة مواد الغش" },
  { value: "محضر إتلاف", label: "محضر إتلاف" },
];

export default function RefundPage() {
  const { user } = useAuth();
  const [seizures, setSeizures] = useState<Seizure[]>([]);
  const [selectedSeizure, setSelectedSeizure] = useState<Seizure | null>(null);
  const [refundType, setRefundType] = useState("");
  const [refundRapportType, setRefundRapportType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdRefund, setCreatedRefund] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSeizures();
  }, []);

  const fetchSeizures = async (search = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (search) params.append("search", search);
      
      const res = await fetch(`/api/seizures?${params}`);
      const data = await res.json();
      setSeizures(data.data || []);
    } catch (error) {
      toast.error("فشل في تحميل المحجوزات");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchSeizures(searchTerm);
  };

  const handleSubmit = async () => {
    if (!selectedSeizure) {
      toast.error("الرجاء اختيار محجوز");
      return;
    }
    if (!refundType.trim()) {
      toast.error("الرجاء إدخال نوع الاسترداد");
      return;
    }
    if (!refundRapportType) {
      toast.error("الرجاء اختيار نوع التقرير");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seizureId: selectedSeizure.id,
          refundType: refundType,
          refundRapportType: refundRapportType,
          printUser: user?.fullName || "مستخدم غير معروف",
        }),
      });

      if (!res.ok) throw new Error("Failed to create refund");
      
      const refund = await res.json();
      setCreatedRefund(refund);
      toast.success("تم إنشاء الاسترداد بنجاح");
    } catch (error) {
      toast.error("فشل في إنشاء الاسترداد");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    if (!createdRefund) return;
    
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("فشل فتح نافذة الطباعة");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير الاسترداد</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Tajawal', sans-serif;
            padding: 40px;
            background: white;
            color: #1a1a1a;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px double #1C2434;
            padding-bottom: 20px;
          }
          .header h1 {
            font-size: 24px;
            color: #1C2434;
            margin-bottom: 8px;
          }
          .header p {
            color: #666;
            font-size: 14px;
          }
          .section {
            margin-bottom: 24px;
            padding: 16px;
            background: #f9fafb;
            border-radius: 8px;
            border-right: 4px solid #3C50E0;
          }
          .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #1C2434;
            margin-bottom: 12px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dashed #e5e7eb;
          }
          .row:last-child { border-bottom: none; }
          .label { color: #6b7280; font-weight: 500; }
          .value { color: #1a1a1a; font-weight: 600; }
          .footer {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
          }
          .signature {
            text-align: center;
            width: 200px;
          }
          .signature-line {
            border-top: 1px solid #1a1a1a;
            margin-top: 60px;
            padding-top: 8px;
          }
          .print-date {
            text-align: center;
            margin-top: 40px;
            color: #6b7280;
            font-size: 12px;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير الاسترداد</h1>
          <p>المملكة المغربية - وزارة العدل</p>
        </div>
        
        <div class="section">
          <div class="section-title">معلومات المحجوز</div>
          <div class="row">
            <span class="label">رقم التسلسل:</span>
            <span class="value">${createdRefund.seizure?.ordinalFull || "-"}</span>
          </div>
          <div class="row">
            <span class="label">معلومات الحائز:</span>
            <span class="value">${createdRefund.seizure?.possessorInfo || "-"}</span>
          </div>
          <div class="row">
            <span class="label">تاريخ التسجيل:</span>
            <span class="value">${createdRefund.seizure?.registrationDate ? new Date(createdRefund.seizure.registrationDate).toLocaleDateString("ar-MA") : "-"}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">تفاصيل الاسترداد</div>
          <div class="row">
            <span class="label">نوع الاسترداد:</span>
            <span class="value">${createdRefund.refundType}</span>
          </div>
          <div class="row">
            <span class="label">نوع التقرير:</span>
            <span class="value">${createdRefund.refundRapportType}</span>
          </div>
        </div>

        <div class="footer">
          <div class="signature">
            <div class="signature-line">توقيع المسؤول</div>
          </div>
          <div class="signature">
            <div class="signature-line">توقيع المستلم</div>
          </div>
        </div>

        <div class="print-date">
          تم الطباعة بواسطة: ${createdRefund.printUser} | التاريخ: ${new Date().toLocaleDateString("ar-MA")} ${new Date().toLocaleTimeString("ar-MA")}
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const resetForm = () => {
    setSelectedSeizure(null);
    setRefundType("");
    setRefundRapportType("");
    setCreatedRefund(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          نموذج الاسترداد
        </h1>
        {createdRefund && (
          <Button onClick={resetForm} variant="outline">
            إنشاء استرداد جديد
          </Button>
        )}
      </div>

      {!createdRefund ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                اختيار المحجوز
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="البحث برقم التسلسل أو اسم الحائز..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading}>
                  بحث
                </Button>
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-lg p-2">
                {loading ? (
                  <p className="text-center text-slate-500 py-4">جاري التحميل...</p>
                ) : seizures.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">لا توجد نتائج</p>
                ) : (
                  seizures.map((seizure) => (
                    <div
                      key={seizure.id}
                      onClick={() => setSelectedSeizure(seizure)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedSeizure?.id === seizure.id
                          ? "border-[#3C50E0] bg-[#3C50E0]/5"
                          : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white">
                            {seizure.ordinalFull}
                          </p>
                          <p className="text-sm text-slate-500">
                            {seizure.possessorInfo}
                          </p>
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(seizure.registrationDate).toLocaleDateString("ar-MA")}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedSeizure && (
                <div className="p-4 bg-[#3C50E0]/5 rounded-lg border border-[#3C50E0]/20">
                  <p className="text-sm font-medium text-[#3C50E0]">المحجوز المختار:</p>
                  <p className="font-bold text-slate-800 dark:text-white">
                    {selectedSeizure.ordinalFull} - {selectedSeizure.possessorInfo}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                تفاصيل الاسترداد
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="refundType">نوع الاسترداد</Label>
                <Textarea
                  id="refundType"
                  placeholder="أدخل نوع الاسترداد..."
                  value={refundType}
                  onChange={(e) => setRefundType(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="refundRapportType">نوع التقرير</Label>
                <Select value={refundRapportType} onValueChange={setRefundRapportType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر نوع التقرير" />
                  </SelectTrigger>
                  <SelectContent>
                    {REFUND_RAPPORT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !selectedSeizure}
                  className="w-full bg-[#3C50E0] hover:bg-[#3C50E0]/90"
                >
                  {submitting ? "جاري الإنشاء..." : "إنشاء الاسترداد"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">تم إنشاء الاسترداد بنجاح</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div ref={printRef} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">رقم التسلسل</p>
                  <p className="font-semibold">{createdRefund.seizure?.ordinalFull}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">معلومات الحائز</p>
                  <p className="font-semibold">{createdRefund.seizure?.possessorInfo}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">نوع الاسترداد</p>
                  <p className="font-semibold">{createdRefund.refundType}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">نوع التقرير</p>
                  <p className="font-semibold">{createdRefund.refundRapportType}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">المستخدم</p>
                  <p className="font-semibold">{createdRefund.printUser}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">التاريخ</p>
                  <p className="font-semibold">
                    {new Date(createdRefund.createdAt).toLocaleDateString("ar-MA")}
                  </p>
                </div>
              </div>
            </div>

<Button
                onClick={handlePrint}
                className="w-full text-white"
                style={{ backgroundColor: "#16a34a" }}
              >
              <Printer className="h-4 w-4 ml-2" />
              طباعة التقرير
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
