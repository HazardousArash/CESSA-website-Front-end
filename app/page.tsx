"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/_components/layout/Navbar";
import { ArrowLeft, Calendar, User, ExternalLink } from "lucide-react";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import { getImageUrl } from "@/lib/utils";

interface AdItem { id: string; title: string; description: string; linkUrl?: string; coverFilePath?: string; }
interface EventItem { id: string; title: string; eventDate: string | Date; coverFilePath?: string; }
interface PostItem { id: string; title: string; coverFilePath?: string; authorName?: string; createdAt: string | Date; categoryName?: string; }

export default function HomePage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [ads, setAds] = useState<AdItem[]>([]);

  useEffect(() => {
    cessaService.public.getPosts().then((res: any) => setPosts(res.data?.slice(0, 3) || [])).catch(() => {});
    cessaService.public.getEvents().then((res: any) => setEvents(res.data?.slice(0, 3) || [])).catch(() => {});
    cessaService.public.getAdvertisements().then((res: any) => setAds(res.data || [])).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-between font-sans">
      <Navbar />
      <main className="relative z-10 flex-1 flex flex-col items-center justify-start text-center px-4 pt-32 pb-20 w-full max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[50vh] mb-20 w-full px-1">
          <h1 className="text-[clamp(3.8rem,16.5vw,9.5rem)] font-black tracking-normal sm:tracking-widest text-white mb-6 sm:mb-8 drop-shadow-[0_0_45px_rgba(45,212,191,0.45)] mt-6 sm:mt-12 whitespace-nowrap select-none leading-none">C E S S A</h1>
          <img src="/image.jpg" alt="Logo" className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 mb-8 sm:mb-10 rounded-full border-4 border-cyber-teal shadow-[0_0_50px_rgba(45,212,191,0.5)] object-cover" />
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 font-light tracking-wide sm:tracking-widest max-w-3xl leading-relaxed px-2">انجمن علمی کامپیوتر دانشگاه صنعتی اصفهان</p>
        </div>

        {ads.length > 0 && (
          <div className="w-full text-right mb-20">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white border-r-4 border-amber-400 pr-4">فرصت‌های ویژه</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ads.map((ad) => {
                const CardContent = (
                  <>
                    <div className="w-1/3 bg-dark-900 relative overflow-hidden">
                      <img src={getImageUrl(ad.coverFilePath)} alt={ad.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
                    </div>
                    <div className="w-2/3 p-4 sm:p-5 flex flex-col justify-between">
                      <div><h3 className="font-bold text-white mb-2 text-base sm:text-lg group-hover:text-amber-400 transition-colors">{ad.title}</h3><p className="text-xs sm:text-sm text-gray-400 line-clamp-3 leading-relaxed" dir="auto">{ad.description}</p></div>
                      {ad.linkUrl && <div className="mt-4 inline-flex items-center gap-1 text-amber-400 text-xs sm:text-sm font-bold group-hover:underline w-max"><ExternalLink size={14} /> مشاهده لینک</div>}
                    </div>
                  </>
                );
                return ad.linkUrl ? (<a key={ad.id} href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="glass-panel-interactive rounded-2xl overflow-hidden flex border-amber-400/20 group hover:border-amber-400/50 cursor-pointer">{CardContent}</a>) : (<div key={ad.id} className="glass-panel rounded-2xl overflow-hidden flex border-amber-400/20 group">{CardContent}</div>);
              })}
            </div>
          </div>
        )}

        <div className="w-full text-right mb-20">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white border-r-4 border-cyber-mint pr-4">رویدادها</h2>
            <Link href="/events" className="text-cyber-mint hover:text-green-300 font-medium text-sm flex items-center gap-1 transition-colors">نمایش همه <ArrowLeft size={14}/></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((ev) => (
              <Link key={ev.id} href={`/events/${ev.id}`} className="glass-panel-interactive rounded-2xl overflow-hidden flex flex-col border-cyber-mint/20 group">
                <div className="relative h-48 bg-dark-900 flex items-center justify-center p-4 overflow-hidden">
                  <img src={getImageUrl(ev.coverFilePath)} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60" />
                  <div className="absolute top-3 right-3 bg-dark-950/80 px-3 py-1 rounded-full text-[10px] text-cyber-mint font-mono border border-cyber-mint/30">EVENT</div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div><h3 className="font-bold text-white mb-2 group-hover:text-cyber-mint transition-colors text-base sm:text-lg">{ev.title}</h3></div>
                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs sm:text-sm text-cyber-mint font-mono"><span className="flex items-center gap-1 font-sans"><Calendar size={14} />{new Date(ev.eventDate).toLocaleDateString("fa-IR")}</span><span className="underline text-cyber-teal group-hover:text-white font-sans transition-colors">جزئیات</span></div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="w-full text-right mb-10">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white border-r-4 border-cyber-teal pr-4">مطالب</h2>
            <Link href="/posts" className="text-cyber-teal hover:text-teal-300 font-medium text-sm flex items-center gap-1 transition-colors">نمایش همه <ArrowLeft size={14}/></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`} className="glass-panel-interactive rounded-2xl overflow-hidden flex flex-col group">
                <div className="relative h-48 bg-dark-900 overflow-hidden">
                  <img src={getImageUrl(post.coverFilePath)} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-dark-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-cyber-teal font-mono border border-cyber-teal/30 flex items-center gap-1">
                    POST {post.categoryName && <span className="text-white">| {post.categoryName}</span>}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div><h3 className="font-bold text-white mb-2 group-hover:text-cyber-teal transition-colors text-base sm:text-lg">{post.title}</h3></div>
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5 text-xs text-gray-400 font-sans"><span className="flex items-center gap-1 text-gray-300"><User size={14} className="text-cyber-teal" />{post.authorName || "انجمن"}</span><span>{new Date(post.createdAt).toLocaleDateString("fa-IR")}</span></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
