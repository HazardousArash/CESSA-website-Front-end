"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import { CheckCircle2, AlertCircle, UploadCloud } from "lucide-react";
import { getImageUrl } from "@/lib/utils";

export default function ProfilePage() {
  const { user, role } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    studentNumber: user?.studentNumber || "",
    entryYear: user?.entryYear || "",
    newPassword: "",
    file: null
  });
  
  const [currentPic, setCurrentPic] = useState(null);
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);

  const activeRole = role ? (role === "Admin" ? "admin" : role === "ContentCreator" ? "creator" : "student") : "student";

  useEffect(() => {
    cessaService.profile.getMe(activeRole).then(res => {
       if(res.data) {
         setFormData(prev => ({
           ...prev,
           firstName: res.data.firstName,
           lastName: res.data.lastName,
           studentNumber: res.data.studentNumber || "",
           entryYear: res.data.entryYear || ""
         }));
         setCurrentPic(res.data.profilePictureUrl);
       }
    }).catch(()=>{});
  }, [activeRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", msg: "" });

    try {
      let profilePictureId = null;
      if (formData.file) {
        const fileRes = await cessaService.files.upload(formData.file);
        profilePictureId = fileRes.data;
      }

      const parsedEntryYear = formData.entryYear ? parseInt(formData.entryYear, 10) : null;
      const parsedStudentNum = formData.studentNumber ? formData.studentNumber : null;
      const parsedPassword = formData.newPassword ? formData.newPassword : null;

      await cessaService.profile.update(activeRole, {
        userId: user?.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        studentNumber: parsedStudentNum,
        entryYear: parsedEntryYear,
        newPassword: parsedPassword,
        profilePictureId: profilePictureId
      });
      
      setStatus({ type: "success", msg: "اطلاعات پروفایل شما با موفقیت در پایگاه داده مرکزی ثبت گردید." });
      
      const res = await cessaService.profile.getMe(activeRole);
      setCurrentPic(res.data.profilePictureUrl);
      setFormData(prev => ({...prev, file: null, newPassword: ""}));
    } catch (err) {
      setStatus({ type: "error", msg: err.response?.data?.message || "خطا در برقراری ارتباط و بروزرسانی پرونده." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-sans">
      {/* سربرگ صفحه */}
      <div className="border-b border-white/10 pb-6">
        <h2 className="text-3xl sm:text-4xl font-black text-white">تکمیل و ویرایش پرونده کاربری</h2>
      </div>

      {/* پیام وضعیت */}
      {status.msg && (
        <div className={`p-4 sm:p-5 rounded-2xl text-base sm:text-lg flex items-start gap-3 border ${
          status.type === "success" 
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
            : "bg-red-500/10 text-red-400 border-red-500/30"
        }`}>
          {status.type === "success" ? (
            <CheckCircle2 size={24} className="shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={24} className="shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed">{status.msg}</span>
        </div>
      )}

      {/* فرم ویرایش */}
      <form onSubmit={handleSubmit} className="space-y-6 glass-panel p-8 sm:p-12 rounded-3xl border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
        
        {/* تصویر پروفایل */}
        <div className="flex flex-col items-center justify-center mb-8">
           <div className="w-28 h-28 rounded-full border-2 border-cyber-teal bg-dark-900 mb-4 overflow-hidden flex items-center justify-center text-4xl font-bold text-cyber-teal shadow-[0_0_25px_rgba(45,212,191,0.25)]">
              {formData.file ? (
                <img src={URL.createObjectURL(formData.file)} className="w-full h-full object-cover" />
              ) : currentPic ? (
                <img src={getImageUrl(currentPic)} className="w-full h-full object-cover" />
              ) : (
                formData.firstName[0] || "U"
              )}
           </div>
           <label className="text-sm sm:text-base text-cyber-teal cursor-pointer hover:underline flex items-center gap-2 font-medium">
              <UploadCloud size={18} />
              <span>تغییر تصویر پروفایل</span>
              <input type="file" accept="image/*" className="hidden" onChange={e => setFormData({...formData, file: e.target.files[0]})} />
           </label>
        </div>

        {/* نام و نام خانوادگی */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2 font-sans">نام</label>
            <input 
              type="text" 
              required 
              value={formData.firstName} 
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} 
              className="w-full bg-dark-900 text-white rounded-xl py-3.5 px-4 border border-white/10 text-base placeholder:text-gray-500 outline-none focus:border-cyber-teal transition-all" 
            />
          </div>
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2 font-sans">نام خانوادگی</label>
            <input 
              type="text" 
              required 
              value={formData.lastName} 
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} 
              className="w-full bg-dark-900 text-white rounded-xl py-3.5 px-4 border border-white/10 text-base placeholder:text-gray-500 outline-none focus:border-cyber-teal transition-all" 
            />
          </div>
        </div>

        {/* شماره دانشجویی */}
        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2 font-sans">شماره دانشجویی</label>
          <input 
            type="text" 
            value={formData.studentNumber} 
            onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })} 
            className="w-full bg-dark-900 text-white rounded-xl py-3.5 px-4 border border-white/10 font-mono text-base outline-none focus:border-cyber-teal transition-all text-left" 
          />
        </div>

        {/* سال ورود */}
        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2 font-sans">سال ورود به دانشگاه (به شمسی)</label>
          <input 
            type="number" 
            placeholder="مثلاً 1403" 
            value={formData.entryYear} 
            onChange={(e) => setFormData({ ...formData, entryYear: e.target.value })} 
            className="w-full bg-dark-900 text-white rounded-xl py-3.5 px-4 border border-white/10 text-base outline-none focus:border-cyber-teal transition-all text-left font-sans" 
          />
        </div>

        {/* رمز عبور جدید */}
        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2 font-sans">تغییر رمز عبور (اختیاری)</label>
          <input 
            type="password" 
            placeholder="در صورت عدم تغییر خالی بگذارید" 
            value={formData.newPassword} 
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} 
            className="w-full bg-dark-900 text-white rounded-xl py-3.5 px-4 border border-white/10 font-mono text-base placeholder:text-gray-600 outline-none focus:border-cyber-teal transition-all text-left" 
          />
        </div>

        {/* دکمه ارسال */}
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full mt-6 bg-cyber-teal hover:bg-teal-300 text-dark-950 font-bold px-8 py-4 rounded-2xl text-base sm:text-lg shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? "در حال ارسال به پایگاه داده..." : "ذخیره تغییرات"}
        </button>
      </form>
    </div>
  );
}