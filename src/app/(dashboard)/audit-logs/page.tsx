"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  History,
  ChevronLeft,
  ChevronRight,
  User,
  FileText,
  Loader2,
  Eye,
  ArrowLeftRight
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

interface AuditLog {
  id: number;
  tableName: string;
  recordId: number;
  action: "CREATE" | "UPDATE" | "DELETE";
  oldData: any;
  newData: any;
  diff?: Record<string, { old: any; new: any }>;
  performedAt: string;
  performedBy?: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const tableNameMap: Record<string, string> = {
  rehabilitation_requests: "طلبات رد الاعتبار",
  alternative_penalties_registry: "العقوبات البديلة",
  user: "المستخدمين",
  users: "المستخدمين"
};

const fieldNameMap: Record<string, string> = {
  id: "المعرّف",
  fullName: "الاسم الكامل",
  email: "البريد الإلكتروني",
  role: "الدور",
  status: "الحالة",
  createdAt: "تاريخ الإنشاء",
  updatedAt: "تاريخ التحديث",
  deletedAt: "تاريخ الحذف",
  requestNumber: "رقم الطلب",
  nationalId: "رقم البطاقة الوطنية",
  firstName: "الاسم الشخصي",
  lastName: "الاسم العائلي",
  phone: "رقم الهاتف",
  address: "العنوان",
  notes: "ملاحظات",
  decision: "القرار",
  penaltyType: "نوع العقوبة",
  startDate: "تاريخ البداية",
  endDate: "تاريخ النهاية"
};

const actionMap: Record<AuditLog["action"], { label: string; color: string }> = {
  CREATE: {
    label: "إنشاء",
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
  },
  UPDATE: {
    label: "تعديل",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
  },
  DELETE: {
    label: "حذف",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  }
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [selectedLogForDiff, setSelectedLogForDiff] = useState<AuditLog | null>(null);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());

      if (actionFilter !== "all") params.set("action", actionFilter);
      if (tableFilter !== "all") params.set("tableName", tableFilter);

      const response = await fetch(`/api/audit-logs?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      setLogs(Array.isArray(data.logs) ? data.logs : []);
      setPagination(
        data.pagination ?? {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        }
      );
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, actionFilter, tableFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ar-MA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-xl">
            <History className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1C2434] dark:text-white">
              سجل العمليات
            </h1>
            <p className="text-sm text-[#8A99AF]">
              تتبع جميع العمليات والتغييرات في النظام
            </p>
          </div>
        </div>
      </div>

      <Card className="shadow-xl border-primary/10">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="text-lg font-bold">سجل الأنشطة</CardTitle>

            <div className="flex gap-3 flex-wrap">
              <Select
                value={actionFilter}
                onValueChange={(val) => {
                  setActionFilter(val);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="نوع العملية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع العمليات</SelectItem>
                  <SelectItem value="CREATE">إنشاء</SelectItem>
                  <SelectItem value="UPDATE">تعديل</SelectItem>
                  <SelectItem value="DELETE">حذف</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={tableFilter}
                onValueChange={(val) => {
                  setTableFilter(val);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="الجدول" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الجداول</SelectItem>
                  <SelectItem value="rehabilitation_requests">
                    طلبات رد الاعتبار
                  </SelectItem>
                  <SelectItem value="alternative_penalties_registry">
                    العقوبات البديلة
                  </SelectItem>
                  <SelectItem value="user">المستخدمين</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#8A99AF]">
              <FileText className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">لا توجد سجلات</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-[#1A2233]">
                  <TableHead className="text-right font-bold">التاريخ</TableHead>
                  <TableHead className="text-right font-bold">المستخدم</TableHead>
                  <TableHead className="text-right font-bold">العملية</TableHead>
                  <TableHead className="text-right font-bold">الجدول</TableHead>
                  <TableHead className="text-right font-bold">رقم السجل</TableHead>
                  <TableHead className="text-right font-bold">التفاصيل</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {logs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="hover:bg-gray-50 dark:hover:bg-[#1A2233]/50"
                  >
                    <TableCell className="font-medium text-sm">
                      {formatDate(log.performedAt)}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-1.5 rounded-full">
                          <User className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="font-medium">
                          {log.performedBy?.fullName || "غير معروف"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className={`${actionMap[log.action].color} font-bold`}>
                        {actionMap[log.action].label}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-medium">
                      {tableNameMap[log.tableName] || log.tableName}
                    </TableCell>

                    <TableCell className="font-mono text-sm">
                      #{log.recordId}
                    </TableCell>

                    <TableCell className="max-w-[300px]">
                      {log.action === "CREATE" && log.newData && (
                        <span className="text-xs text-green-600 dark:text-green-400">
                          تم إنشاء سجل جديد
                        </span>
                      )}

                      {log.action === "UPDATE" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 h-8 gap-1 font-bold"
                          onClick={() => {
                            setSelectedLogForDiff(log);
                            setIsDiffModalOpen(true);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          عرض التعديلات
                        </Button>
                      )}

                      {log.action === "DELETE" && (
                        <span className="text-xs text-red-600 dark:text-red-400">
                          تم حذف السجل
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-800">
              <div className="text-sm text-[#8A99AF]">
                عرض {((pagination.page - 1) * pagination.limit) + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} من{" "}
                {pagination.total}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page + 1 }))
                  }
                  disabled={pagination.page >= pagination.totalPages}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDiffModalOpen} onOpenChange={setIsDiffModalOpen}>
        <DialogContent
          className="max-w-3xl w-[95vw] shadow-2xl rounded-2xl font-cairo bg-[#F7F8FA] dark:bg-slate-900 border-none p-0 overflow-hidden"
          dir="rtl"
        >
          <DialogHeader className="p-6 pb-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <div className="text-right space-y-1">
              <DialogTitle className="text-xl font-black flex items-center gap-2">
                <ArrowLeftRight className="text-blue-500 w-5 h-5" />
                تفاصيل التعديلات
              </DialogTitle>

              <DialogDescription className="text-sm font-bold text-slate-500">
                مقارنة بين القيمة السابقة والقيمة الجديدة للسجل (
                {selectedLogForDiff
                  ? tableNameMap[selectedLogForDiff.tableName] ||
                  selectedLogForDiff.tableName
                  : ""}
                {" "}
                #{selectedLogForDiff?.recordId})
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 bg-slate-50 dark:bg-slate-900">
            {!selectedLogForDiff?.diff ||
              Object.keys(selectedLogForDiff.diff).length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-bold">
                  لا توجد تغييرات جوهرية أو فشل النظام في استخراج التعديلات
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(selectedLogForDiff.diff).map(([key, changes]) => (
                  <div
                    key={key}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm"
                  >
                    <div className="bg-slate-100 dark:bg-slate-900/50 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="font-black text-sm text-slate-700 dark:text-slate-200">
                        {fieldNameMap[key] || key}
                      </span>
                      <span className="text-xs font-mono text-slate-400 bg-white dark:bg-slate-800 px-2 pl-3 pb-[1px] pt-[2px] rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                        {key}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-x-reverse divide-slate-100 dark:divide-slate-700/50 p-4">
                      <div className="space-y-1 pl-4">
                        <p className="text-[10px] font-bold uppercase text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-md w-fit">
                          القيمة السابقة
                        </p>
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mt-2 break-words max-h-32 overflow-y-auto whitespace-pre-wrap">
                          {changes.old === null ||
                            changes.old === undefined ||
                            changes.old === "" ? (
                            <span className="text-slate-400 italic font-normal">
                              فارغ
                            </span>
                          ) : (
                            String(changes.old)
                          )}
                        </p>
                      </div>

                      <div className="space-y-1 pr-4">
                        <p className="text-[10px] font-bold uppercase text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-md w-fit">
                          القيمة الجديدة
                        </p>
                        <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-2 break-words max-h-32 overflow-y-auto whitespace-pre-wrap">
                          {changes.new === null ||
                            changes.new === undefined ||
                            changes.new === "" ? (
                            <span className="text-slate-400 italic font-normal">
                              فارغ
                            </span>
                          ) : (
                            String(changes.new)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end">
            <Button
              onClick={() => setIsDiffModalOpen(false)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl px-6"
            >
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}