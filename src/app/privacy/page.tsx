"use client";

import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  const { data: session } = useSession();
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow flex flex-col items-center px-4 py-8 md:py-12 animate-in fade-in duration-700">
        <div className="w-full max-w-4xl space-y-8 relative">
          <header className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">Privacy Policy</h1>
            <p className="text-[10px] md:text-xs text-muted-foreground font-black uppercase tracking-[0.2em]">Last updated: June 2026</p>
          </header>

          <div className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-black text-foreground tracking-tight uppercase">
                Data Collection
              </h2>
              <p className="max-w-3xl">
                We only collect account-related information necessary for your experience on QuizStreak. This includes your name, email address, and profile picture provided during Google authentication.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-black text-foreground tracking-tight uppercase">
                How We Use Data
              </h2>
              <p className="max-w-3xl">
                Your information is used strictly for account access, personalizing your dashboard, tracking your challenge streaks, and maintaining the global leaderboard functionality.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-black text-foreground tracking-tight uppercase">
                Data Security
              </h2>
              <p className="max-w-3xl">
                We do not sell, trade, or otherwise transfer your personally identifiable information to third parties. Your data is stored securely and used only to enhance your learning journey.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-primary/5">
            <Link href="/" className="text-xs md:text-sm font-black text-primary hover:underline uppercase tracking-widest">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>

      {/* Re-using simplified footer logic for consistency */}
      <footer className="bg-white/50 border-t border-primary/5 py-3 px-4">
        <div className="max-w-7xl mx-auto text-center md:text-left">
          <p className="text-[10px] text-muted-foreground/60 font-medium text-center">© 2026 QuizStreak. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
