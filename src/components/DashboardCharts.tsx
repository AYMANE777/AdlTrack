"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity } from "lucide-react";

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

interface DashboardChartsProps {
  monthlyData: MonthlyData[];
  statusData: StatusData[];
  weeklyData: WeeklyData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#24303F] p-4 rounded-xl shadow-lg border border-[#E2E8F0] dark:border-[#2E3A47]">
        <p className="font-bold text-[#1C2434] dark:text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">{entry.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function DashboardCharts({ monthlyData, statusData, weeklyData }: DashboardChartsProps) {
  const totalItems = statusData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
      <Card className="border-none shadow-sm bg-white dark:bg-[#24303F] col-span-1 lg:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="bg-[#3C50E0]/10 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-[#3C50E0]" />
            </div>
            <CardTitle className="text-lg font-black text-[#1C2434] dark:text-white">
              النمو الشهري للطلبات والسجلات
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRehab" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3C50E0" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3C50E0" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPenalties" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#8A99AF', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#8A99AF', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="rehabilitation"
                  name="رد الاعتبار"
                  stroke="#3C50E0"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRehab)"
                />
                <Area
                  type="monotone"
                  dataKey="penalties"
                  name="العقوبات البديلة"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPenalties)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white dark:bg-[#24303F]">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="bg-[#FFBA00]/10 p-2 rounded-lg">
              <PieChartIcon className="h-5 w-5 text-[#FFBA00]" />
            </div>
            <CardTitle className="text-lg font-black text-[#1C2434] dark:text-white">
              توزيع الحالات (رد الاعتبار)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-bold text-[#8A99AF]">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white dark:bg-[#24303F]">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="bg-[#FB5454]/10 p-2 rounded-lg">
              <Activity className="h-5 w-5 text-[#FB5454]" />
            </div>
            <CardTitle className="text-lg font-black text-[#1C2434] dark:text-white">
              النشاط الأسبوعي الإجمالي
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#8A99AF', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#8A99AF', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  name="العمليات"
                  fill="#3C50E0" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
