"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  const [branding, setBranding] = useState({ siteName: "QuizStreak", logoUrl: "/quickstreak.svg" });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        if (data.siteName) {
          setBranding({ siteName: data.siteName, logoUrl: data.logoUrl || "/quickstreak.svg" });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <nav className="border-b border-primary/5 bg-white/80 backdrop-blur-xl sticky top-0 z-50 safe-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <img src={branding.logoUrl} alt={`${branding.siteName} Logo`} className="w-8 h-8" />
              <span className="text-xl font-bold text-primary tracking-tight">
                {branding.siteName}
              </span>
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
