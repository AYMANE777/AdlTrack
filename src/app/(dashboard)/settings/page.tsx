"use client";

import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Settings as SettingsIcon, 
  Shield, 
  Palette, 
  Globe, 
  Save,
  Database,
  Info
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [appName, setAppName] = useState("نظام العقوبة البديلة و رد الاعتبار");
  const [notifications, setNotifications] = useState(true);
  const [autoArchive, setAutoArchive] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("تم حفظ الإعدادات بنجاح");
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="bg-[#3C50E0]/10 p-3 rounded-2xl">
          <SettingsIcon className="h-8 w-8 text-[#3C50E0]" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[#1C2434] dark:text-white tracking-tight">الإعدادات العامة</h1>
          <p className="text-[#8A99AF] font-bold">تخصيص النظام وتفضيلات الإدارة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-8">
          {/* General Settings Card */}
          <Card className="border-none shadow-sm bg-white dark:bg-[#24303F] overflow-hidden">
            <CardHeader className="border-b border-[#E2E8F0] dark:border-[#2E3A47] pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-black">إعدادات النظام الأساسية</CardTitle>
              </div>
              <CardDescription className="text-right font-medium mt-1">المعلومات التعريفية للمنصة</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid gap-2">
                <Label className="text-right font-black mb-2">اسم النظام</Label>
                <Input 
                  value={appName} 
                  onChange={(e) => setAppName(e.target.value)}
                  className="h-12 text-right font-bold border-[#E2E8F0] dark:border-[#2E3A47] dark:bg-[#1A2233] focus:ring-[#3C50E0]/20" 
                />
              </div>
              <div className="grid gap-2">
                  <Label className="text-right font-black mb-2">وصف المختصر (يظهر في صفحة الدخول)</Label>
                  <Input 
                    placeholder="نظام إداري لإدارة طلبات رد الاعتبار وسجل العقوبات البديلة..."
                    className="h-12 text-right font-bold border-[#E2E8F0] dark:border-[#2E3A47] dark:bg-[#1A2233]" 
                  />
                </div>
            </CardContent>
          </Card>

          {/* Features Settings Card */}
          <Card className="border-none shadow-sm bg-white dark:bg-[#24303F] overflow-hidden">
            <CardHeader className="border-b border-[#E2E8F0] dark:border-[#2E3A47] pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Palette className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-xl font-black">تفضيلات الوظائف</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1 text-right">
                  <p className="font-black text-[#1C2434] dark:text-white">تفعيل التنبيهات الفورية</p>
                  <p className="text-sm text-[#8A99AF] font-medium">إرسال إشعارات عند استلام مراسلة جديدة</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <div className="h-[1px] bg-[#E2E8F0] dark:bg-[#2E3A47]" />
              <div className="flex items-center justify-between">
                  <div className="space-y-1 text-right">
                    <p className="font-black text-[#1C2434] dark:text-white">الأرشفة التلقائية</p>
                    <p className="text-sm text-[#8A99AF] font-medium">أرشفة الطلبات المنتهية بعد 30 يوم</p>
                  </div>
                  <Switch checked={autoArchive} onCheckedChange={setAutoArchive} />
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Info Cards */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm bg-white dark:bg-[#24303F]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-[#10B981]" />
                <CardTitle className="text-lg font-black">أمن النظام</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-between h-12 font-bold border-[#E2E8F0] dark:border-[#2E3A47]">
                <span>إدارة كلمات المرور</span>
                <Shield size={16} />
              </Button>
              <Button variant="outline" className="w-full justify-between h-12 font-bold border-[#E2E8F0] dark:border-[#2E3A47]">
                <span>سجل الدخول والعمليات</span>
                <Database size={16} />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-[#3C50E0] text-white">
            <CardContent className="p-6 space-y-4">
              <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-black">تحديثات النظام</h3>
                <p className="text-blue-100 text-sm font-medium mt-1">الإصدار الحالي: 2.4.0 (مستقر)</p>
              </div>
              <Button className="w-full bg-white text-[#3C50E0] hover:bg-blue-50 font-black h-11 border-none">
                التحقق من التحديثات
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#3C50E0] hover:bg-[#3C50E0]/90 text-white font-black px-10 h-14 text-lg rounded-xl shadow-xl shadow-[#3C50E0]/20 gap-3"
        >
          {loading ? "جاري الحفظ..." : (
            <>
              <Save size={20} />
              <span>حفظ كافة التغييرات</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
