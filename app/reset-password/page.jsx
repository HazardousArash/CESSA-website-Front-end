"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmail(searchParams.get("email") || "");
    setToken(searchParams.get("token") || "");
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: "", type: "" });
    try {
      await cessaService.auth.resetPassword("student", { email, token, newPassword });
      setMsg({ text: "رمز عبور با موفقیت تغییر کرد. در حال انتقال...", type: "success" });
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setMsg({ text: err.message || "خطا در بازیابی رمز عبور. ممکن است لینک منقضی شده باشد.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 glass-panel p-10 rounded-3xl max-w-md w-full border-cyber-teal/30">
      <h2 className="text-2xl font-bold text-white mb-2 text-center">ثبت رمز عبور جدید</h2>
      <p className="text-xs text-gray-400 mb-6 text-center">لطفاً رمز عبور جدید خود را وارد نمایید.</p>

      {msg.text && (
        <div className={`p-3 mb-6 rounded-xl text-xs flex items-center gap-2 border ${
          msg.type === "success" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"
        }`}>
          {msg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          readOnly
          value={email}
          className="w-full bg-dark-900/50 text-gray-500 rounded-xl py-3 px-4 border border-white/5 outline-none text-sm cursor-not-allowed text-left font-mono"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="رمز عبور جدید"
            className="w-full bg-dark-900 text-white rounded-xl py-3 px-4 pl-16 border border-white/10 focus:border-cyber-teal outline-none transition-all text-left font-mono text-sm"
          />
          <div className="absolute left-3 top-3.5 flex items-center space-x-2 text-gray-500">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hover:text-cyber-teal transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <Lock size={18} />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !email || !token}
          className="w-full bg-cyber-teal text-dark-950 font-bold py-3.5 rounded-xl hover:bg-teal-300 transition-colors shadow-[0_0_20px_rgba(45,212,191,0.35)] disabled:opacity-50 cursor-pointer"
        >
          {loading ? "در حال ثبت..." : "تغییر رمز عبور"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="glass-panel p-8 rounded-2xl flex items-center gap-3 text-cyber-teal font-mono">
            <Loader2 className="animate-spin" size={20} />
            <span>LOADING_RESET_CONTEXT...</span>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}