"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import QuestionCard from "@/components/features/QuestionCard";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ChallengePage() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;
  if (status === "unauthenticated") {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow max-w-3xl mx-auto px-4 py-8 md:py-12 w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Button>
        </Link>

        <div className="space-y-2 mb-8 text-center md:text-left">
          <h1 className="text-3xl font-black text-foreground tracking-tight">Today&apos;s Challenge</h1>
          <p className="text-sm text-muted-foreground font-medium">Complete your daily set to maintain your streak.</p>
        </div>

        <QuestionCard />
      </main>
    </div>
  );
}
