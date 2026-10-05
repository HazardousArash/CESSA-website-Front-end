"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: "", type: "" });
    try {
      await cessaService.auth.forgotPassword("student", email);
      setMsg({ text: "در صورتی که ایمیل معتبر باشد، لینک بازیابی ارسال گردید.", type: "success" });
      setEmail("");
    } catch (err) {
      setMsg({ text: "خطا در ارسال ایمیل بازیابی. لطفا مجددا تلاش کنید.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-md">
        <Link href="/login" className="inline-flex items-center space-x-2 space-x-reverse text-gray-400 hover:text-white mb-6 transition-colors text-sm">
          <ArrowRight size={16} /><span>بازگشت به صفحه ورود</span>
        </Link>
        
        <div className="glass-panel p-8 sm:p-10 rounded-3xl shadow-2xl border-cyber-teal/30">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">فراموشی رمز عبور</h2>
          <p className="text-xs text-gray-400 mb-6 text-center">ایمیل خود را وارد کنید تا لینک بازیابی ارسال شود.</p>
          
          {msg.text && (
            <div className={`p-3 mb-6 rounded-xl text-xs flex items-center gap-2 border ${msg.type === "success" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"}`}>
              {msg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{msg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@iut.ac.ir" className="w-full bg-dark-900 text-white rounded-xl py-3 px-4 pl-10 border border-white/10 focus:border-cyber-teal outline-none transition-all text-left font-mono text-sm" />
                <Mail className="absolute left-3 top-3.5 text-gray-500" size={18} />
              </div>
            </div>

            <button type="submit" disabled={loading || !email} className="w-full bg-cyber-teal text-dark-950 font-bold py-3.5 rounded-xl hover:bg-teal-300 transition-colors shadow-[0_0_20px_rgba(45,212,191,0.35)] disabled:opacity-50 cursor-pointer">
              {loading ? "در حال ارسال..." : "ارسال ایمیل بازیابی"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}