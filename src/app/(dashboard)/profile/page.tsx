"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User as UserIcon,
  Mail,
  Shield,
  Calendar,
  Save,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
  ADMIN: "مدير النظام",
  CLERK: "موظف",
  VIEWER: "مشاهد",
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email }),
      });
      if (res.ok) {
        const updated = { ...user, fullName, email };
        localStorage.setItem("auth_user", JSON.stringify(updated));
        toast.success("تم تحديث الملف الشخصي بنجاح");
      } else {
        const data = await res.json();
        toast.error(data.error || "حدث خطأ أثناء التحديث");
      }
    } catch {
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    if (newPassword.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("كلمة المرور الجديدة غير متطابقة");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      if (res.ok) {
        toast.success("تم تغيير كلمة المرور بنجاح");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        toast.error(data.error || "حدث خطأ أثناء تغيير كلمة المرور");
      }
    } catch {
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="bg-[#3C50E0]/10 p-3 rounded-2xl">
          <UserIcon className="h-8 w-8 text-[#3C50E0]" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[#1C2434] dark:text-white tracking-tight">
            الملف الشخصي
          </h1>
          <p className="text-[#8A99AF] font-bold">إدارة معلوماتك الشخصية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="border-none shadow-sm bg-white dark:bg-[#24303F] lg:col-span-1">
          <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
            <Avatar className="h-24 w-24 border-4 border-[#3C50E0]/20 ring-4 ring-[#3C50E0]/10 shadow-lg">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}&backgroundColor=3C50E0&textColor=ffffff&fontSize=40&fontWeight=600`}
                alt={user.fullName}
              />
              <AvatarFallback className="bg-gradient-to-br from-[#3C50E0] to-[#6366F1] text-white font-semibold text-2xl">
                {user.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-black text-[#1C2434] dark:text-white">
                {user.fullName}
              </h2>
              <p className="text-sm text-[#8A99AF] font-bold mt-1">
                {user.email}
              </p>
            </div>
            <div className="w-full space-y-3 pt-4 border-t border-[#E2E8F0] dark:border-[#2E3A47]">
              <div className="flex items-center justify-between text-sm">
                <span className="font-black text-[#1C2434] dark:text-white flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#3C50E0]" />
                  الدور
                </span>
                <span className="bg-[#3C50E0]/10 text-[#3C50E0] px-3 py-1 rounded-full text-xs font-black">
                  {roleLabels[user.role] || user.role}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-black text-[#1C2434] dark:text-white flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#3C50E0]" />
                  البريد
                </span>
                <span className="text-[#8A99AF] font-bold text-xs">
                  {user.email}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Info */}
          <Card className="border-none shadow-sm bg-white dark:bg-[#24303F]">
            <CardHeader className="border-b border-[#E2E8F0] dark:border-[#2E3A47] pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-black">
                  المعلومات الشخصية
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid gap-2">
                <Label className="text-right font-black mb-1">
                  الاسم الكامل
                </Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 text-right font-bold border-[#E2E8F0] dark:border-[#2E3A47] dark:bg-[#1A2233]"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-right font-black mb-1">
                  البريد الإلكتروني
                </Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="h-12 text-right font-bold border-[#E2E8F0] dark:border-[#2E3A47] dark:bg-[#1A2233]"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="bg-[#3C50E0] hover:bg-[#3C50E0]/90 text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-[#3C50E0]/20 gap-2"
                >
                  <Save size={18} />
                  {savingProfile ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="border-none shadow-sm bg-white dark:bg-[#24303F]">
            <CardHeader className="border-b border-[#E2E8F0] dark:border-[#2E3A47] pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <KeyRound className="h-5 w-5 text-orange-600" />
                </div>
                <CardTitle className="text-xl font-black">
                  تغيير كلمة المرور
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid gap-2">
                <Label className="text-right font-black mb-1">
                  كلمة المرور الجديدة
                </Label>
                <Input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type="password"
                  placeholder="أدخل كلمة المرور الجديدة"
                  className="h-12 text-right font-bold border-[#E2E8F0] dark:border-[#2E3A47] dark:bg-[#1A2233]"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-right font-black mb-1">
                  تأكيد كلمة المرور
                </Label>
                <Input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password"
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  className="h-12 text-right font-bold border-[#E2E8F0] dark:border-[#2E3A47] dark:bg-[#1A2233]"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleChangePassword}
                  disabled={savingPassword}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-orange-500/20 gap-2"
                >
                  <KeyRound size={18} />
                  {savingPassword ? "جاري التغيير..." : "تغيير كلمة المرور"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
