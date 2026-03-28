"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
    FileText, 
    Clock, 
    ArrowUpRight, 
    ArrowDownRight,
    Link as LinkIcon,
    Coins,
    Target,
    Calendar,
    RotateCcw,
    Loader2,
    ClipboardList,
    Gavel,
    Users,
    History,
    ReceiptText
  } from "lucide-react";
import { DashboardCharts } from "@/components/DashboardCharts";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Stats {
    rehabCount: number;
    altPenaltyCount: number;
    rapportCount: number;
    usersCount: number;
    auditCount: number;
    rehabTodayCount: number;
    altTodayCount: number;
    rapportTodayCount: number;
  }

interface MonthlyData {
  month: string;
  monthIndex: number;
  rehabilitation: number;
  penalties: number;
}

interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface WeeklyData {
  day: string;
  date: string;
  count: number;
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
      rehabCount: 0,
      altPenaltyCount: 0,
      rapportCount: 0,
      usersCount: 0,
      auditCount: 0,
      rehabTodayCount: 0,
      altTodayCount: 0,
      rapportTodayCount: 0,
  });
  const [monthlyStats, setMonthlyStats] = useState<MonthlyData[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusData[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch("/api/stats");
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats || stats);
          setMonthlyStats(data.monthlyStats || []);
          setStatusDistribution(data.statusDistribution || []);
          setWeeklyActivity(data.weeklyActivity || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  const statsConfig = [
    { 
      title: "طلبات رد الاعتبار", 
      value: (stats?.rehabCount || 0).toString(), 
      change: `+${stats?.rehabTodayCount || 0} اليوم`,
      isUp: true,
      icon: ClipboardList, 
      color: "text-[#3C50E0]", 
      bg: "bg-[#3C50E0]/10",
    },
      { 
        title: "العقوبات البديلة", 
        value: (stats?.altPenaltyCount || 0).toString(), 
        change: `+${stats?.altTodayCount || 0} اليوم`,
        isUp: true,
        icon: Gavel, 
        color: "text-[#10B981]", 
        bg: "bg-[#10B981]/10",
      },
      { 
        title: "تقارير رد الاعتبار", 
        value: (stats?.rapportCount || 0).toString(), 
        change: `+${stats?.rapportTodayCount || 0} اليوم`,
        isUp: true,
        icon: ReceiptText, 
        color: "text-[#F97316]", 
        bg: "bg-[#F97316]/10",
      },
    { 
      title: "المستخدمين", 
      value: (stats?.usersCount || 0).toString(), 
      change: "مستخدم",
      isUp: true,
      icon: Users, 
      color: "text-[#8B5CF6]", 
      bg: "bg-[#8B5CF6]/10",
    },
    { 
      title: "سجل العمليات", 
      value: (stats?.auditCount || 0).toString(), 
      change: "عملية",
      isUp: true,
      icon: History, 
      color: "text-[#F59E0B]", 
      bg: "bg-[#F59E0B]/10",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#3C50E0]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statsConfig.map((stat, index) => (
          <Card key={index} className="border-none shadow-sm hover:shadow-md transition-all bg-white dark:bg-[#24303F] group border-b-4 border-transparent hover:border-b-[#3C50E0]">
            <CardContent className="p-7">
              <div className="flex items-start justify-between">
                <div className={`${stat.bg} ${stat.color} p-4 rounded-full transition-all group-hover:scale-110`}>
                  <stat.icon className="h-7 w-7" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-black ${stat.isUp ? 'text-[#10B981]' : 'text-[#FB5454]'}`}>
                  {stat.isUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-3xl font-black text-[#1C2434] dark:text-white mb-1 tracking-tight">{stat.value}</h3>
                <p className="text-sm font-bold text-[#8A99AF] uppercase tracking-wide">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-8 bg-[#3C50E0] rounded-full shadow-[0_0_10px_rgba(60,80,224,0.3)]" />
          <h2 className="text-2xl font-black text-[#1C2434] dark:text-white tracking-tight">التحليلات والرسوم البيانية</h2>
        </div>
        <DashboardCharts 
          monthlyData={monthlyStats} 
          statusData={statusDistribution} 
          weeklyData={weeklyActivity} 
        />
      </div>

      {/* Quick Access Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm bg-white dark:bg-[#24303F] overflow-hidden group">
          <div className="h-2 w-full bg-[#3C50E0]" />
          <CardContent className="p-8 flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-[#1C2434] dark:text-white">طلبات رد الاعتبار</h3>
              <p className="text-[#8A99AF] font-bold text-sm">إدارة ومتابعة طلبات رد الاعتبار المسجلة</p>
              <Button 
                className="mt-4 bg-[#3C50E0] hover:bg-[#3C50E0]/90 text-white font-black rounded-xl h-12 px-8"
                onClick={() => handleNavigate("/rehabilitation-requests")}
              >
                عرض القائمة
              </Button>
            </div>
            <div className="bg-[#3C50E0]/10 p-6 rounded-2xl group-hover:scale-110 transition-transform">
              <ClipboardList className="h-12 w-12 text-[#3C50E0]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-[#24303F] overflow-hidden group">
          <div className="h-2 w-full bg-[#10B981]" />
          <CardContent className="p-8 flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-[#1C2434] dark:text-white">سجل العقوبات البديلة</h3>
              <p className="text-[#8A99AF] font-bold text-sm">تتبع وتنفيذ العقوبات البديلة</p>
              <Button 
                className="mt-4 bg-[#10B981] hover:bg-[#10B981]/90 text-white font-black rounded-xl h-12 px-8"
                onClick={() => handleNavigate("/alternative-penalties")}
              >
                عرض السجل
              </Button>
            </div>
            <div className="bg-[#10B981]/10 p-6 rounded-2xl group-hover:scale-110 transition-transform">
              <Gavel className="h-12 w-12 text-[#10B981]" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
