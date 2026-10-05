"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/_components/layout/Navbar";
import Image from "next/image";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import { getImageUrl } from "@/lib/utils";
import { Users, GraduationCap, Mail, Send } from "lucide-react";

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

const InstagramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function AboutPage() {
  const [associationMembers, setAssociationMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    cessaService.public.getHallOfFame({ isAssociation: true }).then(res => setAssociationMembers(res.data || [])).finally(() => setLoading(false));
  }, []);

  const groupedTerms = associationMembers.reduce((acc, member) => {
    const termKey = member.term || "سایر دوره‌ها";
    if (!acc[termKey]) acc[termKey] = [];
    acc[termKey].push(member);
    return acc;
  }, {});

  const sortedTerms = Object.keys(groupedTerms).sort((a, b) => b.localeCompare(a));
  const visibleTerms = sortedTerms.slice(0, visibleCount);

  return (
    <div className="min-h-screen relative pb-24 font-sans">
      <Navbar />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-32 space-y-16">
        
        <div className="glass-panel p-8 sm:p-12 md:p-16 rounded-3xl border-cyber-teal/30 shadow-[0_0_40px_rgba(45,212,191,0.15)] text-center md:text-right">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="w-36 h-36 sm:w-44 sm:h-44 shrink-0 rounded-3xl overflow-hidden border-2 border-cyber-teal/50 shadow-[0_0_30px_rgba(45,212,191,0.3)] relative">
              <Image src="/image.jpg" alt="CESSA Logo" fill sizes="176px" priority className="object-cover" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3">انجمن علمی کامپیوتر</h1>
              <p className="text-lg sm:text-xl text-cyber-teal font-mono tracking-wider mb-4">CESSA (Computer Engineering Students' Scientific Association)</p>
              <p className="text-gray-200 text-base sm:text-lg leading-9 md:leading-10">
                انجمن علمی دانشجویی مهندسی کامپیوتر دانشگاه صنعتی اصفهان از سال ۱۳۸۴ فعالیت خود را با هدف ایجاد بستری برای رشد علمی، تقویت مهارت‌های تخصصی و گسترش همکاری‌های گروهی میان دانشجویان آغاز کرده است.
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-8 pt-6 border-t border-white/10">
                <a href="https://t.me/iutcessa" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-sky-500/10 text-sky-400 rounded-xl hover:bg-sky-500 hover:text-white transition-colors border border-sky-500/20 text-sm font-bold shadow-lg"><Send size={16} /> کانال تلگرام</a>
                <a href="https://www.instagram.com/iutcessa" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 text-pink-400 rounded-xl hover:bg-pink-500 hover:text-white transition-colors border border-pink-500/20 text-sm font-bold shadow-lg"><InstagramIcon size={16} /> اینستاگرام</a>
                <a href="https://www.linkedin.com/company/isfahan-university-of-technology-computer-engineering-student-scientific-association/home/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-colors border border-blue-500/20 text-sm font-bold shadow-lg"><LinkedinIcon size={16} /> لینکدین</a>
                <a href="https://github.com/iut-cessa" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-500/10 text-gray-400 rounded-xl hover:bg-gray-500 hover:text-white transition-colors border border-gray-500/20 text-sm font-bold shadow-lg"><GithubIcon size={16} /> گیت‌هاب</a>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          <div className="text-center md:text-right border-b border-white/10 pb-4">
            <h2 className="text-3xl sm:text-4xl font-black text-white flex items-center justify-center md:justify-start gap-3">
              <Users className="text-cyber-teal" size={32} /><span>تاریخچه اعضای انجمن علمی</span>
            </h2>
          </div>

          {loading ? (
            <div className="text-center font-mono text-cyber-teal py-12 animate-pulse">// LOADING_COUNCIL_MEMBERS...</div>
          ) : sortedTerms.length > 0 ? (
            <>
              {visibleTerms.map((term) => (
                <div key={term} className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="flex items-center gap-4">
                    <div className="h-px bg-cyber-teal/30 flex-1"></div>
                    <div className="px-8 py-3 rounded-2xl bg-dark-900 border border-cyber-teal/40 text-cyber-teal font-black text-xl sm:text-2xl shadow-[0_0_20px_rgba(45,212,191,0.2)]">دوره {term}</div>
                    <div className="h-px bg-cyber-teal/30 flex-1"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {groupedTerms[term].map((member) => (
                      <div key={member.id} className="glass-panel p-6 sm:p-8 rounded-[2rem] border-white/10 hover:border-cyber-teal/40 transition-all flex flex-col justify-between group h-full">
                        <div>
                          <div className="flex items-center gap-5 mb-6">
                            <div className="w-20 h-20 rounded-3xl bg-dark-900 border-2 border-cyber-teal/40 flex items-center justify-center text-cyber-teal font-bold text-3xl overflow-hidden shrink-0 shadow-lg">
                              {member.photoUrl ? (<img src={getImageUrl(member.photoUrl)} loading="lazy" decoding="async" className="w-full h-full object-cover" />) : (<span className="font-sans">{member.fullName[0]}</span>)}
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-xl group-hover:text-cyber-teal transition-colors">{member.fullName}</h3>
                              {member.roleTitle && (<span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-cyber-teal/15 text-cyber-teal border border-cyber-teal/30 font-medium">{member.roleTitle}</span>)}
                            </div>
                          </div>
                          <div className="space-y-3 mb-6">
                            {member.entryYear && (<span className="text-xs font-mono text-gray-400 flex items-center gap-1.5"><GraduationCap size={14} className="text-cyber-mint" /><span>ورودی {member.entryYear}</span></span>)}
                            <p className="text-sm sm:text-base text-gray-300 leading-relaxed line-clamp-4" dir="auto">{member.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-center gap-3 w-full pt-4 mt-auto border-t border-white/5">
                          {member.githubUrl && (<a href={member.githubUrl} target="_blank" rel="noreferrer" className="p-2.5 bg-dark-900 rounded-full border border-white/10 text-gray-400 hover:text-white transition-all shadow-md"><GithubIcon size={16} /></a>)}
                          {member.linkedInUrl && (<a href={member.linkedInUrl} target="_blank" rel="noreferrer" className="p-2.5 bg-dark-900 rounded-full border border-blue-500/30 text-blue-400 hover:text-blue-300 transition-all shadow-md"><LinkedinIcon size={16} /></a>)}
                          {member.telegramId && (<a href={`https://t.me/${member.telegramId}`} target="_blank" rel="noreferrer" className="p-2.5 bg-dark-900 rounded-full border border-sky-500/30 text-sky-400 hover:text-sky-300 transition-all shadow-md"><Send size={16} /></a>)}
                          {member.email && (<a href={`mailto:${member.email}`} className="p-2.5 bg-dark-900 rounded-full border border-amber-400/30 text-amber-400 hover:text-amber-300 transition-all shadow-md"><Mail size={16} /></a>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {visibleCount < sortedTerms.length && (
                <div className="flex justify-center mt-12 pt-6">
                  <button onClick={() => setVisibleCount(c => c + 3)} className="px-10 py-4 bg-dark-900 border border-cyber-teal/40 text-cyber-teal font-bold rounded-2xl hover:bg-cyber-teal hover:text-dark-950 transition-all shadow-[0_0_20px_rgba(45,212,191,0.15)] cursor-pointer text-base sm:text-lg">
                    نمایش بیشتر
                  </button>
                </div>
              )}
            </>
          ) : (<div className="glass-panel p-8 text-center text-gray-400 rounded-3xl font-mono text-base border-white/5">هیچ عضوی ثبت نشده است.</div>)}
        </div>
      </div>
    </div>
  );
}
