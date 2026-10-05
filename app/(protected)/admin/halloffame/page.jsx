"use client";

import React, { useEffect, useState } from "react";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import { Award, Trash2, UploadCloud, Users, Edit, X } from "lucide-react";
import { getImageUrl } from "@/lib/utils";

export default function AdminHallOfFamePage() {
  const [members, setMembers] = useState([]);
  const [tab, setTab] = useState("fame");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [hofForm, setHofForm] = useState({ 
    fullName: "", description: "", githubUrl: "", linkedInUrl: "", telegramId: "", email: "", entryYear: "", term: "", roleTitle: "", photoUrl: null, file: null 
  });

  const termOptions = Array.from({ length: 22 }, (_, i) => {
    const y2 = 1405 - i;
    const y1 = y2 - 1;
    return `${y1}-${y2}`;
  });

  const loadData = async () => {
    try {
      const res = await cessaService.hallOfFame.getAll("admin");
      setMembers(res?.data || []);
    } catch (err) {}
  };

  useEffect(() => { loadData(); }, []);

  const handleStartEdit = (h) => {
    setEditingId(h.id);
    setTab(h.isAssociationMember ? "council" : "fame");
    setHofForm({
      fullName: h.fullName, description: h.description, githubUrl: h.githubUrl || "", linkedInUrl: h.linkedInUrl || "", telegramId: h.telegramId || "", email: h.email || "", entryYear: h.entryYear ? String(h.entryYear) : "", term: h.term || "", roleTitle: h.roleTitle || "", photoUrl: h.photoUrl || null, file: null
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setHofForm({ 
      fullName: "", description: "", githubUrl: "", linkedInUrl: "", telegramId: "", email: "", entryYear: "", term: "", roleTitle: "", photoUrl: null, file: null 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isAssociation = tab === "council";
    if (isAssociation && !hofForm.term) {
      alert("لطفاً دوره شورای مرکزی را انتخاب کنید.");
      setLoading(false);
      return;
    }

    try {
      let photoFileId = null;
      if (hofForm.file) {
        const fileRes = await cessaService.files.upload(hofForm.file);
        photoFileId = fileRes.data;
      }

      const payload = {
        fullName: hofForm.fullName, description: hofForm.description, githubUrl: hofForm.githubUrl || null, linkedInUrl: hofForm.linkedInUrl || null, telegramId: hofForm.telegramId || null, email: hofForm.email || null, photoFileId: photoFileId, entryYear: hofForm.entryYear ? parseInt(hofForm.entryYear, 10) : null, isAssociationMember: isAssociation, term: isAssociation ? hofForm.term : null, roleTitle: isAssociation && hofForm.roleTitle ? hofForm.roleTitle : null
      };

      if (editingId) {
        await cessaService.hallOfFame.updateMember(editingId, { id: editingId, ...payload });
        alert("اطلاعات با موفقیت به‌روزرسانی شد.");
      } else {
        await cessaService.hallOfFame.addMember(payload);
        alert(isAssociation ? "عضو جدید شورا ثبت شد." : "نخبه جدید ثبت شد.");
      }

      handleCancelEdit();
      loadData(); 
    } catch (err) { 
      alert(err.message || "خطا در ثبت اطلاعات"); 
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("آیا از حذف این رکورد اطمینان دارید؟")) return;
    try { 
      await cessaService.hallOfFame.deleteMember(id); 
      loadData();
      if (editingId === id) handleCancelEdit();
    } catch { alert("خطا در حذف"); }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <Award className="text-amber-400" />
          <span>مدیریت تالار مفاخر و ادوار انجمن علمی</span>
        </h2>
      </div>

      <div className="flex gap-2 p-1 bg-dark-900 rounded-2xl w-max border border-white/5">
        <button onClick={() => { setTab("fame"); handleCancelEdit(); }} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${tab === "fame" ? "bg-amber-400 text-dark-950 shadow-md" : "text-gray-400 hover:text-white"}`}>🏆 تالار مفاخر</button>
        <button onClick={() => { setTab("council"); handleCancelEdit(); }} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${tab === "council" ? "bg-cyber-teal text-dark-950 shadow-md" : "text-gray-400 hover:text-white"}`}>👥 عضو شورای مرکزی</button>
      </div>

      <form onSubmit={handleSubmit} className={`glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl space-y-4 border ${tab === "fame" ? "border-amber-400/20" : "border-cyber-teal/20"}`}>
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            {editingId ? <Edit size={20} className={tab === "fame" ? "text-amber-400" : "text-cyber-teal"} /> : (tab === "council" ? <Users className="text-cyber-teal" size={20} /> : <Award className="text-amber-400" size={20} />)}
            <span>{editingId ? "ویرایش اطلاعات رکورد" : tab === "council" ? "ثبت عضو شورای مرکزی انجمن علمی" : "ثبت نخبه در تالار مفاخر"}</span>
          </h3>
          {editingId && <button type="button" onClick={handleCancelEdit} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"><X size={14} /> انصراف از ویرایش</button>}
        </div>

        <input type="text" placeholder="نام و نام خانوادگی (الزامی)" required value={hofForm.fullName} onChange={(e) => setHofForm({ ...hofForm, fullName: e.target.value })} className={`w-full bg-dark-900 text-white rounded-xl p-3.5 border border-white/10 text-sm outline-none focus:border-${tab === "fame" ? "amber-400" : "cyber-teal"}`} />
        <textarea placeholder="شرح افتخارات و توضیحات (الزامی)..." required rows={3} value={hofForm.description} onChange={(e) => setHofForm({ ...hofForm, description: e.target.value })} className={`w-full bg-dark-900 text-white rounded-xl p-3.5 border border-white/10 text-sm outline-none focus:border-${tab === "fame" ? "amber-400" : "cyber-teal"}`} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="number" placeholder="سال ورود به دانشگاه (مثلاً ۱۴۰۱)" value={hofForm.entryYear} onChange={(e) => setHofForm({ ...hofForm, entryYear: e.target.value })} className={`w-full bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-sm font-sans text-left outline-none focus:border-${tab === "fame" ? "amber-400" : "cyber-teal"}`} />

          {tab === "council" && (
            <select value={hofForm.term} onChange={(e) => setHofForm({ ...hofForm, term: e.target.value })} className="w-full bg-dark-900 text-white rounded-xl p-3 border border-cyber-teal/40 text-sm font-mono text-center outline-none focus:border-cyber-teal cursor-pointer" required>
              <option value="">-- انتخاب دوره شورا (الزامی) --</option>
              {termOptions.map(t => <option key={t} value={t}>دوره {t}</option>)}
            </select>
          )}
        </div>

        {tab === "council" && <input type="text" placeholder="سمت در شورای مرکزی (اختیاری - مانند دبیر، روابط عمومی)" value={hofForm.roleTitle} onChange={(e) => setHofForm({ ...hofForm, roleTitle: e.target.value })} className="w-full bg-dark-900 text-white rounded-xl p-3 border border-cyber-teal/30 text-sm outline-none focus:border-cyber-teal" />}

        <div className="grid grid-cols-2 gap-3">
          <input type="url" placeholder="لینک GitHub" value={hofForm.githubUrl} onChange={(e) => setHofForm({ ...hofForm, githubUrl: e.target.value })} className={`w-full bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-xs font-mono text-left outline-none focus:border-${tab === "fame" ? "amber-400" : "cyber-teal"}`} />
          <input type="url" placeholder="لینک LinkedIn" value={hofForm.linkedInUrl} onChange={(e) => setHofForm({ ...hofForm, linkedInUrl: e.target.value })} className={`w-full bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-xs font-mono text-left outline-none focus:border-${tab === "fame" ? "amber-400" : "cyber-teal"}`} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input type="text" placeholder="آیدی Telegram" value={hofForm.telegramId} onChange={(e) => setHofForm({ ...hofForm, telegramId: e.target.value })} className={`w-full bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-xs font-mono text-left outline-none focus:border-${tab === "fame" ? "amber-400" : "cyber-teal"}`} />
          <input type="email" placeholder="ایمیل شخصی" value={hofForm.email} onChange={(e) => setHofForm({ ...hofForm, email: e.target.value })} className={`w-full bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-xs font-mono text-left outline-none focus:border-${tab === "fame" ? "amber-400" : "cyber-teal"}`} />
        </div>

        <div className={`w-full bg-dark-900 rounded-xl p-4 border border-white/10 border-dashed hover:border-${tab === "fame" ? "amber-400" : "cyber-teal"} transition-colors`}>
          <label className="flex items-center justify-center gap-2 text-xs text-gray-400 cursor-pointer w-full h-full">
            <UploadCloud size={18} className={tab === "fame" ? "text-amber-400" : "text-cyber-teal"} />
            <span>{hofForm.file ? hofForm.file.name : editingId ? "آپلود عکس پرتره جدید (اختیاری)" : "آپلود عکس پرتره (اختیاری)"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setHofForm({ ...hofForm, file: e.target.files[0] })} />
          </label>
        </div>

        {editingId && hofForm.photoUrl && !hofForm.file && (
          <div className="flex items-center gap-3 bg-dark-950 p-2.5 rounded-xl border border-white/5">
            <img src={getImageUrl(hofForm.photoUrl)} alt="Current photo" className="w-12 h-12 rounded-xl object-cover border border-white/20" />
            <span className="text-xs text-gray-400">عکس فعلی حفظ خواهد شد مگر اینکه عکس جدیدی انتخاب کنید.</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={loading} className={`flex-1 py-3.5 font-bold rounded-xl text-sm transition-all shadow-lg cursor-pointer disabled:opacity-50 ${tab === "council" ? "bg-cyber-teal text-dark-950 hover:bg-teal-300" : "bg-amber-400 text-dark-950 hover:bg-amber-300"}`}>
            {loading ? "در حال پردازش..." : editingId ? "ذخیره تغییرات" : tab === "council" ? "ثبت عضو در ادوار انجمن علمی" : "ثبت در تالار مفاخر"}
          </button>
          {editingId && <button type="button" onClick={handleCancelEdit} className="px-6 py-3.5 bg-dark-800 text-gray-300 rounded-xl text-sm hover:bg-dark-700 cursor-pointer">انصراف</button>}
        </div>
      </form>

      <div className="glass-panel rounded-3xl overflow-hidden border-white/5 shadow-xl">
        <table className="w-full text-right text-xs min-w-[700px]">
          <thead className="bg-dark-900 text-gray-400 font-mono border-b border-white/10">
            <tr><th className="p-4">نام کامل</th><th className="p-4 text-center">نوع رکورد / دوره</th><th className="p-4 text-center">سال ورود</th><th className="p-4">سمت / توضیحات</th><th className="p-4 text-left">عملیات</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {members.filter(m => (tab === "council" ? m.isAssociationMember : !m.isAssociationMember)).map((h) => (
              <tr key={h.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-white font-bold">{h.fullName}</td>
                <td className="p-4 text-center">
                  {h.isAssociationMember ? <span className="px-2.5 py-1 bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/40 rounded-lg text-[11px] font-bold">شورا {h.term}</span> : <span className="px-2.5 py-1 bg-amber-400/20 text-amber-400 border border-amber-400/40 rounded-lg text-[11px] font-bold">تالار مفاخر</span>}
                </td>
                <td className="p-4 text-center font-mono text-gray-300">{h.entryYear ? `ورودی ${h.entryYear}` : "—"}</td>
                <td className="p-4 text-gray-300">
                  {h.roleTitle && <span className="font-bold text-white block mb-0.5">{h.roleTitle}</span>}
                  <span className="text-gray-400 truncate max-w-xs block text-[11px]">{h.description}</span>
                </td>
                <td className="p-4 text-left">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleStartEdit(h)} className="p-2 rounded-xl bg-amber-400/10 text-amber-400 hover:bg-amber-400 hover:text-black transition-colors cursor-pointer" title="ویرایش"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(h.id)} className="p-2 rounded-xl bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white transition-colors cursor-pointer" title="حذف"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
