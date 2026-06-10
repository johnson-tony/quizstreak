"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  const [branding, setBranding] = useState({ siteName: "QuizStreak", logoUrl: "/quickstreak.svg" });
  const [userPersona, setUserPersona] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/settings").then(res => res.json()),
      fetch("/api/user/profile").then(res => res.json())
    ]).then(([settings, profile]) => {
      if (settings.siteName) {
        setBranding({ siteName: settings.siteName, logoUrl: settings.logoUrl || "/quickstreak.svg" });
      }
      if (profile?.user?.persona && profile.user.persona !== 'unselected') {
        setUserPersona(profile.user.persona);
      }
    }).catch(() => {});
  }, [session]);

  return (
    <nav className="border-b border-primary/5 bg-white/80 backdrop-blur-xl sticky top-0 z-50 safe-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <img src={branding.logoUrl} alt={`${branding.siteName} Logo`} className="w-8 h-8" />
              <div className="flex flex-col">
                <span className="text-sm md:text-xl font-black text-primary tracking-tight leading-none">
                  {branding.siteName}
                </span>
                {userPersona && (
                  <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-0.5 hidden md:block">
                    {userPersona === 'technical' ? 'Architect Mode' : userPersona === 'non-technical' ? 'Professional Mode' : 'Explorer Mode'}
                  </span>
                )}
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            {!session && (
              <Link href="/login">
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 h-9 text-xs font-bold shadow-lg shadow-primary/10">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
