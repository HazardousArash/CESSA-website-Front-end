"use client";

import React, { useEffect, useState, useCallback } from "react";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import { Key, Trash2, Check, Users, Flame, Search, Calendar, RefreshCw } from "lucide-react";
import { getImageUrl } from "@/lib/utils";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entryYear, setEntryYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [wiping, setWiping] = useState(false);

  const loadData = useCallback(async (search = searchTerm, year = entryYear) => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.searchTerm = search.trim();
      if (year) params.entryYear = parseInt(year, 10);

      const res = await cessaService.users.adminGetAll(params);
      setUsers(res?.data || []);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, entryYear]);

  // Debounced search trigger
  useEffect(() => {
    const delayTimer = setTimeout(() => {
      loadData(searchTerm, entryYear);
    }, 400);

    return () => clearTimeout(delayTimer);
  }, [searchTerm, entryYear, loadData]);

  const handleVerifyCreator = async (id) => {
    if (!confirm("تایید این کاربر به عنوان تولیدکننده محتوا؟")) return;
    try {
      await cessaService.users.adminVerifyCreator(id);
      loadData();
      alert("حساب کاربر با موفقیت تایید شد.");
    } catch (err) {
      alert("خطا در تایید حساب");
    }
  };

  const handleBypassPassword = async (id) => {
    const newPass = prompt("رمز عبور جدید را وارد کنید (حداقل ۶ کاراکتر):");
    if (!newPass) return;
    try {
      await cessaService.users.adminBypassPassword(id, newPass);
      alert("رمز عبور کاربر با موفقیت تغییر کرد.");
    } catch (err) {
      alert("خطا در تغییر پسورد");
    }
  };

  const handleRemoveUser = async (id) => {
    if (!confirm("آیا از حذف موقت این کاربر اطمینان دارید؟")) return;
    try {
      await cessaService.users.adminRemove(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      alert("کاربر با موفقیت حذف شد.");
    } catch (err) {
      alert("خطا در حذف کاربر");
    }
  };

  const handleWipeOut = async () => {
    const confirmed = confirm(
      "⚠️ هشدار امنیتی پاکسازی کامل!\n\nاین عملیات تمامی کاربرانی که قبلاً حذف موقت شده‌اند را برای همیشه و بدون امکان بازگشت از دیتابیس پاک می‌کند.\n\nآیا از اجرای پاکسازی اطمینان دارید؟"
    );
    if (!confirmed) return;

    setWiping(true);
    try {
      const res = await cessaService.users.adminWipeOut();
      const count = res?.data?.deletedCount ?? 0;
      alert(`عملیات با موفقیت انجام شد: ${count} کاربر حذف‌شده به طور دائمی پاکسازی شدند.`);
      loadData();
    } catch (err) {
      alert(err.message || "خطا در پاکسازی کاربران.");
    } finally {
      setWiping(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setEntryYear("");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-cyber-teal" />
            <span>مدیریت و جستجوی کاربران</span>
          </h2>
        </div>

        <button
          onClick={handleWipeOut}
          disabled={wiping}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white border border-rose-500/40 rounded-xl text-xs font-bold transition-all shadow-[0_0_20px_rgba(244,63,94,0.2)] disabled:opacity-50 cursor-pointer"
          title="پاکسازی کامل رکوردهای کاربران حذف‌شده"
        >
          <Flame size={16} className={wiping ? "animate-spin" : "text-rose-400"} />
          <span>{wiping ? "در حال پاکسازی..." : "پاکسازی کاربران حذف‌شده"}</span>
        </button>
      </div>

      {/* Unified Search & Filter Bar */}
      <div className="bg-dark-900 p-4 rounded-2xl border border-white/5 shadow-lg flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="جستجو بر اساس نام، نام خانوادگی یا ایمیل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-950 text-white rounded-xl py-3 px-4 pl-12 border border-white/10 outline-none focus:border-cyber-teal text-sm transition-all"
          />
          <Search className="absolute left-4 top-3.5 text-gray-500" size={18} />
        </div>

        <div className="w-full md:w-56 relative">
          <input
            type="number"
            placeholder="سال ورود (مثلاً 1403)"
            value={entryYear}
            onChange={(e) => setEntryYear(e.target.value)}
            className="w-full bg-dark-950 text-white rounded-xl py-3 px-4 pl-10 border border-white/10 outline-none focus:border-cyber-teal text-sm text-left font-sans transition-all"
          />
          <Calendar className="absolute left-4 top-3.5 text-gray-500" size={16} />
        </div>

        {(searchTerm || entryYear) && (
          <button
            onClick={clearFilters}
            className="px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw size={14} /> پاک کردن فیلترها
          </button>
        )}
      </div>

      {/* User Stats & Count */}
      <div className="flex justify-between items-center text-xs text-gray-400 px-1">
        <span>
          تعداد کاربران یافت شده: <strong className="text-cyber-teal font-mono">{users.length}</strong>
        </span>
        {loading && <span className="text-cyber-teal font-mono animate-pulse">در حال جستجو...</span>}
      </div>

      {/* Unified Users Table */}
      <div className="glass-panel rounded-3xl overflow-x-auto border-white/5 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
        <table className="w-full text-right text-xs min-w-[750px]">
          <thead className="bg-dark-900 text-gray-400 font-mono border-b border-white/10">
            <tr>
              <th className="p-5">کاربر</th>
              <th className="p-5">ایمیل آدرس</th>
              <th className="p-5 text-center">شماره دانشجویی</th>
              <th className="p-5 text-center">سال ورود</th>
              <th className="p-5 text-left">عملیات کنترلی</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                {/* User Avatar + Name + CC verification tag */}
                <td className="p-5 text-white font-medium flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl border border-cyber-teal/40 bg-dark-900 flex items-center justify-center font-bold text-cyber-teal overflow-hidden shrink-0 shadow-md">
                    {u.profilePictureUrl ? (
                      <img src={getImageUrl(u.profilePictureUrl)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      u.firstName ? u.firstName[0] : "U"
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-sm block">{u.firstName} {u.lastName}</span>
                    {u.roles?.includes("ContentCreator") && (
                      <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded ${u.isVerifiedCreator ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"}`}>
                        {u.isVerifiedCreator ? "تولیدکننده محتوا (رسمی)" : "در انتظار تایید مدیریت"}
                      </span>
                    )}
                  </div>
                </td>

                <td className="p-5 font-mono text-gray-400" dir="ltr">{u.email}</td>
                <td className="p-5 font-mono text-gray-400 text-center">{u.studentNumber || "—"}</td>
                <td className="p-5 font-sans text-gray-400 text-center">{u.entryYear ? `ورودی ${u.entryYear}` : "—"}</td>

                {/* Admin Actions */}
                <td className="p-5">
                  <div className="flex items-center justify-end gap-2">
                    {u.roles?.includes("ContentCreator") && !u.isVerifiedCreator && (
                      <button
                        onClick={() => handleVerifyCreator(u.id)}
                        className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                        title="تایید حساب تولیدکننده محتوا"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleBypassPassword(u.id)}
                      className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 hover:bg-amber-400 hover:text-black transition-all cursor-pointer"
                      title="تغییر اجباری رمز عبور"
                    >
                      <Key size={16} />
                    </button>
                    <button
                      onClick={() => handleRemoveUser(u.id)}
                      className="p-2 rounded-xl bg-red-400/10 text-red-400 border border-red-400/20 hover:bg-red-400 hover:text-white transition-all cursor-pointer"
                      title="حذف کاربر"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {users.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="p-10 text-center text-gray-500 font-sans">
                  هیچ کاربری با این مشخصات یافت نشد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}