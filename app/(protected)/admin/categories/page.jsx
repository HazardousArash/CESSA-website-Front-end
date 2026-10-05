"use client";
import React, { useEffect, useState } from "react";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import { BookOpen, Plus, Trash2, Tag } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const res = await cessaService.public.getCategories();
      setCategories(res?.data || []);
    } catch(err) {}
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if(!newCat.trim()) return;
    setLoading(true);
    try {
      await cessaService.users.createCategory(newCat);
      setNewCat("");
      loadData();
    } catch(err) {
      alert("خطا در ایجاد دسته‌بندی");
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if(!confirm("آیا از حذف این دسته‌بندی مطمئن هستید؟")) return;
    try {
      await cessaService.users.deleteCategory(id);
      loadData();
    } catch(err) {
      alert("خطا در حذف");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="text-cyber-teal" />
          <span>مدیریت دسته‌بندی مطالب</span>
        </h2>
      </div>

      <form onSubmit={handleCreate} className="glass-panel p-6 rounded-2xl border-white/5 flex gap-4 max-w-xl items-center">
        <input type="text" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="نام دسته‌بندی جدید" className="flex-1 bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-sm outline-none focus:border-cyber-teal" required />
        <button type="submit" disabled={loading} className="px-5 py-3 bg-cyber-teal text-dark-950 font-bold rounded-xl hover:bg-teal-300 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50">
          <Plus size={18} /> افزودن
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {categories.map(c => (
          <div key={c.id} className="glass-panel p-5 rounded-2xl flex items-center justify-between border-white/5 group hover:border-cyber-teal/30 transition-all">
            <span className="text-white font-bold flex items-center gap-2"><Tag size={16} className="text-cyber-teal" /> {c.name}</span>
            <button onClick={() => handleDelete(c.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors cursor-pointer opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
          </div>
        ))}
        {categories.length === 0 && <div className="col-span-full text-center py-10 text-gray-500">هیچ دسته‌بندی ثبت نشده است.</div>}
      </div>
    </div>
  );
}
