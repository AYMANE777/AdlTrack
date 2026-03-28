"use client";

import React, { memo, useState, useEffect, useCallback } from "react";
import {
  Menu,
  Bell,
  User as UserIcon,
  ChevronDown,
  Moon,
  Sun,
  Settings,
  LogOut,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useLayout } from "@/context/LayoutContext";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const Header = memo(() => {
  const { user } = useAuth();
  const { isCollapsed, setIsCollapsed, isDarkMode, toggleDarkMode } = useLayout();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAllNotificationsOpen, setIsAllNotificationsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/notifications?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      // Silently ignore fetch errors (e.g. during dev server restarts)
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 90000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllAsRead = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, markAllRead: true }),
      });
      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      if (res.ok) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <>
      <header className="flex h-20 items-center bg-white dark:bg-[#24303F] px-8 gap-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)] z-40 border-b border-[#E2E8F0] dark:border-[#2E3A47] shrink-0">
        <div className="flex items-center gap-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-[#64748B] dark:text-[#AEB7C0] hover:bg-[#F7F9FC] dark:hover:bg-[#313D4A]"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

          <div className="flex-1" />

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-full bg-[#EFF4FB] dark:bg-[#313D4A] text-[#64748B] dark:text-[#AEB7C0] h-10 w-10 hover:shadow-sm transition-all"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full bg-[#EFF4FB] dark:bg-[#313D4A] text-[#64748B] dark:text-[#AEB7C0] h-10 w-10 hover:shadow-sm transition-all cursor-pointer"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -left-1 flex items-center justify-center h-5 w-5 rounded-full bg-[#FB5454] text-white text-[10px] font-bold border-2 border-white dark:border-[#313D4A]">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-80 mt-2 p-3 dark:bg-[#24303F] dark:border-[#2E3A47] rounded-2xl shadow-2xl animate-in slide-in-from-top-2"
                align="end"
              >
                <DropdownMenuLabel className="flex items-center justify-between pb-2">
                  <span className="font-black text-[#1C2434] dark:text-white">الإشعارات</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        markAllAsRead();
                      }}
                      disabled={loading}
                      className="text-xs font-bold text-[#3C50E0] cursor-pointer hover:underline flex items-center gap-1 disabled:opacity-50"
                    >
                      <CheckCheck className="h-3 w-3" />
                      تحديد الكل كمقروء
                    </button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-2 dark:bg-[#2E3A47]" />
                <div className="max-h-72 overflow-y-auto space-y-1">
                  {recentNotifications.length === 0 ? (
                    <div className="text-center py-8 text-[#64748B]">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-bold">لا توجد إشعارات</p>
                    </div>
                    ) : (
                      recentNotifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className="flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-[#313D4A] transition-all"
                          onClick={() => {
                            if (!notification.isRead) {
                              markAsRead(notification.id);
                            }
                          }}
                        >
                          <div className="bg-[#3C50E0]/10 p-2 rounded-lg shrink-0">
                            <Bell className="h-4 w-4 text-[#3C50E0]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#1C2434] dark:text-white truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-[#64748B] mt-0.5 truncate">
                              {notification.message}
                            </p>
                            <p className="text-xs text-[#8A99AF] mt-1">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ar })}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#3C50E0] shrink-0 mt-2" />
                          )}
                        </DropdownMenuItem>
                      ))
                    )}
                </div>
                {notifications.length > 0 && (
                  <>
                    <DropdownMenuSeparator className="my-2 dark:bg-[#2E3A47]" />
                    <div className="text-center py-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsAllNotificationsOpen(true);
                        }}
                        className="text-sm font-bold text-[#3C50E0] cursor-pointer hover:underline"
                      >
                        عرض كل الإشعارات
                      </button>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="h-10 w-[1px] bg-[#E2E8F0] dark:bg-[#2E3A47] mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 px-2 h-14 hover:bg-[#F8FAFC] dark:hover:bg-[#313D4A] rounded-xl transition-all border border-transparent hover:border-[#E2E8F0] dark:hover:border-[#2E3A47]"
              >
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-black text-[#1C2434] dark:text-white leading-none tracking-tight">
                    {user?.fullName || user?.email}
                  </span>
                  <span className="text-[11px] text-[#64748B] mt-1.5 font-black uppercase tracking-wider">
                    {user?.role === "admin" ? "مدير النظام" : "موظف"}
                  </span>
                </div>
                <div className="relative">
                  <Avatar className="h-11 w-11 rounded-full border-2 border-[#3C50E0]/20 ring-2 ring-[#3C50E0]/10 transition-all shadow-md">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.fullName || user?.email}&backgroundColor=3C50E0&textColor=ffffff&fontSize=40&fontWeight=600`}
                      alt="User"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-[#3C50E0] to-[#6366F1] text-white font-semibold text-base">
                      {(user?.fullName || "U").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 left-0 w-3 h-3 bg-[#10B981] border-2 border-white dark:border-[#24303F] rounded-full" />
                </div>
                <ChevronDown className="h-4 w-4 text-[#8A99AF] hidden sm:block transition-transform duration-300" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-72 mt-2 p-3 dark:bg-[#24303F] dark:border-[#2E3A47] rounded-2xl shadow-2xl animate-in slide-in-from-top-2"
              align="start"
            >
              <DropdownMenuLabel className="p-4 bg-[#F7F9FC] dark:bg-[#313D4A] rounded-xl mb-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-[#3C50E0]/20 ring-2 ring-[#3C50E0]/10 shadow-md">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.fullName || user?.email}&backgroundColor=3C50E0&textColor=ffffff&fontSize=40&fontWeight=600`}
                      alt="User"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-[#3C50E0] to-[#6366F1] text-white font-semibold">
                      {(user?.fullName || "U").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-black dark:text-white leading-tight">
                      {user?.fullName}
                    </p>
                    <p className="text-[11px] text-[#64748B] font-bold mt-1">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-2 dark:bg-[#2E3A47]" />
            <DropdownMenuItem
              className="h-12 gap-4 rounded-xl cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-[#313D4A] dark:text-white transition-all px-4 group"
              onClick={() => router.push("/profile")}
            >
              <div className="bg-[#EFF4FB] dark:bg-[#3D4D5C] p-2 rounded-lg group-hover:bg-white dark:group-hover:bg-[#24303F] transition-colors">
                <UserIcon className="h-4 w-4 text-[#64748B]" />
              </div>
              <span className="text-sm font-bold">الملف الشخصي</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="h-12 gap-4 rounded-xl cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-[#313D4A] dark:text-white transition-all px-4 group"
              onClick={() => router.push("/settings")}
            >
              <div className="bg-[#EFF4FB] dark:bg-[#3D4D5C] p-2 rounded-lg group-hover:bg-white dark:group-hover:bg-[#24303F] transition-colors">
                <Settings className="h-4 w-4 text-[#64748B]" />
              </div>
              <span className="text-sm font-bold">إعدادات الحساب</span>
            </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2 dark:bg-[#2E3A47]" />
              <DropdownMenuItem
                className="h-12 gap-4 rounded-xl cursor-pointer text-[#FB5454] hover:bg-[#FB5454]/5 focus:bg-[#FB5454]/5 focus:text-[#FB5454] px-4"
                  onClick={() => {
                    localStorage.removeItem("auth_user");
                    localStorage.removeItem("auth_login_time");
                    document.cookie = "auth_token=; path=/; max-age=0";
                    window.location.href = "/login";
                  }}
              >
                <div className="bg-[#FB5454]/10 p-2 rounded-lg">
                  <LogOut className="h-4 w-4" />
                </div>
                <span className="text-sm font-black">تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Dialog open={isAllNotificationsOpen} onOpenChange={setIsAllNotificationsOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[85vh] border-none shadow-2xl rounded-2xl font-cairo bg-white dark:bg-[#24303F]" dir="rtl">
          <DialogHeader className="p-6 bg-white dark:bg-[#24303F] border-b border-[#E2E8F0] dark:border-[#2E3A47] rounded-t-2xl">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-black text-[#1C2434] dark:text-white">
                كل الإشعارات
              </DialogTitle>
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="gap-2 font-bold rounded-xl"
                >
                  <CheckCheck className="h-4 w-4" />
                  تحديد الكل كمقروء
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="p-4 overflow-y-auto max-h-[60vh] space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-[#64748B]">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-bold">لا توجد إشعارات</p>
                <p className="text-sm mt-2">ستظهر الإشعارات هنا عند وجود تحديثات جديدة</p>
              </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsRead(notification.id);
                      }
                    }}
                    className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                      notification.isRead 
                        ? "bg-[#F8FAFC] dark:bg-[#313D4A]/50" 
                        : "bg-white dark:bg-[#313D4A] border border-[#E2E8F0] dark:border-[#2E3A47] shadow-sm"
                    }`}
                  >
                    <div className="bg-[#3C50E0]/10 p-3 rounded-xl shrink-0">
                      <Bell className="h-4 w-4 text-[#3C50E0]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${notification.isRead ? "text-[#64748B]" : "text-[#1C2434] dark:text-white"}`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-[#64748B] mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-[#8A99AF] mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ar })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3C50E0] shrink-0 mt-2" />
                    )}
                  </div>
                ))
              )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

Header.displayName = "Header";
export default Header;
