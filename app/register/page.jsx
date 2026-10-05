"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";
import { useDispatch } from "react-redux";
import { setSession, triggerAlarm, clearAlarm } from "@/redux/slices/authSlice";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import { persistSessionFromAuthResult } from "@/lib/api/auth/session";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await cessaService.auth.register(role, formData);
      setSuccessMsg(res?.message || "ثبت‌نام انجام شد. لطفاً ایمیل خود را تایید کنید.");
      setFormData({ firstName: "", lastName: "", email: "", password: "" });
    } catch (err) {
      setError(err.message || "ثبت‌نام انجام نشد. ورودی‌ها را بررسی نمایید.");
      dispatch(triggerAlarm(err.message));
      setTimeout(() => dispatch(clearAlarm()), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 font-sans">
      <div className="relative z-10 w-full max-w-lg">
        {/* دکمه بازگشت */}
        <Link 
          href="/" 
          className="inline-flex items-center space-x-2 space-x-reverse text-gray-400 hover:text-white mb-6 transition-colors text-base font-medium"
        >
          <ArrowRight size={20} />
          <span>بازگشت به سایت</span>
        </Link>
        
        <div className="glass-panel p-8 sm:p-12 rounded-3xl shadow-2xl border-cyber-teal/30">
          {/* هدر فرم */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-black text-white">پیوستن به CESSA</h2>
            <p className="text-sm sm:text-base text-cyber-gold mt-2">
              عضویت در وبسایت تخصصی انجمن مهندسی کامپیوتر
            </p>
          </div>

          {/* پیام خطا */}
          {error && (
            <div className="bg-red-500/15 border border-red-500/40 text-red-300 p-4 rounded-2xl mb-5 text-sm sm:text-base flex items-center gap-3 animate-bounce">
              <AlertCircle size={20} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* پیام موفقیت */}
          {successMsg && (
            <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 p-4 rounded-2xl mb-5 text-sm sm:text-base text-center leading-relaxed">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* انتخاب نقش */}
            <div className="bg-dark-900 p-2 rounded-2xl flex items-center border border-white/10 gap-2">
              <button 
                type="button" 
                onClick={() => setRole("student")} 
                className={`flex-1 py-3 text-sm sm:text-base font-bold rounded-xl transition-all cursor-pointer ${
                  role === "student" 
                    ? "bg-cyber-teal text-dark-950 shadow-[0_0_15px_rgba(45,212,191,0.3)]" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                دانشجو
              </button>
              <button 
                type="button" 
                onClick={() => setRole("creator")} 
                className={`flex-1 py-3 text-sm sm:text-base font-bold rounded-xl transition-all cursor-pointer ${
                  role === "creator" 
                    ? "bg-cyber-teal text-dark-950 shadow-[0_0_15px_rgba(45,212,191,0.3)]" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                تولیدکننده محتوا
              </button>
            </div>

            {/* نام و نام خانوادگی */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input 
                  type="text" 
                  required 
                  value={formData.firstName} 
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} 
                  placeholder="نام" 
                  className="w-full bg-dark-900 text-white rounded-xl py-3.5 px-4 border border-white/10 focus:border-cyber-teal outline-none text-base placeholder:text-gray-500 transition-all" 
                />
              </div>
              <div>
                <input 
                  type="text" 
                  required 
                  value={formData.lastName} 
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} 
                  placeholder="نام خانوادگی" 
                  className="w-full bg-dark-900 text-white rounded-xl py-3.5 px-4 border border-white/10 focus:border-cyber-teal outline-none text-base placeholder:text-gray-500 transition-all" 
                />
              </div>
            </div>

            {/* ایمیل */}
            <div className="relative">
              <input 
                type="email" 
                required 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                placeholder="ایمیل (student@iut.ac.ir)" 
                className="w-full bg-dark-900 text-white rounded-xl py-3.5 px-4 pl-12 border border-white/10 focus:border-cyber-teal outline-none text-left font-mono text-base placeholder:text-gray-500 transition-all" 
              />
              <Mail className="absolute left-4 top-4 text-gray-500" size={20} />
            </div>

            {/* رمز عبور */}
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                minLength={6} 
                value={formData.password} 
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                placeholder="رمز عبور (حداقل ۶ کاراکتر)" 
                className="w-full bg-dark-900 text-white rounded-xl py-3.5 px-4 pl-16 border border-white/10 focus:border-cyber-teal outline-none text-left font-mono text-base placeholder:text-gray-500 transition-all" 
              />
              <div className="absolute left-4 top-4 flex items-center space-x-2 text-gray-500">
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-cyber-teal transition-colors cursor-pointer">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <Lock size={20} />
              </div>
            </div>

            {/* دکمه ثبت نام */}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-cyber-teal hover:bg-teal-300 text-dark-950 font-bold py-4 rounded-xl text-base sm:text-lg transition-all shadow-[0_0_20px_rgba(45,212,191,0.35)] mt-3 cursor-pointer disabled:opacity-50"
            >
              {loading ? "در حال ثبت هویت در سیستم..." : "ثبت نام"}
            </button>

            {/* دکمه ادغام‌شده ورود به پنل */}
            <div className="pt-4 border-t border-white/5">
              <Link
                href="/login"
                className="w-full py-3.5 px-4 rounded-xl bg-dark-900/80 hover:bg-dark-900 border border-white/10 hover:border-cyber-teal/50 text-gray-300 hover:text-white text-sm sm:text-base font-bold transition-all text-center block shadow-md group"
              >
                <span>از قبل حساب کاربری دارید؟ </span>
                <span className="text-cyber-teal group-hover:text-teal-300 mr-1.5 transition-colors">
                  ورود به پنل
                </span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}