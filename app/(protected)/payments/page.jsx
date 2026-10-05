"use client";

import React, { useEffect, useState } from "react";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import { useAuth } from "@/hooks/useAuth";
import { CreditCard, ArrowDownLeft, FileText, ExternalLink, X, Eye } from "lucide-react";
import { getImageUrl } from "@/lib/utils";

export default function PaymentsPage() {
  const { role } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const activeRole = role ? (role === "Admin" ? "admin" : role === "ContentCreator" ? "creator" : "student") : "student";

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await cessaService.payments.getMyPayments(activeRole);
        setPayments(res?.data || []);
      } catch (err) {
        console.error("Failed to load payments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [role, activeRole]);

  const getStatusBadge = (status) => {
    if (status === 1) return <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px]">تایید شده</span>;
    if (status === 2) return <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[10px]">رد شده</span>;
    return <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[10px]">در انتظار تایید</span>;
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-white">سوابق مالی و تراکنش‌های بانکی</h2>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedReceipt(null)}>
          <div className="glass-panel p-4 rounded-3xl max-w-2xl w-full border-cyber-teal/40 relative flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedReceipt(null)} className="absolute top-4 left-4 p-2 rounded-full bg-dark-900 text-gray-400 hover:text-white border border-white/10">
              <X size={20} />
            </button>
            <h3 className="text-white font-bold mb-4 mt-2">تصویر فیش واریزی</h3>
            <div className="w-full max-h-[70vh] overflow-auto rounded-2xl border border-white/10 bg-dark-950 flex items-center justify-center p-2">
              <img src={getImageUrl(selectedReceipt)} alt="Receipt" className="max-w-full max-h-[65vh] object-contain rounded-xl" />
            </div>
            <a href={getImageUrl(selectedReceipt)} target="_blank" rel="noreferrer" className="mt-4 px-6 py-2 bg-cyber-teal text-dark-950 font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-teal-300 transition-colors">
              <ExternalLink size={14} /> باز کردن تصویر در صفحه جدید
            </a>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-cyber-teal font-mono animate-pulse">در حال استعلام از دیتابیس مالی...</div>
        ) : payments.length > 0 ? (
          payments.map((pay) => (
            <div key={pay.id} className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between border-white/5 hover:border-cyber-teal/30 transition-all gap-4">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="p-3 rounded-xl bg-cyber-teal/10 text-cyber-teal border border-cyber-teal/20 shrink-0">
                  <CreditCard size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      {pay.reason} <ArrowDownLeft size={14} className="text-emerald-400" />
                    </h4>
                    {getStatusBadge(pay.status)}
                  </div>
                  <p className="text-xs font-mono text-gray-400 mt-1">کد رهگیری: {pay.trackingNumber}</p>
                  {role === "Admin" && (
                    <p className="text-xs text-cyber-teal mt-0.5">دانشجو: {pay.userName}</p>
                  )}
                </div>
              </div>

              {/* Receipt Image Thumbnail & Controls */}
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                {pay.invoiceUrl ? (
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedReceipt(pay.invoiceUrl)}
                      className="group relative w-14 h-14 rounded-xl overflow-hidden border border-cyber-teal/40 bg-dark-900 shrink-0 cursor-pointer shadow-md"
                      title="مشاهده فیش"
                    >
                      <img src={getImageUrl(pay.invoiceUrl)} alt="رسید" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-dark-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye size={16} className="text-cyber-teal" />
                      </div>
                    </button>
                    <button 
                      onClick={() => setSelectedReceipt(pay.invoiceUrl)}
                      className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-cyber-teal text-xs font-bold border border-white/10 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <FileText size={14} /> مشاهده فیش
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 font-mono">بدون فیش</span>
                )}

                <div className="text-left font-mono">
                  <span className="text-cyber-mint font-bold text-base block mb-0.5">
                    {pay.amount.toLocaleString("fa-IR")} تومان
                  </span>
                  <p className="text-[10px] text-gray-500">
                    {new Date(pay.paymentDate).toLocaleDateString("fa-IR")}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel p-10 text-center rounded-2xl text-gray-400 text-sm font-mono border-white/5">
            هیچ تراکنش یا رسیدی در حساب شما ثبت نشده است.
          </div>
        )}
      </div>
    </div>
  );
}