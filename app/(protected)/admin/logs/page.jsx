"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import { Terminal, ChevronRight, ChevronLeft, Search, Ban } from "lucide-react";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 50;
  const router = useRouter();

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = () => {
    cessaService.logs.getSystemLogs().then(res => setLogs(res?.data || [])).catch(()=>{});
  };

  const totalPages = Math.ceil(logs.length / logsPerPage);
  const currentLogs = logs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);

  const parseLogDetails = (details) => {
    const parts = details.split(" | Payload: ");
    const userParts = parts[0].split(" | UserId: ");
    const emailStr = userParts[0].replace("UserEmail: ", "").trim();
    const userId = userParts[1] ? userParts[1].trim() : null;
    
    return { email: emailStr, userId: userId, payload: parts[1] || details };
  };

  const handleInspect = (email) => {
    if (email && email !== "System/Public") {
      router.push(`/admin/users?search=${encodeURIComponent(email)}`);
    }
  };

  const handleBan = async (userId, email) => {
    if (!userId || userId === "Anonymous") return;
    if (!confirm(`آیا از مسدود کردن قطعی کاربر ${email} اطمینان دارید؟`)) return;
    try {
      await cessaService.users.adminRemove(userId);
      alert("کاربر با موفقیت مسدود شد.");
    } catch(err) {
      alert("خطا در مسدودسازی کاربر.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Terminal className="text-cyber-teal" />
            <span>لاگ‌های سیستم و نظارت هوشمند</span>
          </h2>
        </div>
        <div className="flex items-center gap-3 font-mono text-sm text-cyber-teal bg-dark-900 border border-white/10 rounded-xl p-2" dir="ltr">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-1 hover:bg-cyber-teal/20 rounded disabled:opacity-30 cursor-pointer"><ChevronLeft size={18} /></button>
          <span>PAGE {currentPage} / {totalPages || 1}</span>
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)} className="p-1 hover:bg-cyber-teal/20 rounded disabled:opacity-30 cursor-pointer"><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="glass-panel rounded-3xl font-mono text-xs space-y-0 border-white/5 divide-y divide-white/5 overflow-hidden" dir="ltr">
        {currentLogs.map((l) => {
          const parsed = parseLogDetails(l.details);
          const isKnownUser = parsed.email !== "System/Public" && parsed.userId && parsed.userId !== "Anonymous";

          return (
            <div key={l.id} className="p-5 bg-dark-900/50 hover:bg-dark-900 transition-colors flex flex-col md:flex-row gap-4 justify-between items-start md:items-center group">
              <div className="flex flex-col gap-1 min-w-[180px]">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-cyber-teal" />
                  <span className="text-cyber-mint font-bold uppercase tracking-wider">{l.action}</span> 
                </div>
                <span className="text-[10px] text-gray-500">{new Date(l.createdAt).toLocaleString("en-US", { hour12: false })}</span>
              </div>
              <div className="flex flex-col gap-1 w-full max-w-xs border-l border-white/10 pl-4">
                 <span className="text-amber-400 font-bold">ACTOR:</span>
                 <span className="text-gray-300 truncate" title={parsed.email}>{parsed.email}</span>
                 {parsed.userId && <span className="text-[9px] text-gray-600 truncate">{parsed.userId}</span>}
              </div>
              <div className="flex flex-col gap-1 w-full max-w-lg bg-dark-950 p-3 rounded-xl border border-white/5">
                 <span className="text-cyber-teal font-bold mb-1 border-b border-white/5 pb-1 inline-block w-max">PAYLOAD:</span>
                 <span className="text-gray-400 break-words line-clamp-2 hover:line-clamp-none transition-all">{parsed.payload}</span>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity min-w-[80px] justify-end">
                {isKnownUser && (
                  <>
                    <button onClick={() => handleInspect(parsed.email)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-colors cursor-pointer" title="Inspect User">
                      <Search size={16} />
                    </button>
                    <button onClick={() => handleBan(parsed.userId, parsed.email)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors cursor-pointer" title="Ban User">
                      <Ban size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
        {logs.length === 0 && <div className="text-center p-10 text-gray-500" dir="rtl">لاگی در سیستم ثبت نشده است.</div>}
      </div>
    </div>
  );
}
