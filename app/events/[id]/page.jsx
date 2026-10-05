"use client";
import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { Calendar, CreditCard, UserPlus, Check, FileText, Clock, X, Lock, User } from "lucide-react";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import Navbar from "@/_components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { getImageUrl } from "@/lib/utils";

export default function EventDetailPage({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { isAuthenticated, role, user } = useAuth();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (isAuthenticated) {
           const activeRole = role ? (role === "Admin" ? "admin" : role === "ContentCreator" ? "creator" : "student") : "student";
           const res = await cessaService.events.getById(activeRole, id);
           setEventData(res?.data);
        } else {
           const res = await cessaService.public.getEventById(id);
           setEventData(res?.data);
        }
      } catch (err) {} finally { setLoading(false); }
    };
    fetchEvent();
  }, [id, isAuthenticated, role]);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'dark' });
    setTimeout(() => {
      try { mermaid.run({ querySelector: '.mermaid' }); } catch (e) {}
    }, 100);
  }, [eventData]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-cyber-mint font-mono animate-pulse">// LOADING_EVENT_NODE...</div>;
  if (!eventData) return <div className="min-h-screen flex items-center justify-center text-white text-lg font-bold">رویداد یافت نشد.</div>;

  const isCreatorOfEvent = role === "ContentCreator" && eventData.creatorId === user?.id;
  const isAdmin = role === "Admin";
  const canManage = isCreatorOfEvent || isAdmin;

  return (
    <div className="min-h-screen relative pb-20 font-sans">
      <Navbar />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 lg:p-16 border-cyber-mint/30 shadow-[0_0_30px_rgba(0,0,0,0.4)]">
          {eventData.coverFilePath && (
            <div className="w-full h-72 sm:h-96 rounded-3xl overflow-hidden border border-cyber-mint/30 shadow-[0_0_30px_rgba(74,222,128,0.2)] mb-10">
              <img src={getImageUrl(eventData.coverFilePath)} alt={eventData.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-8">
            <div>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-cyber-mint/10 border border-cyber-mint/30 text-cyber-mint text-xs sm:text-sm font-mono mb-4">OFFICIAL WORKSHOP</div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4">{eventData.title}</h1>
              
              <div className="flex items-center gap-3 mt-4">
                 <div className="w-10 h-10 rounded-full bg-dark-900 border border-cyber-mint/30 flex items-center justify-center overflow-hidden shadow-md shrink-0">
                   {eventData.creatorProfilePictureUrl ? <img src={getImageUrl(eventData.creatorProfilePictureUrl)} alt={eventData.creatorName} className="w-full h-full object-cover" /> : <User size={20} className="text-cyber-mint" />}
                 </div>
                 <span className="text-sm text-gray-300">برگزارکننده: <span className="font-bold text-white text-base">{eventData.creatorName}</span></span>
              </div>
            </div>
            <div className="flex flex-col items-center bg-dark-900 p-5 rounded-2xl border border-cyber-mint/20 min-w-36 shadow-[0_0_20px_rgba(74,222,128,0.1)] shrink-0">
               <Calendar className="text-cyber-mint mb-2" size={24} />
               <span className="font-sans text-base sm:text-lg text-white font-bold">{new Date(eventData.eventDate).toLocaleDateString("fa-IR")}</span>
            </div>
          </div>

          <div className="text-gray-200 text-base sm:text-lg md:text-xl leading-9 sm:leading-10 mb-12 post-content" dir="auto">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '');
                  if (!inline && match && match[1] === 'mermaid') {
                    return <div className="mermaid">{String(children).replace(/\n$/, '')}</div>;
                  }
                  return <code className={className} {...props}>{children}</code>;
                }
              }}
            >
              {eventData.description}
            </ReactMarkdown>
          </div>

          <div className="bg-dark-900/90 rounded-2xl p-6 sm:p-8 border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
               {isAuthenticated && eventData.adminCardNumber ? (
                 <>
                   <div className="p-4 bg-amber-400/10 rounded-2xl text-amber-400 shrink-0"><CreditCard size={28} /></div>
                   <div>
                     <p className="text-sm sm:text-base text-gray-300 mb-1">شماره کارت جهت واریز وجه رویداد:</p>
                     {showCard ? (
                        <p className="text-xl sm:text-2xl font-mono text-white tracking-widest mt-1 font-bold" dir="ltr">{eventData.adminCardNumber}</p>
                     ) : (
                        <button onClick={() => setShowCard(true)} className="text-base sm:text-lg font-bold text-cyber-teal hover:underline mt-1 cursor-pointer">نمایش شماره کارت</button>
                     )}
                   </div>
                 </>
               ) : !isAuthenticated && (eventData.hasCardNumber || eventData.adminCardNumber) ? (
                 <div className="flex items-center gap-4 bg-dark-950 p-4 rounded-xl border border-amber-400/30">
                   <div className="p-3 bg-amber-400/10 rounded-xl text-amber-400 shrink-0"><Lock size={24} /></div>
                   <div>
                     <p className="text-sm sm:text-base text-gray-300 font-medium">شماره کارت فقط برای اعضای سایت قابل مشاهده است.</p>
                     <Link href="/login" className="text-xs sm:text-sm text-cyber-teal font-bold hover:underline mt-1 inline-block">برای مشاهده شماره کارت وارد حساب خود شوید</Link>
                   </div>
                 </div>
               ) : (
                 <div className="text-base sm:text-lg text-gray-300 font-sans font-medium">هزینه رویداد: رایگان / ثبت‌نام داخلی</div>
               )}
            </div>

            {canManage ? (
              <Link href="/dashboard" className="w-full md:w-auto px-8 py-4 bg-dark-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-dark-700 border border-white/10 transition-all text-base sm:text-lg">
                <FileText size={20} /><span>مدیریت رویداد در داشبورد</span>
              </Link>
            ) : isAuthenticated ? (
              eventData.isEnrolledByCurrentUser ? (
                <div className={`w-full md:w-auto px-8 py-4 text-base sm:text-lg font-bold rounded-2xl border flex items-center justify-center gap-2.5 cursor-default ${
                  eventData.currentUserEnrollmentStatus === 1 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                  eventData.currentUserEnrollmentStatus === 2 ? "bg-red-500/20 text-red-400 border-red-500/30" :
                  "bg-amber-500/20 text-amber-400 border-amber-500/30"
                }`}>
                   {eventData.currentUserEnrollmentStatus === 1 ? <><Check size={22}/> <span>ثبت‌نام تایید شده</span></> :
                    eventData.currentUserEnrollmentStatus === 2 ? <><X size={22}/> <span>ثبت‌نام رد شده</span></> :
                    <><Clock size={22}/> <span>در انتظار تایید رسید</span></>}
                </div>
              ) : (
                <Link href="/dashboard" className="w-full md:w-auto px-9 py-4 bg-cyber-mint text-dark-950 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(74,222,128,0.3)] text-base sm:text-lg">
                  <UserPlus size={22} /><span>ورود به داشبورد و ثبت‌نام</span>
                </Link>
              )
            ) : (
              <Link href="/login" className="w-full md:w-auto px-9 py-4 bg-dark-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-dark-700 border border-white/10 transition-all text-base sm:text-lg">
                <UserPlus size={22} /><span>ورود جهت ثبت نام</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
