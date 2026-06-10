"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Footer() {
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
    <footer className="bg-white/50 border-t border-primary/5 py-4 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <img src={branding.logoUrl} alt={`${branding.siteName} Logo`} className="w-8 h-8" />
            <div className="text-lg font-bold text-primary tracking-tight">{branding.siteName}</div>
          </Link>
          <div className="flex gap-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </div>
          <div className="text-xs text-muted-foreground/60 font-medium">
            © {new Date().getFullYear()} {branding.siteName}
          </div>
        </div>
      </div>
    </footer>
  );
}
