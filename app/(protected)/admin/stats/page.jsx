"use client";

import React, { useEffect, useState } from "react";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import { 
  Activity, Users, UserPlus, CheckCircle2, Ban, FileText, MessageSquare, 
  ThumbsUp, TrendingUp, Clock, HardDrive, Megaphone, Calendar, Check, Award, Terminal
} from "lucide-react";

const StatCard = ({ title, value, icon: Icon, color, bg, border }) => (
  <div className={`p-6 rounded-2xl border ${border} ${bg} flex flex-col justify-between items-start gap-5 transition-transform hover:-translate-y-1 duration-300 shadow-lg`}>
    <div className={`p-3.5 rounded-2xl bg-dark-900 shadow-inner border border-white/5 ${color}`}>
      <Icon size={26} strokeWidth={2.5} />
    </div>
    <div className="w-full">
      <h4 className="text-gray-400 text-sm font-bold mb-1.5">{title}</h4>
      <span className={`text-3xl font-black ${color} font-mono block`}>{value?.toLocaleString("fa-IR") || 0}</span>
    </div>
  </div>
);

export default function AdminStatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await cessaService.stats.getSystemStats();
        setStats(res?.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <div className="text-cyber-teal font-mono animate-pulse p-10">// LOADING_SYSTEM_METRICS...</div>;
  if (!stats) return <div className="text-red-400 p-10">خطا در دریافت اطلاعات آماری از سرور.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="text-blue-400" />
          <span>آمار جامع و وضعیت سیستم</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1 font-mono">// LIVE_METRICS_DASHBOARD</p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-4 border-r-4 border-blue-500 pr-3">آمار کاربران</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="کل کاربران ثبت‌نامی" value={stats.totalUsers} icon={Users} color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20" />
          <StatCard title="کاربران جدید (۳۰ روز)" value={stats.newUsers30Days} icon={UserPlus} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
          <StatCard title="تولیدکنندگان محتوا" value={stats.verifiedCreators} icon={CheckCircle2} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20" />
          <StatCard title="کاربران مسدود شده" value={stats.deletedUsers} icon={Ban} color="text-red-400" bg="bg-red-500/10" border="border-red-500/20" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-4 border-r-4 border-purple-500 pr-3">آمار محتوا و تعاملات</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="کل مطالب (پست‌ها)" value={stats.totalPosts} icon={FileText} color="text-purple-400" bg="bg-purple-500/10" border="border-purple-500/20" />
          <StatCard title="نظرات ثبت شده" value={stats.totalComments} icon={MessageSquare} color="text-pink-400" bg="bg-pink-500/10" border="border-pink-500/20" />
          <StatCard title="مجموع لایک‌ها" value={stats.totalLikes} icon={ThumbsUp} color="text-rose-400" bg="bg-rose-500/10" border="border-rose-500/20" />
          <StatCard title="مطالب جدید (۳۰ روز)" value={stats.newPosts30Days} icon={TrendingUp} color="text-indigo-400" bg="bg-indigo-500/10" border="border-indigo-500/20" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-4 border-r-4 border-teal-500 pr-3">آمار رویدادها</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="کل رویدادهای ایجاد شده" value={stats.totalEvents} icon={Calendar} color="text-teal-400" bg="bg-teal-500/10" border="border-teal-500/20" />
          <StatCard title="مجموع ثبت‌نام‌ها" value={stats.totalEnrollments} icon={Users} color="text-cyan-400" bg="bg-cyan-500/10" border="border-cyan-500/20" />
          <StatCard title="ثبت‌نام‌های تایید شده" value={stats.acceptedEnrollments} icon={Check} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
          <StatCard title="در انتظار تایید رسید" value={stats.pendingEnrollments} icon={Clock} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-4 border-r-4 border-gray-500 pr-3">آمار سیستم و پایگاه داده</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="فایل‌های ذخیره شده" value={stats.totalFiles} icon={HardDrive} color="text-gray-400" bg="bg-gray-500/10" border="border-gray-500/20" />
          <StatCard title="بنرهای تبلیغاتی فعال" value={stats.activeAds} icon={Megaphone} color="text-yellow-400" bg="bg-yellow-500/10" border="border-yellow-500/20" />
          <StatCard title="مفاخر و اعضای شورا" value={stats.totalHofMembers} icon={Award} color="text-orange-400" bg="bg-orange-500/10" border="border-orange-500/20" />
          <StatCard title="لاگ‌های ثبت شده" value={stats.totalLogs} icon={Terminal} color="text-lime-400" bg="bg-lime-500/10" border="border-lime-500/20" />
        </div>
      </div>
    </div>
  );
}
