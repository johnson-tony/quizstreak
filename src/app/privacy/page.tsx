"use client";

import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow flex flex-col items-center px-4 py-4 animate-in fade-in duration-700">
        <div className="w-full max-w-4xl space-y-6">
          <header className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Last updated: June 2026</p>
          </header>

          <div className="space-y-3 text-sm md:text-base text-muted-foreground leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-black text-foreground tracking-tight">Data Collection</h2>
              <p>
                We only collect account-related information necessary for your experience on QuizStreak. This includes your name, email address, and profile picture provided during Google authentication.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-black text-foreground tracking-tight">How We Use Data</h2>
              <p>
                Your information is used strictly for account access, personalizing your dashboard, tracking your challenge streaks, and maintaining the global leaderboard functionality.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-black text-foreground tracking-tight">Data Security</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personally identifiable information to third parties. Your data is stored securely and used only to enhance your learning journey.
              </p>
            </section>
          </div>

          <div className="pt-4 border-t border-primary/5">
            <Link href="/" className="text-xs md:text-sm font-bold text-primary hover:underline">
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
