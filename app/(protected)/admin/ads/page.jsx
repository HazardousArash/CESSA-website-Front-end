"use client";

import React, { useEffect, useState } from "react";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import { Megaphone, Trash2, UploadCloud, Edit, X } from "lucide-react";
import { getImageUrl } from "@/lib/utils";

export default function AdminAdsPage() {
  const [ads, setAds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [adForm, setAdForm] = useState({ 
    title: "", 
    description: "", 
    linkUrl: "", 
    isActive: true, 
    coverFileId: null,
    coverFilePath: null,
    file: null 
  });
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const res = await cessaService.ads.adminGetAll();
      setAds(res?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { 
    loadData(); 
  }, []);

  const handleStartEdit = (ad) => {
    setEditingId(ad.id);
    setAdForm({
      title: ad.title,
      description: ad.description,
      linkUrl: ad.linkUrl || "",
      isActive: ad.isActive,
      coverFileId: ad.coverFileId,
      coverFilePath: ad.coverFilePath,
      file: null
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setAdForm({ 
      title: "", 
      description: "", 
      linkUrl: "", 
      isActive: true, 
      coverFileId: null,
      coverFilePath: null,
      file: null 
    });
  };

  const handleSubmitAd = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let coverFileId = adForm.coverFileId;

      // If a new image was selected, upload it first
      if (adForm.file) {
        const fileRes = await cessaService.files.upload(adForm.file);
        coverFileId = fileRes.data;
      }

      if (editingId) {
        await cessaService.ads.adminUpdate(editingId, {
          id: editingId,
          title: adForm.title,
          description: adForm.description,
          linkUrl: adForm.linkUrl,
          coverFileId: coverFileId,
          isActive: adForm.isActive
        });
        alert("اطلاعیه / بنر با موفقیت ویرایش شد.");
      } else {
        await cessaService.ads.adminCreate({
          title: adForm.title,
          description: adForm.description,
          linkUrl: adForm.linkUrl,
          coverFileId: coverFileId,
          isActive: adForm.isActive
        });
        alert("تبلیغات / اطلاعیه با موفقیت ایجاد شد.");
      }

      handleCancelEdit();
      loadData();
    } catch (err) {
      alert("خطا در ذخیره اطلاعات بنر");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAd = async (id) => {
    if (!confirm("آیا از حذف این بنر اطمینان دارید؟")) return;
    try { 
      await cessaService.ads.adminDelete(id);
      setAds(prev => prev.filter(a => a.id !== id));
      if (editingId === id) handleCancelEdit();
    } catch { 
      alert("خطا در حذف بنر"); 
    }
  };

  // Safe toggle: retains coverFileId so disabling does not delete the cover image
  const handleToggleActive = async (ad) => {
    try {
      const nextActiveState = !ad.isActive;
      // Optimistic UI update
      setAds(prev => prev.map(a => a.id === ad.id ? { ...a, isActive: nextActiveState } : a));

      await cessaService.ads.adminUpdate(ad.id, { 
        id: ad.id,
        title: ad.title,
        description: ad.description,
        linkUrl: ad.linkUrl,
        coverFileId: ad.coverFileId, // Keeps the cover image safe!
        isActive: nextActiveState 
      });
      loadData();
    } catch { 
      alert("خطا در تغییر وضعیت");
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Megaphone className="text-amber-400" />
          <span>مدیریت بنرها و اطلاعیه‌های صفحه اصلی</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1 font-mono"></p>
      </div>

      {/* Create / Edit Form */}
      <form onSubmit={handleSubmitAd} className="glass-panel p-8 rounded-3xl max-w-2xl border-amber-400/20 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-white flex items-center gap-2">
            {editingId ? <Edit size={18} className="text-amber-400" /> : <Megaphone size={18} className="text-amber-400" />}
            <span>{editingId ? "ویرایش بنر / اطلاعیه" : "ایجاد بنر جدید"}</span>
          </h3>
          {editingId && (
            <button 
              type="button" 
              onClick={handleCancelEdit} 
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <X size={14} /> انصراف از ویرایش
            </button>
          )}
        </div>

        <input 
          type="text" 
          placeholder="عنوان اطلاعیه" 
          required 
          value={adForm.title} 
          onChange={(e) => setAdForm({ ...adForm, title: e.target.value })} 
          className="w-full bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-sm outline-none focus:border-amber-400" 
        />
        
        <textarea 
          placeholder="توضیحات کوتاه..." 
          required 
          rows={2} 
          value={adForm.description} 
          onChange={(e) => setAdForm({ ...adForm, description: e.target.value })} 
          className="w-full bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-sm outline-none focus:border-amber-400" 
        />
        
        <input 
          type="url" 
          placeholder="لینک مقصد هنگام کلیک روی بنر (اختیاری)" 
          value={adForm.linkUrl} 
          onChange={(e) => setAdForm({ ...adForm, linkUrl: e.target.value })} 
          className="w-full bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-xs font-mono text-left outline-none focus:border-amber-400" 
        />
        
        {/* Upload Box */}
        <div className="w-full bg-dark-900 rounded-xl p-4 border border-white/10 border-dashed hover:border-amber-400 transition-colors">
          <label className="flex items-center justify-center gap-3 text-xs text-gray-400 cursor-pointer w-full h-full">
            <UploadCloud size={20} className="text-amber-400" />
            <span>
              {adForm.file 
                ? adForm.file.name 
                : editingId 
                ? "آپلود تصویر جدید (اختیاری)" 
                : "آپلود بنر تصویری (الزامی)"}
            </span>
            <input 
              type="file" 
              accept="image/*" 
              required={!editingId && !adForm.coverFileId} 
              className="hidden" 
              onChange={(e) => setAdForm({ ...adForm, file: e.target.files[0] })} 
            />
          </label>
        </div>

        {/* Existing Cover Preview when in Edit mode */}
        {editingId && adForm.coverFilePath && !adForm.file && (
          <div className="flex items-center gap-3 bg-dark-950 p-2.5 rounded-xl border border-white/5">
            <img 
              src={getImageUrl(adForm.coverFilePath)} 
              alt="Current cover" 
              className="w-14 h-14 object-cover rounded-lg border border-amber-400/30" 
            />
            <span className="text-xs text-gray-400">تصویر فعلی بنر فعال است (در صورت عدم آپلود فایل جدید، حفظ خواهد شد)</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button 
            type="submit" 
            disabled={loading || (!editingId && !adForm.file && !adForm.coverFileId)} 
            className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-dark-950 font-bold rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)] disabled:opacity-50 cursor-pointer"
          >
            {loading ? "در حال پردازش..." : editingId ? "ذخیره تغییرات" : "ایجاد بنر"}
          </button>
          {editingId && (
            <button 
              type="button" 
              onClick={handleCancelEdit} 
              className="px-6 py-3 bg-dark-800 text-gray-300 rounded-xl text-sm hover:bg-dark-700 cursor-pointer"
            >
              انصراف
            </button>
          )}
        </div>
      </form>

      {/* Ads List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {ads.map(ad => (
          <div 
            key={ad.id} 
            className={`glass-panel p-5 rounded-2xl flex items-center gap-4 transition-all ${
              ad.isActive ? 'border-amber-400/30' : 'border-white/5 opacity-60'
            }`}
          >
            <img 
              src={getImageUrl(ad.coverFilePath)} 
              alt={ad.title} 
              className="w-24 h-24 object-cover rounded-xl border border-white/10 shrink-0" 
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-white text-sm mb-1 truncate">{ad.title}</h4>
              <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed" dir="auto">{ad.description}</p>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleToggleActive(ad)} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    ad.isActive 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white' 
                      : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                  }`}
                >
                  {ad.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                </button>
                
                {/* Pencil Edit Button */}
                <button 
                  onClick={() => handleStartEdit(ad)} 
                  className="p-1.5 rounded-lg bg-dark-800 text-amber-400 hover:bg-amber-400 hover:text-dark-950 transition-colors cursor-pointer" 
                  title="ویرایش بنر"
                >
                  <Edit size={16} />
                </button>

                {/* Delete Button */}
                <button 
                  onClick={() => handleDeleteAd(ad.id)} 
                  className="p-1.5 rounded-lg bg-dark-800 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer" 
                  title="حذف بنر"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}