"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";
import { useDispatch } from "react-redux";
import { setSession, triggerAlarm, clearAlarm } from "@/redux/slices/authSlice";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import CyberBackground from "@/_components/cyber/CyberBackground";
import { persistSessionFromAuthResult } from "@/lib/api/auth/session";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [secretClicks, setSecretClicks] = useState(0);

  const dispatch = useDispatch();
  const router = useRouter();

  const handleSecretClick = async () => {
    if (secretClicks >= 4) {
      const secret = prompt("Security Override: Enter Passphrase");
      if (!secret) {
         setSecretClicks(0);
         return;
      }
      try {
         await cessaService.public.verifySecretDoor(secret);
         setRole("admin");
      } catch (err) {
         alert("Access Denied: Invalid Passphrase");
      }
      setSecretClicks(0);
    } else {
      setSecretClicks(c => c + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await cessaService.auth.login(role, { email, password });
      if (res.success && res.data) {
        const { role: parsedRole, userId } = persistSessionFromAuthResult(res.data);
        dispatch(setSession({
          token: res.data.accessToken,
          role: parsedRole || (role === "admin" ? "Admin" : role === "creator" ? "ContentCreator" : "Student"),
          user: { id: userId, email }
        }));
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.message || "اعتبارسنجی ناموفق بود.");
      dispatch(triggerAlarm(err.message));
      setTimeout(() => dispatch(clearAlarm()), 3000);
    } finally {
      setLoading(false);
    }
  };

  const availableRoles = [
    { id: "student", label: "دانشجو" },
    { id: "creator", label: "تولید محتوا" },
  ];

  if (role === "admin") {
    availableRoles.push({ id: "admin", label: "مدیریت سیستم" });
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 font-sans">
      <CyberBackground />
      <div className="relative z-10 w-full max-w-lg">
        <Link href="/" className="inline-flex items-center space-x-2 space-x-reverse text-gray-400 hover:text-white mb-6 transition-colors text-base font-medium">
          <ArrowRight size={20} /><span>بازگشت به سایت</span>
        </Link>
        
        <div className="glass-panel p-8 sm:p-12 rounded-3xl shadow-2xl border-cyber-teal/30">
          <div className="text-center mb-8">
            <h2 onClick={handleSecretClick} className="text-3xl sm:text-4xl font-black text-white tracking-wide cursor-default select-none">
              ورود به حساب کاربری
            </h2>
            <p className="text-sm sm:text-base text-cyber-gold mt-2">پایگاه جامع انجمن مهندسی کامپیوتر</p>
          </div>

          {error && (
            <div className="bg-red-500/15 border border-red-500/40 text-red-300 p-4 rounded-2xl mb-6 text-sm sm:text-base flex items-center gap-3">
              <AlertCircle size={20} className="text-red-400 shrink-0" /><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">نقش کاربری</label>
              <div className={`grid gap-2 bg-dark-900 p-2 rounded-2xl border border-white/10 ${availableRoles.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {availableRoles.map((r) => (
                  <button key={r.id} type="button" onClick={() => setRole(r.id)} className={`py-3 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${role === r.id ? "bg-cyber-teal text-dark-950 shadow-[0_0_15px_rgba(45,212,191,0.3)]" : "text-gray-400 hover:text-white"}`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">ایمیل دانشگاهی / کاربری</label>
              <div className="relative">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@iut.ac.ir" className="w-full bg-dark-900 text-white rounded-xl py-3.5 px-4 pl-12 border border-white/10 focus:border-cyber-teal outline-none transition-all text-left font-mono text-base placeholder:text-gray-500" />
                <Mail className="absolute left-4 top-4 text-gray-500" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-300 mb-2">رمز عبور</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-dark-900 text-white rounded-xl py-3.5 px-4 pl-16 border border-white/10 focus:border-cyber-teal outline-none transition-all text-left font-mono text-base placeholder:text-gray-500" />
                <div className="absolute left-4 top-4 flex items-center space-x-2 text-gray-500">
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-cyber-teal transition-colors cursor-pointer">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  <Lock size={20} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-cyber-teal hover:bg-teal-300 text-dark-950 font-bold py-4 rounded-xl text-base sm:text-lg transition-all shadow-[0_0_20px_rgba(45,212,191,0.35)] disabled:opacity-50 cursor-pointer">
              {loading ? "در حال تایید..." : "ورود"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
