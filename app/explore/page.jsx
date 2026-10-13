"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Calendar, User, LockKeyhole } from "lucide-react";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import { getImageUrl } from "@/lib/utils";
import Navbar from "@/_components/layout/Navbar";
import CyberBackground from "@/_components/cyber/CyberBackground";
import { useAuth } from "@/hooks/useAuth";

export default function ExplorePage() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      try {
        const [postsRes, eventsRes] = await Promise.all([
          cessaService.posts.getRecent("student"),
          cessaService.events.getAll("student"),
        ]);
        setPosts(postsRes?.data || []);
        setEvents(eventsRes?.data || []);
      } catch (err) { setIsError(true); }
    };
    fetchData();
  }, [isAuthenticated]);

  const filteredPosts = posts.filter((p) => p.title?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredEvents = events.filter((e) => e.title?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen relative pb-20 font-sans">
      <CyberBackground />
      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-3 py-1.5 rounded-lg bg-cyber-teal/10 border border-cyber-teal/30 text-cyber-teal">FEED EXPLORER</span>
            <h1 className="text-3xl font-black text-white">رویدادها و اخبار CESSA</h1>
          </div>
          <div className="relative w-full md:w-96 flex items-center">
            <input type="text" placeholder="جستجو در رویدادها، اخبار..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} disabled={!isAuthenticated} className="w-full bg-dark-900 text-white rounded-2xl py-3 px-5 pl-12 border border-white/10 focus:border-cyber-teal outline-none text-sm glass-panel disabled:opacity-50" />
            <Search className="absolute left-4 top-3.5 text-cyber-teal" size={18} />
          </div>
        </div>

        {!isAuthenticated || isError ? (
          <div className="glass-panel rounded-3xl p-12 text-center border-cyber-teal/30 max-w-2xl mx-auto mt-20 relative overflow-hidden">
             <div className="absolute inset-0 bg-circuit-grid opacity-30"></div>
             <LockKeyhole size={48} className="mx-auto text-cyber-gold mb-6 animate-pulse" />
             <h2 className="text-2xl font-bold text-white mb-4 relative z-10">دسترسی به شبکه نیازمند احراز هویت است</h2>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 mt-8">
               <Link href="/login" className="px-8 py-3 bg-cyber-teal hover:bg-teal-300 text-dark-950 font-bold rounded-xl transition-all w-full sm:w-auto">ورود به حساب</Link>
             </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8">
              {["all", "posts", "events"].map((pill) => (
                <button key={pill} onClick={() => setActiveFilter(pill)} className={`px-5 py-2 rounded-xl text-xs font-mono uppercase cursor-pointer ${activeFilter === pill ? "bg-cyber-teal text-dark-950 font-bold shadow-[0_0_15px_rgba(45,212,191,0.4)]" : "glass-panel text-gray-400 hover:text-white"}`}>{pill}</button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(activeFilter === "all" || activeFilter === "posts") &&
                filteredPosts.map((post) => (
                  <Link key={post.id} href={`/post/${post.id}`} className="glass-panel-interactive rounded-2xl overflow-hidden flex flex-col group">
                    <div className="relative h-60 bg-dark-900 overflow-hidden">
                      <img loading="lazy" decoding="async" src={getImageUrl(post.coverFilePath)} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <h3 className="font-bold text-white mb-2 group-hover:text-cyber-teal transition-colors">{post.title}</h3>
                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5 text-[11px] text-gray-500 font-sans">
                        <span className="flex items-center gap-1"><User size={13} className="text-cyber-teal" />{post.authorName || "انجمن"}</span>
                        <span>{new Date(post.createdAt).toLocaleDateString("fa-IR")}</span>
                      </div>
                    </div>
                  </Link>
                ))}

              {(activeFilter === "all" || activeFilter === "events") &&
                filteredEvents.map((ev) => (
                  <div key={ev.id} className="glass-panel-interactive rounded-2xl overflow-hidden flex flex-col border-cyber-mint/20">
                    <div className="relative h-60 bg-dark-900 flex items-center justify-center p-4 overflow-hidden">
                      <img loading="lazy" decoding="async" src={getImageUrl(ev.coverFilePath)} alt="Event" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <h3 className="font-bold text-white mb-2">{ev.title}</h3>
                      <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-cyber-mint font-sans">
                        <span className="flex items-center gap-1 font-mono"><Calendar size={14} />{new Date(ev.eventDate).toLocaleDateString("fa-IR")}</span>
                        <Link href={`/events/${ev.id}`} className="underline text-cyber-teal">جزئیات</Link>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
