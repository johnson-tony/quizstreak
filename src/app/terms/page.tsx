"use client";

import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow flex flex-col items-center px-4 py-4 animate-in fade-in duration-700">
        <div className="w-full max-w-4xl space-y-4">
          <header className="space-y-2 text-center md:text-left">
            <h1 className="text-4xl font-black text-foreground tracking-tight">Terms of Use</h1>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Last updated: June 2026</p>
          </header>

          <div className="space-y-3 text-sm md:text-base text-muted-foreground leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-black text-foreground tracking-tight">Acceptable Use</h2>
              <p>
                QuizStreak is designed for educational purposes. You agree to use the platform fairly, without attempting to exploit the AI generation system or manipulate leaderboard rankings through automated means.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-black text-foreground tracking-tight">Account Responsibility</h2>
              <p>
                You are responsible for maintaining the security of your account. All activities performed under your authenticated profile are your responsibility.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-black text-foreground tracking-tight">Service Availability</h2>
              <p>
                We strive to maintain 24/7 availability, but we do not guarantee uninterrupted access. We reserve the right to modify or discontinue features to improve the overall learning experience.
              </p>
            </section>
          </div>

          <div className="pt-3 border-t border-primary/5">
            <Link href="/" className="text-xs md:text-sm font-bold text-primary hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-white/50 border-t border-primary/5 py-3 px-4">
        <div className="max-w-7xl mx-auto text-center md:text-left">
          <p className="text-[10px] text-muted-foreground/60 font-medium text-center">© 2026 QuizStreak. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
