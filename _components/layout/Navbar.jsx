"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useDispatch } from "react-redux";
import { clearAuth } from "@/redux/slices/authSlice";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import { LogIn, UserPlus, LogOut, LayoutDashboard, Menu, X, ExternalLink } from "lucide-react";

export default function Navbar() {
  const { role, isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const activeRole = role ? role.toLowerCase() : "student";
      await cessaService.auth.logout(activeRole);
    } catch {} finally {
      dispatch(clearAuth());
      setMobileMenuOpen(false);
      router.push("/login");
    }
  };

  const isActive = (path) => pathname === path || (path !== '/' && pathname.startsWith(path));

  const navLinks = [
    { href: "/", label: "خانه" },
    { href: "/posts", label: "مطالب" },
    { href: "/events", label: "رویدادها" },
    { href: "/hall-of-fame", label: "تالار مفاخر" },
    { href: "/competitions", label: "مسابقات" },
    { href: "/about", label: "درباره ما" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 py-3 sm:py-4 font-sans">
      <nav className="max-w-7xl mx-auto glass-panel rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between border-cyber-teal/30">
        
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-dark-900 border border-cyber-teal/40 group-hover:border-cyber-teal transition-all shadow-[0_0_15px_rgba(45,212,191,0.25)] overflow-hidden shrink-0">
            <Image src="/image.jpg" alt="CESSA Logo" fill sizes="44px" className="object-cover" />
          </div>
          <span className="font-bold text-lg sm:text-xl tracking-wider text-white">
            CESSA <span className="text-[10px] sm:text-xs text-cyber-teal font-sans tracking-normal block">انجمن علمی کامپیوتر</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm lg:text-base text-gray-300">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`${isActive(link.href) ? 'text-cyber-teal font-bold' : 'hover:text-cyber-teal text-gray-300'} transition-colors`}
            >
              {link.label}
            </Link>
          ))}
          <a 
            href="https://cessaland.ir/tools/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-cyber-teal text-gray-300 transition-colors flex items-center gap-1"
          >
            <span>ابزارها</span>
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-2 bg-[#162226] hover:bg-[#23363D] text-cyber-teal border border-cyber-teal/30 px-4 py-2 rounded-xl text-sm font-bold transition-all">
                <LayoutDashboard size={16} /><span>داشبورد</span>
              </Link>
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer" title="خروج">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                <LogIn size={16} /><span>ورود</span>
              </Link>
              <Link href="/register" className="flex items-center gap-2 bg-cyber-teal hover:bg-teal-300 text-dark-950 font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(45,212,191,0.4)]">
                <UserPlus size={16} /><span>ثبت نام</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="md:hidden p-2 rounded-xl bg-dark-900 border border-white/10 text-cyber-teal hover:text-white focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* منوی همبرگری موبایل: پس‌زمینه ۱۰۰٪ کدر و مات (بدون شفافیت) با رنگ تیره یکدست */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 bg-[#0B1013] border-2 border-cyber-teal/40 rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.98)] space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          <div className="flex flex-col space-y-2 border-b border-white/10 pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-3 px-4 rounded-xl text-base font-bold transition-colors ${
                  isActive(link.href) 
                    ? 'bg-cyber-teal text-dark-950 shadow-[0_0_15px_rgba(45,212,191,0.3)]' 
                    : 'text-gray-200 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a 
              href="https://cessaland.ir/tools/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="py-3 px-4 rounded-xl text-base font-bold text-gray-200 hover:text-cyber-teal hover:bg-white/10 flex items-center justify-between"
            >
              <span>ابزارها</span>
              <ExternalLink size={16} />
            </a>
          </div>

          {/* کلیدهای لاگین/ثبت‌نام در منوی موبایل */}
          <div className="pt-2 flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <Link 
                  href="/dashboard" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3.5 bg-cyber-teal text-dark-950 font-black rounded-xl flex items-center justify-center gap-2 text-base shadow-[0_0_15px_rgba(45,212,191,0.3)]"
                >
                  <LayoutDashboard size={18} />
                  <span>ورود به داشبورد</span>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="w-full py-3 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-colors border border-red-500/30"
                >
                  <LogOut size={16} />
                  <span>خروج از حساب</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  href="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3.5 bg-dark-900 border border-white/20 text-white rounded-xl font-bold text-center text-base hover:bg-white/10"
                >
                  ورود
                </Link>
                <Link 
                  href="/register" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3.5 bg-cyber-teal text-dark-950 font-bold rounded-xl text-center text-base shadow-[0_0_15px_rgba(45,212,191,0.3)] hover:bg-teal-300"
                >
                  ثبت نام
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
