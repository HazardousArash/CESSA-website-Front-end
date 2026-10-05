"use client";
import React from "react";
import Navbar from "@/_components/layout/Navbar";
import CyberBackground from "@/_components/cyber/CyberBackground";
import { Terminal } from "lucide-react";

export default function CompetitionsPage() {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4">
      <CyberBackground />
      <Navbar />
      <div className="relative z-10 glass-panel p-16 rounded-3xl text-center max-w-2xl w-full border-cyber-teal/30 shadow-[0_0_50px_rgba(45,212,191,0.2)] flex flex-col items-center">
        <Terminal className="text-cyber-teal w-20 h-20 mb-8 animate-pulse" />
        <h1 className="text-5xl font-black text-white tracking-widest mb-6 font-mono">COMING SOON</h1>
        <p className="text-gray-400 text-lg font-sans">
            انواع مسابقات رشته کامپیوتر، به زودی  ...
        </p>
        <div className="w-full h-1 bg-dark-800 rounded-full mt-10 overflow-hidden relative">
           <div className="absolute top-0 left-0 h-full bg-cyber-teal w-1/3 animate-pulse"></div>
        </div>
        <p className="text-xs text-cyber-teal mt-4 font-mono">UNDER CONSTRUCTION</p>
      </div>
    </div>
  );
}