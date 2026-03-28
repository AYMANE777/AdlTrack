"use client";

import React, { memo } from "react";
import {
  LayoutDashboard,
  FilePlus,
  PlusCircle,
  ListOrdered,
  History,
  Users,
  Settings,
  LogOut,
  Menu,
  Gavel,
  ReceiptText,
  RotateCcw,
  ClipboardList,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLayout } from "@/context/LayoutContext";
import { toast } from "sonner";
import Image from "next/image";

const NavItem = memo(({ item, isCollapsed }: { item: { title: string; icon: React.ElementType; href: string }, isCollapsed: boolean }) => {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/");
  const Icon = item.icon;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(item.href);
  };

  return (
    <a href={item.href} onClick={handleClick}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-4 text-right px-4 h-12 transition-all duration-200 rounded-lg group relative cursor-pointer",
            isActive
              ? "bg-[#333A48] text-white font-bold"
              : "text-[#8A99AF] hover:bg-[#333A48] hover:text-white font-semibold",
            isCollapsed && "justify-center px-0",
          )}
        >
        <Icon
          className={cn(
            "h-5 w-5 shrink-0 transition-all duration-200",
            isActive
              ? "text-[#3C50E0]"
              : "text-[#8A99AF] group-hover:text-white",
          )}
        />
        {!isCollapsed && (
          <span className="text-[14px] whitespace-nowrap">
            {item.title}
          </span>
        )}
        {isActive && !isCollapsed && (
          <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#3C50E0] rounded-r-full shadow-[0_0_10px_rgba(60,80,224,0.5)]" />
        )}
      </Button>
    </a>
  );
});

NavItem.displayName = "NavItem";

const Sidebar = memo(() => {
  const { isCollapsed, setIsCollapsed } = useLayout();
  const { logout, user } = useAuth();

    const navItems = [
      { title: "لوحة التحكم", icon: LayoutDashboard, href: "/dashboard" },
    { title: "طلبات رد الاعتبار", icon: ClipboardList, href: "/rehabilitation-requests" },
    { title: "تقارير رد الاعتبار", icon: ReceiptText, href: "/rehabilitation-requests-rapport" },
    { title: "سجل العقوبات البديلة", icon: Gavel, href: "/alternative-penalties" },
    { title: "إضافة طلب رد الاعتبار", icon: FilePlus, href: "/rehabilitation-requests/new" },
    { title: "إضافة تقرير رد الاعتبار", icon: FilePlus, href: "/rehabilitation-requests-rapport/new" },
      { title: "تسجيل عقوبة بديلة", icon: PlusCircle, href: "/alternative-penalties/new" },
      ...(user?.role === "ADMIN" ? [{ title: "إدارة المستخدمين", icon: Users, href: "/users" }] : []),
      { title: "سجل العمليات", icon: ClipboardList, href: "/audit-logs" },
    ];



  return (
    <aside
      className={cn(
        "fixed inset-y-0 right-0 z-50 flex flex-col bg-[#1C2434] transition-all duration-300 text-white shadow-2xl overflow-visible lg:static lg:h-screen",
        isCollapsed ? "w-0 -mr-72 lg:w-20 lg:mr-0" : "w-72 mr-0",
      )}
    >
      <div className="flex h-32 items-center justify-center bg-[#1C2434] shrink-0 relative">
        <div className="flex items-center justify-center">
            <Image
              src="/MJ-Maroc.png"
              alt="Logo"
              width={96}
              height={96}
              className={cn(
                "transition-all duration-300",
                isCollapsed ? "h-12 w-12" : "h-24 w-24",
              )}
              priority
            />
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-white dark:bg-[#24303F] rounded-full hidden lg:flex items-center justify-center text-[#3C50E0] border border-[#E2E8F0] dark:border-[#2E3A47] shadow-xl z-[60] hover:scale-110 transition-all group cursor-pointer"
          >
          <Menu
            size={14}
            className={cn(
              "transition-transform duration-300",
              isCollapsed && "rotate-180",
            )}
          />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar">
        <nav className="grid gap-1 px-4">
          <p
            className={cn(
              "text-[10px] font-black text-[#8A99AF] uppercase tracking-[0.2em] mb-4 px-4 transition-opacity",
              isCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100",
            )}
          >
            القائمة
          </p>
          {navItems.map((item, index) => (
            <NavItem key={index} item={item} isCollapsed={isCollapsed} />
          ))}
        </nav>
      </div>

      <div className="p-4 bg-[#1C2434] shrink-0 border-t border-white/5">
          <Button
            variant="ghost"
            onClick={() => {
              logout();
              toast.info("تم تسجيل الخروج");
            }}
            className={cn(
              "w-full justify-start gap-4 text-[#8A99AF] hover:text-white hover:bg-white/5 h-12 rounded-lg transition-all font-bold group cursor-pointer",
              isCollapsed && "justify-center px-0",
            )}
          >
          <LogOut className="h-5 w-5 shrink-0 transition-colors" />
          {!isCollapsed && <span className="text-[14px]">تسجيل الخروج</span>}
        </Button>
      </div>
    </aside>
  );
});

Sidebar.displayName = "Sidebar";
export default Sidebar;
