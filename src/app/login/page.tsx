"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldCheck, Lock, User, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser || user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setSessionExpired(true);
      toast.error("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const success = await login(username, password);
          if (success) {
            toast.success("تم تسجيل الدخول بنجاح");
            router.push("/dashboard");
          } else {
            toast.error("اسم المستخدم أو كلمة المرور غير صحيحة");
          }
    } catch (error) {
      toast.error("حدث خطأ ما، يرجى المحاولة لاحقاً");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] dark:bg-[#1A2233] p-4 font-cairo">
      <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-white dark:bg-[#24303F] shadow-2xl rounded-2xl overflow-hidden min-h-[600px]">
        {/* Left Side: Full Image */}
        <div 
          className="hidden md:flex flex-col items-center justify-center relative overflow-hidden"
          style={{
            backgroundImage: "url('/TRBTaza.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}
        >
          <div className="absolute inset-0 bg-[#1C2434]/70" />
          <div className="relative z-10 text-center space-y-6 text-white">
              <h1 className="text-4xl font-black tracking-tight">العقوبة البديلة و رد الاعتبار</h1>
              <p className="text-lg text-[#8A99AF] font-medium max-w-sm">
                نظام إداري لإدارة طلبات رد الاعتبار وسجل العقوبات البديلة
              </p>
            </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 md:p-16 flex flex-col justify-center">
          <div className="mb-10 text-center md:text-right">
            <h2 className="text-3xl font-black text-[#1C2434] dark:text-white mb-3">
              تسجيل الدخول
            </h2>
            <p className="text-[#8A99AF] font-bold">
              أهلاً بك مجدداً! يرجى إدخال بياناتك للمتابعة.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-right block font-black text-[#1C2434] dark:text-white mb-2"
              >
                اسم المستخدم
              </Label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8A99AF]" />
                <Input
                  id="username"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pr-12 text-right h-14 border-[#E2E8F0] dark:border-[#2E3A47] dark:bg-[#1A2233] rounded-xl focus:ring-primary/20 text-lg font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                aria-description="admin123"
                className="text-right block font-black text-[#1C2434] dark:text-white mb-2"
              >
                كلمة المرور
              </Label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8A99AF]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-12 text-right h-14 border-[#E2E8F0] dark:border-[#2E3A47] dark:bg-[#1A2233] rounded-xl focus:ring-primary/20 text-lg font-bold"
                  required
                />
              </div>
            </div>

            {sessionExpired && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-4 text-red-700 dark:text-red-400 text-sm font-bold">
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-red-500" />
                </div>
                <p>انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى</p>
              </div>
            )}

            <div className="bg-[#F7F9FC] dark:bg-[#1A2233] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#2E3A47] flex items-center gap-4 text-[#1C2434] dark:text-white text-sm font-bold">
              <div className="bg-primary/10 p-2 rounded-lg">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              <p>
                  بيانات التجربة:{" "}
                  <span className="text-primary ml-2">admin@adltrack.ma / password123</span>
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-xl font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all active:scale-[0.98] rounded-xl"
              disabled={loading}
            >
              {loading ? "جاري التحقق..." : "دخول للنظام"}
            </Button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-xs font-bold text-[#8A99AF] uppercase tracking-widest">
              Version 1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] dark:bg-[#1A2233]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
