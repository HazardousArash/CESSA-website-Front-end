"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import { getImageUrl } from "@/lib/utils";
import Navbar from "@/_components/layout/Navbar";
import CyberBackground from "@/_components/cyber/CyberBackground";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cessaService.public.getEvents()
      .then(res => setEvents(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen relative pb-20 font-sans">
      <CyberBackground />
      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-12 border-b border-white/10 pb-6">
          رویدادها و ورک‌شاپ‌ها
        </h1>

        {loading ? (
          <div className="text-cyber-mint font-mono text-base animate-pulse text-center py-20">// LOADING_EVENTS...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((ev) => (
              <Link key={ev.id} href={`/events/${ev.id}`} className="glass-panel-interactive rounded-3xl overflow-hidden flex flex-col border-cyber-mint/20 group">
                <div className="relative h-64 bg-dark-900 flex items-center justify-center overflow-hidden">
                  <img loading="lazy" decoding="async" src={getImageUrl(ev.coverFilePath)} alt="Event" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-75" />
                  <div className="absolute top-4 right-4 bg-dark-950/80 px-3.5 py-1.5 rounded-full text-xs text-cyber-mint font-mono border border-cyber-mint/30">EVENT</div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-xl sm:text-2xl mb-3 group-hover:text-cyber-mint transition-colors leading-snug">
                      {ev.title}
                    </h3>
                  </div>
                  <div className="pt-5 mt-5 border-t border-white/5 flex items-center justify-between text-sm sm:text-base text-cyber-mint font-medium">
                    <span className="flex items-center gap-2"><Calendar size={18} />{new Date(ev.eventDate).toLocaleDateString("fa-IR")}</span>
                    <span className="underline text-cyber-teal group-hover:text-white transition-colors">مشاهده جزئیات</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
