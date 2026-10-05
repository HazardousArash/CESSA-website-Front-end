"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import CyberBackground from "@/_components/cyber/CyberBackground";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState("در حال بررسی و تایید ایمیل کاربری...");

  // Prevent React 18/19 StrictMode from firing twice
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    const userId = searchParams.get("userId");
    const rawToken = searchParams.get("token");

    if (!userId || !rawToken) {
      setLoading(false);
      setIsSuccess(false);
      setStatusMessage("لینک تایید نامعتبر است یا شناسه کاربر و توکن ارسال نشده‌اند.");
      return;
    }

    if (hasRequestedRef.current) return;
    hasRequestedRef.current = true;

    // Normalizing token in case query string parsing converted '+' into space
    const token = rawToken.replace(/ /g, "+");

    const verify = async () => {
      try {
        await cessaService.auth.verifyEmail("student", userId, token);
        setIsSuccess(true);
        setStatusMessage("ایمیل شما با موفقیت تایید شد. اکنون می‌توانید به حساب کاربری خود وارد شوید.");
      } catch (err) {
        setIsSuccess(false);
        const errMsg =
          err.response?.data?.errors?.Token?.join(" | ") ||
          err.response?.data?.message ||
          err.message ||
          "تایید ایمیل با خطا مواجه شد. ممکن است لینک منقضی شده یا از قبل استفاده شده باشد.";
        setStatusMessage(errMsg);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="relative z-10 glass-panel p-10 rounded-3xl text-center max-w-md w-full border-cyber-teal/30 shadow-[0_0_30px_rgba(45,212,191,0.2)]">
      {loading ? (
        <div className="flex flex-col items-center py-6">
          <Loader2 className="w-12 h-12 text-cyber-teal animate-spin mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">در حال تایید حساب...</h2>
          <p className="text-xs text-gray-400 font-mono">// CONNECTING_AUTH_SERVER...</p>
        </div>
      ) : isSuccess ? (
        <div className="flex flex-col items-center py-4">
          <div className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/30 mb-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">حساب کاربری فعال شد</h2>
          <p className="text-sm text-gray-300 leading-relaxed mb-8">{statusMessage}</p>
          <Link
            href="/login"
            className="w-full py-3.5 bg-cyber-teal text-dark-950 font-bold rounded-xl transition-all hover:bg-teal-300 shadow-[0_0_20px_rgba(45,212,191,0.3)] block"
          >
            ورود به حساب کاربری
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center py-4">
          <div className="p-3 bg-red-500/10 rounded-full border border-red-500/30 mb-4">
            <AlertCircle className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">خطا در تایید ایمیل</h2>
          <p className="text-sm text-gray-300 leading-relaxed mb-8">{statusMessage}</p>
          <Link
            href="/login"
            className="w-full py-3.5 bg-dark-900 border border-white/10 text-white font-bold rounded-xl transition-all hover:bg-dark-850 block"
          >
            بازگشت به صفحه ورود
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4">
      <CyberBackground />
      <Suspense
        fallback={
          <div className="relative z-10 glass-panel p-10 rounded-3xl text-center max-w-md w-full border-cyber-teal/30 flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-cyber-teal animate-spin mb-3" />
            <p className="text-sm text-gray-400 font-mono">LOADING_SECURITY_CONTEXT...</p>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}