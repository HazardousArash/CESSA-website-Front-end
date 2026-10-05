"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/_components/layout/Navbar";
import CyberBackground from "@/_components/cyber/CyberBackground";
import { Send, Hexagon, Mail, GraduationCap } from "lucide-react"; 
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import { getImageUrl } from "@/lib/utils";

const GithubIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function HallOfFamePage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cessaService.public.getHallOfFame({ isAssociation: false })
      .then(res => setMembers(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen relative pb-20 font-sans">
      <CyberBackground />
      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-32">
        <div className="flex flex-col items-center justify-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/20 blur-[100px] rounded-full pointer-events-none"></div>
          <Hexagon className="text-amber-400 w-20 h-20 sm:w-24 sm:h-24 stroke-[1px] mb-4 animate-[spin_10s_linear_infinite]" />
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-amber-200 tracking-widest text-center">
            HALL OF FAME
          </h1>
          <p className="text-amber-400 font-mono mt-4 tracking-widest uppercase text-xs sm:text-sm border-y border-amber-400/30 py-2">
            The Elite Nodes of CESSA Network
          </p>
        </div>

        {loading ? (
          <div className="text-amber-400 font-mono animate-pulse text-center py-12">// DECRYPTING_ARCHIVES...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {members.map((member) => (
              <div key={member.id} className="relative p-[1px] rounded-3xl bg-gradient-to-b from-amber-400/30 to-transparent group overflow-hidden">
                <div className="absolute inset-0 bg-amber-400/5 group-hover:bg-amber-400/10 transition-colors pointer-events-none"></div>
                <div className="h-full bg-dark-950/90 backdrop-blur-xl p-8 rounded-3xl flex flex-col justify-between items-center text-center">
                  
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-dark-900 border-2 border-amber-400/50 flex items-center justify-center text-4xl font-black text-amber-400 mb-4 shadow-[0_0_20px_rgba(251,191,36,0.3)] overflow-hidden relative">
                      {member.photoUrl ? (
                        <img loading="lazy" decoding="async" src={getImageUrl(member.photoUrl)} alt={member.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-sans">{member.fullName[0]}</span>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2 font-sans">{member.fullName}</h3>
                    
                    {member.entryYear && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 mb-4 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-mono font-bold">
                        <GraduationCap size={14} />
                        <span>ورودی {member.entryYear}</span>
                      </span>
                    )}

                    <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6 line-clamp-4" dir="auto">
                      {member.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 w-full pt-4 border-t border-white/5">
                    {member.githubUrl && (
                      <a href={member.githubUrl} target="_blank" rel="noreferrer" className="p-3 bg-dark-900 rounded-full border border-white/10 text-gray-400 hover:text-white transition-all shadow-lg" title="GitHub">
                        <GithubIcon />
                      </a>
                    )}
                    {member.linkedInUrl && (
                      <a href={member.linkedInUrl} target="_blank" rel="noreferrer" className="p-3 bg-dark-900 rounded-full border border-blue-500/30 text-blue-400 hover:text-blue-300 transition-all shadow-lg" title="LinkedIn">
                        <LinkedinIcon />
                      </a>
                    )}
                    {member.telegramId && (
                      <a href={`https://t.me/${member.telegramId}`} target="_blank" rel="noreferrer" className="p-3 bg-dark-900 rounded-full border border-sky-500/30 text-sky-400 hover:text-sky-300 transition-all shadow-lg" title="Telegram">
                        <Send size={18} />
                      </a>
                    )}
                    {member.email && (
                      <a href={`mailto:${member.email}`} className="p-3 bg-dark-900 rounded-full border border-amber-400/30 text-amber-400 hover:text-amber-300 transition-all shadow-lg" title="Email">
                        <Mail size={18} />
                      </a>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
