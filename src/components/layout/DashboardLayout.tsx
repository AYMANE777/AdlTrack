"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { LayoutProvider, useLayout } from "@/context/LayoutContext";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = React.useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("auth_user");
    if (!savedUser && pathname !== "/login") {
      router.push("/login");
    } else {
      setIsChecking(false);
    }
  }, [pathname, router, user]);

  if (isChecking || (!user && !localStorage.getItem("auth_user"))) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#1A222C] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#3C50E0] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-400 font-bold">جاري تحميل النظام...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, setIsCollapsed, isDarkMode } = useLayout();

  return (
    <div className={cn(
      "flex h-screen overflow-hidden bg-[#F1F5F9] dark:bg-[#1A222C]",
      isDarkMode && "dark"
    )}>
      {/* Mobile Backdrop */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 custom-scrollbar scroll-smooth">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <AuthGuard>
        <DashboardContent>
          {children}
        </DashboardContent>
      </AuthGuard>
    </LayoutProvider>
  );
}
