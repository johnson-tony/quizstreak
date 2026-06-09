"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import QuestionCard from "@/components/features/QuestionCard";
import { ChevronLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ChallengePage() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;
  if (status === "unauthenticated") {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <main className="flex-grow mx-auto px-4 md:px-6 py-4 w-full max-w-4xl space-y-4 animate-in fade-in duration-500">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="shrink-0">
              <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 text-muted-foreground hover:text-primary transition-all border border-transparent hover:border-primary/10 bg-white shadow-sm">
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="space-y-0">
              <h1 className="text-lg md:text-xl font-black text-foreground tracking-tight leading-none">Daily Quest</h1>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest opacity-60">Challenge Set</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[9px] bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">
            <Sparkles className="w-3 h-3" />
            Live
          </div>
        </div>

        <QuestionCard />
      </main>
    </div>
  );
}
