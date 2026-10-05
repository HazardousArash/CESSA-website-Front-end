"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function ExploreUsersRedirectPage() {
  const router = useRouter();
  const { role, authChecked } = useAuth();

  useEffect(() => {
    if (!authChecked) return;
    
    // Redirect Admins to the unified User Management page, others to Dashboard
    if (role === "Admin") {
      router.replace("/admin/users");
    } else {
      router.replace("/dashboard");
    }
  }, [role, authChecked, router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-cyber-teal font-mono text-sm animate-pulse">
      // REDIRECTING_USER_ROUTER...
    </div>
  );
}