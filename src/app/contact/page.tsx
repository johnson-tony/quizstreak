"use client";

import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-14 animate-in fade-in duration-700">
        <div className="w-full max-w-md space-y-4 text-center">
          <header className="space-y-3">
            <div className="mx-auto w-10 h-10 bg-primary/5 rounded-2xl flex items-center justify-center mb-4 border border-primary/10">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Support</h1>
            <p className="text-sm md:text-base text-muted-foreground font-medium px-4">
              Have a question or feedback? We&apos;d love to hear from you.
            </p>
          </header>

          <div className="py-8">
            <a 
              href="mailto:support@quizstreak.com" 
              className="text-xl md:text-2xl font-black text-primary hover:text-primary/80 transition-colors underline underline-offset-8 decoration-2 decoration-primary/20 hover:decoration-primary"
            >
              support@quizstreak.com
            </a>
          </div>

          <div className="pt-8 border-t border-primary/5">
            <Link href="/" className="text-xs md:text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
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
