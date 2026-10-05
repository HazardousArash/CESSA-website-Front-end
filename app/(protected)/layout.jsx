"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useDispatch } from "react-redux";
import { clearAuth } from "@/redux/slices/authSlice";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import { getImageUrl } from "@/lib/utils";
import { Home, User, CreditCard, Users, LogOut, Terminal, Award, Megaphone, Menu, X, BookOpen, Tag } from "lucide-react";
import Navbar from "@/_components/layout/Navbar";

export default function DashboardLayout({ children }) {
  const { user, role, isAuthenticated, authChecked } = useAuth();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      router.push("/login");
    } else if (isAuthenticated) {
      const activeRole = role ? role.toLowerCase() : "student";
      cessaService.profile.getMe(activeRole).then(res => {
        if (res.data) {
           setProfileData(res.data);
           const updatedUser = { id: user?.id, email: user?.email, firstName: res.data.firstName, lastName: res.data.lastName };
           localStorage.setItem("cessa_user", JSON.stringify(updatedUser));
        }
      }).catch(()=>{});
    }
  }, [isAuthenticated, authChecked, router, role]);

  const handleLogout = async () => {
    try {
      const activeRole = role ? role.toLowerCase() : "student";
      await cessaService.auth.logout(activeRole);
    } finally {
      dispatch(clearAuth());
      router.push("/login");
    }
  };

  if (!authChecked || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center text-cyber-teal font-mono animate-pulse">// SYSTEM_AUTH_VERIFY...</div>;
  }

  const navItems = [
    { href: "/dashboard", label: "داشبورد من", icon: Home },
    { href: "/profile", label: "پروفایل کاربری", icon: User },
    { href: "/payments", label: "تراکنش‌های مالی", icon: CreditCard },
  ];

  if (role === "ContentCreator") navItems.push({ href: "/creator-guide", label: "آموزش", icon: BookOpen });
  if (role === "Admin") {
    navItems.push({ href: "/admin/users", label: "مدیریت و جستجوی کاربران", icon: Users });
    navItems.push({ href: "/admin/categories", label: "مدیریت دسته‌بندی‌ها", icon: Tag });
    navItems.push({ href: "/admin/ads", label: "مدیریت تبلیغات", icon: Megaphone });
    navItems.push({ href: "/admin/halloffame", label: "تالار مفاخر", icon: Award });
    navItems.push({ href: "/admin/logs", label: "لاگ‌های سیستم", icon: Terminal });
  }

  const displayName = profileData?.firstName ? `${profileData.firstName} ${profileData.lastName}` : (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : "کاربر CESSA");

  return (
    <div className="min-h-screen relative flex flex-col text-gray-200 font-sans z-10">
      <div className="z-50"><Navbar /></div>
      <div className="relative z-10 flex flex-1 w-full p-4 pt-28 lg:p-6 lg:pt-32 gap-6 overflow-hidden max-w-[1600px] mx-auto">
        <button onClick={() => setMobileMenuOpen(true)} className="md:hidden absolute top-24 right-4 z-40 p-3 rounded-2xl bg-dark-900 border border-cyber-teal/30 text-cyber-teal flex items-center gap-2 shadow-lg">
          <Menu size={20} /> <span>منوی داشبورد</span>
        </button>

        <aside className={`fixed inset-y-0 right-0 z-[100] w-72 bg-dark-950/95 backdrop-blur-3xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:bg-dark-950/80 md:rounded-[32px] p-6 flex flex-col justify-between shrink-0 shadow-[0_0_40px_rgba(0,0,0,0.5)] border-l md:border border-white/10 overflow-hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden absolute top-6 left-6 text-gray-400 hover:text-white"><X size={24} /></button>
          
          <div className="relative z-10 overflow-y-auto pr-2 mt-8 md:mt-0" style={{ scrollbarWidth: 'none' }}>
            <div className="flex flex-col items-center pb-8 pt-4 border-b border-white/5">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-dark-900 border-2 border-cyber-teal flex items-center justify-center font-bold text-cyber-teal text-3xl shadow-[0_0_25px_rgba(45,212,191,0.2)] overflow-hidden">
                  {profileData?.profilePictureUrl ? <img src={getImageUrl(profileData.profilePictureUrl)} className="w-full h-full object-cover" /> : (displayName[0])}
                </div>
              </div>
              <h3 className="font-bold text-white text-lg mt-3 mb-1 text-center">{displayName}</h3>
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-cyber-teal font-mono tracking-widest mt-1">{role?.toUpperCase() || "STUDENT"}</div>
            </div>

            <nav className="mt-8 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all relative group ${isActive ? "bg-cyber-teal text-dark-950 shadow-[0_0_20px_rgba(45,212,191,0.3)]" : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"}`}>
                    <Icon size={20} className={isActive ? "text-dark-950" : "text-gray-500 group-hover:text-cyber-teal transition-colors shrink-0"} />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-6 border-t border-white/5 space-y-3 relative z-10 mt-auto">
            <button onClick={handleLogout} className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-sm font-bold text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
              <LogOut size={20} className="shrink-0" /><span>خروج از سیستم</span>
            </button>
          </div>
        </aside>

        {mobileMenuOpen && <div className="md:hidden fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>}

        <main className="flex-1 bg-dark-950/60 backdrop-blur-xl rounded-[32px] p-4 pt-16 md:pt-6 md:p-6 lg:p-10 overflow-y-auto relative border border-white/5 shadow-2xl">
          {children}
        </main>
      </div>
    </div>
  );
}
