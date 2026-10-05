"use client";

import React, { useEffect, useState } from "react";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import { Shield, Key, Trash2, Award, Terminal, UploadCloud, Check, Flame } from "lucide-react";
import { getImageUrl } from "@/lib/utils";

export default function AdminPage() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [wiping, setWiping] = useState(false);
  
  const [hofMembers, setHofMembers] = useState([]);
  const [hofForm, setHofForm] = useState({ fullName: "", description: "", githubUrl: "", linkedInUrl: "", telegramId: "", email: "", file: null });

  const loadData = async () => {
    try {
      if (tab === "users") {
        const res = await cessaService.users.adminGetAll({});
        setUsers(res?.data || []);
      } else if (tab === "logs") {
        const res = await cessaService.logs.getSystemLogs();
        setLogs(res?.data || []);
      } else if (tab === "halloffame") {
        const res = await cessaService.hallOfFame.getAll("admin");
        setHofMembers(res?.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadData(); }, [tab]);

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
    const newPass = prompt("رمز عبور جدید را وارد کنید (حداقل 6 کاراکتر):");
    if (!newPass) return;
    try {
      await cessaService.users.adminBypassPassword(id, newPass);
      alert("رمز عبور کاربر با موفقیت تغییر کرد.");
    } catch (err) {
      alert("خطا در تغییر پسورد");
    }
  };

  const handleRemoveUser = async (id) => {
    if (!confirm("آیا از حذف این کاربر اطمینان دارید؟")) return;
    try {
      await cessaService.users.adminRemove(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      alert("کاربر با موفقیت حذف موقت شد.");
    } catch (err) {
      alert("خطا در حذف کاربر");
    }
  };

  // HARD DELETE / WIPE OUT HANDLER
  const handleWipeOut = async () => {
    const confirmed = confirm(
      "⚠️ هشدار امنیتی پاکسازی کامل (Wipe Out)!\n\nاین عملیات تمامی کاربرانی که قبلاً حذف موقت شده‌اند را برای همیشه و به صورت غیرقابل بازگشت از پایگاه داده پاک می‌کند.\n\nآیا از اجرای پاکسازی اطمینان دارید؟"
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

  const handleAddHof = async (e) => {
    e.preventDefault();
    try {
      let photoFileId = null;
      if (hofForm.file) {
        const fileRes = await cessaService.files.upload(hofForm.file);
        photoFileId = fileRes.data;
      }
      
      const payload = {
        fullName: hofForm.fullName,
        description: hofForm.description,
        githubUrl: hofForm.githubUrl,
        linkedInUrl: hofForm.linkedInUrl,
        telegramId: hofForm.telegramId,
        email: hofForm.email,
        photoFileId: photoFileId
      };
      
      await cessaService.hallOfFame.addMember(payload);
      alert("نخبه جدید با موفقیت به تالار مفاخر اضافه شد.");
      setHofForm({ fullName: "", description: "", githubUrl: "", linkedInUrl: "", telegramId: "", email: "", file: null });
      loadData(); 
    } catch (err) {
      alert("خطا در ثبت نخبگان");
    }
  };

  const handleDeleteHof = async (id) => {
    if (!confirm("از حذف این شخص از تالار مفاخر اطمینان دارید؟")) return;
    try {
      await cessaService.hallOfFame.deleteMember(id);
      loadData(); 
    } catch (err) {
      alert("خطا در حذف");
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="text-amber-400" />
            <span>مرکز فرماندهی مدیریت سیستم</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-mono">// ROOT_SECURITY_CLEARANCE_REQUIRED</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[{ id: "users", label: "مدیریت کاربران" }, { id: "logs", label: "لاگ‌های سیستم" }, { id: "halloffame", label: "تالار مفاخر" }].map((t) => (
            <button
              key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                tab === t.id ? "bg-amber-400 text-dark-950 font-bold shadow-[0_0_15px_rgba(251,191,36,0.3)]" : "bg-dark-900 text-gray-400 border border-white/10 hover:border-amber-400/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "users" && (
        <div className="space-y-4">
          {/* Action Header with Wipe Out Button */}
          <div className="flex justify-between items-center bg-dark-900 p-4 rounded-2xl border border-white/5 shadow-md">
            <span className="text-xs text-gray-400">
              تعداد کاربران فعال: <strong className="text-white font-mono">{users.length}</strong>
            </span>

            <button
              onClick={handleWipeOut}
              disabled={wiping}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500/15 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/30 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.15)] disabled:opacity-50 cursor-pointer"
              title="پاکسازی تمام کاربران حذف‌شده"
            >
              <Flame size={16} className={wiping ? "animate-spin" : "text-rose-400"} />
              <span>{wiping ? "در حال پاکسازی..." : "پاکسازی کاربران حذف‌شده"}</span>
            </button>
          </div>

          <div className="glass-panel rounded-2xl overflow-x-auto border-white/5 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
            <table className="w-full text-right text-xs min-w-[600px]">
              <thead className="bg-dark-900 text-gray-400 font-mono border-b border-white/10">
                <tr>
                  <th className="p-4 rounded-tr-2xl">کاربر</th>
                  <th className="p-4">ایمیل آدرس</th>
                  <th className="p-4">شماره دانشجویی</th>
                  <th className="p-4 rounded-tl-2xl">عملیات کنترلی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 text-white font-medium flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-cyber-teal bg-dark-900 flex items-center justify-center font-bold text-cyber-teal overflow-hidden shrink-0">
                        {u.profilePictureUrl ? (
                          <img src={getImageUrl(u.profilePictureUrl)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          u.firstName ? u.firstName[0] : "U"
                        )}
                      </div>
                      <div>
                        {u.firstName} {u.lastName}
                        {u.roles?.includes("ContentCreator") && (
                          <span className={`block mt-1 text-[10px] px-2 py-0.5 rounded w-max ${u.isVerifiedCreator ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                            {u.isVerifiedCreator ? "Verified CC" : "Pending CC"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-gray-400" dir="ltr">{u.email}</td>
                    <td className="p-4 font-mono text-gray-400">{u.studentNumber || "—"}</td>
                    <td className="p-4 flex items-center gap-3">
                      {u.roles?.includes("ContentCreator") && !u.isVerifiedCreator && (
                        <button onClick={() => handleVerifyCreator(u.id)} className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer" title="تایید حساب کاربری">
                          <Check size={16} />
                        </button>
                      )}
                      <button onClick={() => handleBypassPassword(u.id)} className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 hover:bg-amber-400 hover:text-black transition-all cursor-pointer" title="تغییر اجباری رمز">
                        <Key size={16} />
                      </button>
                      <button onClick={() => handleRemoveUser(u.id)} className="p-2 rounded-xl bg-red-400/10 text-red-400 border border-red-400/20 hover:bg-red-400 hover:text-white transition-all cursor-pointer" title="حذف کاربر">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "logs" && (
        <div className="glass-panel rounded-2xl p-4 font-mono text-xs space-y-2 max-h-[600px] overflow-y-auto border-white/5">
          {logs.map((l) => (
            <div key={l.id} className="p-3 bg-dark-900 rounded-xl border border-white/5 flex items-start gap-3 hover:border-cyber-teal/30 transition-colors">
              <Terminal size={16} className="text-cyber-teal shrink-0 mt-0.5" />
              <div>
                <span className="text-cyber-mint font-bold">[{l.action}]</span> <span className="text-gray-300">{l.details}</span>
                <p className="text-[10px] text-gray-500 mt-1">{new Date(l.createdAt).toLocaleString("fa-IR")}</p>
              </div>
            </div>
          ))}
          {logs.length === 0 && <div className="text-center p-4 text-gray-500">لاگی در سیستم ثبت نشده است.</div>}
        </div>
      )}

      {tab === "halloffame" && (
        <div className="space-y-6">
          <form onSubmit={handleAddHof} className="glass-panel p-8 rounded-3xl max-w-xl mx-auto space-y-5 border-amber-400/20 shadow-[0_0_30px_rgba(251,191,36,0.1)]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Award className="text-amber-400" />
              <span>ثبت رکورد در تالار مفاخر</span>
            </h3>
            <input type="text" placeholder="نام و نام خانوادگی (الزامی)" required value={hofForm.fullName} onChange={(e) => setHofForm({ ...hofForm, fullName: e.target.value })} className="w-full bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-sm outline-none focus:border-amber-400 transition-colors" />
            <textarea placeholder="شرح افتخارات و دستاوردها (الزامی)..." required rows={3} value={hofForm.description} onChange={(e) => setHofForm({ ...hofForm, description: e.target.value })} className="w-full bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-sm outline-none focus:border-amber-400 transition-colors" />
            
            <div className="grid grid-cols-2 gap-3">
              <input type="url" placeholder="لینک GitHub" value={hofForm.githubUrl} onChange={(e) => setHofForm({ ...hofForm, githubUrl: e.target.value })} className="w-full bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-xs font-mono text-left outline-none focus:border-amber-400 transition-colors" />
              <input type="url" placeholder="لینک LinkedIn" value={hofForm.linkedInUrl} onChange={(e) => setHofForm({ ...hofForm, linkedInUrl: e.target.value })} className="w-full bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-xs font-mono text-left outline-none focus:border-amber-400 transition-colors" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="آیدی Telegram" value={hofForm.telegramId} onChange={(e) => setHofForm({ ...hofForm, telegramId: e.target.value })} className="w-full bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-xs font-mono text-left outline-none focus:border-amber-400 transition-colors" />
              <input type="email" placeholder="ایمیل شخصی" value={hofForm.email} onChange={(e) => setHofForm({ ...hofForm, email: e.target.value })} className="w-full bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-xs font-mono text-left outline-none focus:border-amber-400 transition-colors" />
            </div>

            <div className="w-full bg-dark-900 rounded-xl p-3 border border-white/10 border-dashed hover:border-amber-400 transition-colors">
              <label className="flex items-center justify-center gap-2 text-xs text-gray-400 cursor-pointer w-full h-full">
                <UploadCloud size={16} className="text-amber-400" />
                <span className="text-amber-400 border border-amber-400/50 rounded px-2 py-1">آپلود عکس</span>
                <span>{hofForm.file ? hofForm.file.name : "انتخاب فایل (اختیاری)"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setHofForm({...hofForm, file: e.target.files[0]})} />
              </label>
            </div>

            <button type="submit" className="w-full mt-4 py-3.5 bg-amber-400 hover:bg-amber-300 text-dark-950 font-bold rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(251,191,36,0.4)] cursor-pointer">
              ثبت در تالار مفاخر
            </button>
          </form>

          <div className="glass-panel rounded-2xl overflow-x-auto border-white/5 shadow-[0_0_20px_rgba(0,0,0,0.3)] mt-10">
            <table className="w-full text-right text-xs min-w-[600px]">
              <thead className="bg-dark-900 text-gray-400 font-mono border-b border-white/10">
                <tr>
                  <th className="p-4 rounded-tr-2xl">نام کامل</th>
                  <th className="p-4">توضیحات</th>
                  <th className="p-4 rounded-tl-2xl text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {hofMembers.map((h) => (
                  <tr key={h.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 text-white font-medium">{h.fullName}</td>
                    <td className="p-4 text-gray-400 truncate max-w-xs">{h.description}</td>
                    <td className="p-4 text-left">
                      <button onClick={() => handleDeleteHof(h.id)} className="p-2 rounded-xl bg-red-400/10 text-red-400 border border-red-400/20 hover:bg-red-400 hover:text-white transition-all cursor-pointer" title="حذف رکورد">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}