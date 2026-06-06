"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import StatsSection from "@/components/features/StatsSection";
import StreakCalendar from "@/components/features/StreakCalendar";
import BadgesSection from "@/components/features/BadgesSection";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Award, Zap, TrendingUp, Sparkles, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [attemptStatus, setAttemptStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    } else if (status === "unauthenticated") {
      redirect("/");
    }
  }, [status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, attemptRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/attempts")
      ]);
      
      const profileData = await profileRes.json();
      const attemptData = await attemptRes.json();

      setProfile(profileData);
      setAttemptStatus(attemptData);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow max-w-7xl mx-auto px-4 py-8 space-y-6 w-full">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 lg:col-span-2 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-grow max-w-7xl mx-auto px-3 sm:px-4 py-4 md:py-6 space-y-4 md:space-y-6 w-full animate-in fade-in duration-700">
        {/* Compact Welcome & Quick Stats Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-4 md:p-6 rounded-2xl md:rounded-3xl border-primary/5 shadow-xl bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.02] blur-3xl -mr-32 -mt-32 rounded-full" />
          
          <div className="flex items-center gap-3 md:gap-5 relative z-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Avatar className="h-14 w-14 md:h-20 md:w-20 border-[3px] md:border-4 border-white shadow-2xl relative z-10 ring-1 ring-primary/5">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-primary/5 text-primary text-xl md:text-2xl font-black">
                  {session?.user?.name?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-0.5">
              <h1 className="text-lg md:text-3xl font-black text-foreground tracking-tight">
                Hey, {session?.user?.name?.split(' ')[0]}
              </h1>
              <div className="flex items-center gap-2 md:gap-3">
                 <div className="px-2 py-0.5 bg-primary/5 rounded-full border border-primary/10 flex items-center gap-1">
                   <div className="w-1 h-1 rounded-full bg-primary" />
                   <span className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-widest">Rank #{profile?.user?.rank}</span>
                 </div>
                 <span className="text-[10px] md:text-[11px] text-muted-foreground font-bold italic">Set #{profile?.user?.currentSet || 1}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 md:gap-3 relative z-10">
            <div className="flex-1 md:flex-none bg-orange-500/[0.03] border border-orange-500/10 px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl flex items-center gap-3 md:gap-4 transition-all hover:bg-orange-500/[0.06]">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-orange-600 fill-orange-600" />
              </div>
              <div>
                <div className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em]">Streak</div>
                <div className="text-base md:text-xl font-black text-foreground">{profile?.user?.currentStreak}d</div>
              </div>
            </div>
            <div className="flex-1 md:flex-none bg-primary/[0.03] border border-primary/10 px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl flex items-center gap-3 md:gap-4 transition-all hover:bg-primary/[0.06]">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <div>
                <div className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em]">Score</div>
                <div className="text-base md:text-xl font-black text-foreground">{profile?.user?.totalPoints.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Big CTA for the Daily Task */}
        <section>
          {attemptStatus?.attempted ? (
            <div className="bg-emerald-500/[0.03] border-2 border-dashed border-emerald-500/20 rounded-2xl md:rounded-[2.5rem] p-6 md:p-12 text-center relative overflow-hidden group">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-radial-gradient(circle,rgba(16,185,129,0.05),transparent) pointer-events-none" />
               <div className="relative z-10 space-y-3 md:space-y-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-inner ring-4 ring-emerald-50">
                    <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-foreground">Task Complete!</h2>
                  <p className="text-xs md:text-sm text-muted-foreground font-medium max-w-xs md:max-w-sm mx-auto">
                    Excellent job! Come back tomorrow to unlock **Set #{profile?.user?.currentSet}**.
                  </p>
                  <Link href="/challenge" className="inline-block pt-1 md:pt-2">
                    <Button variant="outline" className="rounded-lg md:rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold px-6 md:px-8 h-9 md:h-10 text-xs md:text-sm">
                      Review Today&apos;s Answers
                    </Button>
                  </Link>
               </div>
            </div>
          ) : (
            <motion.div 
              whileHover={{ scale: 1.005 }}
              className="relative rounded-2xl md:rounded-[2.5rem] overflow-hidden group shadow-2xl shadow-primary/10"
            >
              <div className="absolute inset-0 bg-primary transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl -mr-32 -mt-32 rounded-full" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-2xl -ml-24 -mb-24 rounded-full" />
              
              <div className="relative z-10 p-6 md:p-14 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                <div className="text-center md:text-left space-y-3 md:space-y-4">
                  <div className="inline-flex items-center gap-2 px-2 py-0.5 md:px-3 md:py-1 bg-white/10 rounded-full border border-white/20 text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                    <Sparkles className="w-3 h-3" /> Mission Available
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">
                    Start Today&apos;s <br className="hidden sm:block" />
                    Challenge <span className="text-white/60 font-medium italic text-lg sm:text-2xl md:text-3xl">Set #{profile?.user?.currentSet || 1}</span>
                  </h2>
                  <p className="text-primary-foreground/70 text-[11px] md:text-sm max-w-xs md:max-w-md font-medium leading-relaxed">
                    Test your expertise in Software Engineering & Architecture. Complete this set to earn points.
                  </p>
                </div>
                
                <Link href="/challenge" className="w-full sm:w-auto">
                  <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 h-14 md:h-20 px-8 md:px-10 rounded-xl md:rounded-[2rem] font-black text-lg md:text-xl shadow-2xl shadow-black/20 group transition-all">
                      GO TO TASK <ChevronRight className="ml-2 w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4 md:space-y-6 order-2 lg:order-1">
            <StreakCalendar />
            <StatsSection stats={{
              totalPoints: profile?.user?.totalPoints || 0,
              accuracy: profile?.stats?.accuracy || 0,
              totalSolved: profile?.stats?.totalSolved || 0,
              currentStreak: profile?.user?.currentStreak || 0,
              longestStreak: profile?.user?.longestStreak || 0,
            }} />
          </div>

          <div className="space-y-4 md:space-y-6 order-1 lg:order-2">
            <BadgesSection userBadges={profile?.user?.badges || []} />
            
            <Card className="rounded-2xl md:rounded-[2rem] border-primary/5 bg-primary overflow-hidden shadow-xl shadow-primary/10 group">
               <CardContent className="p-6 md:p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl -mr-16 -mt-16 rounded-full" />
                  <div className="relative z-10">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 md:mb-6">
                      <Award className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-2 md:mb-3">Daily Wisdom</h3>
                    <p className="text-base md:text-lg font-bold leading-tight group-hover:text-primary-foreground transition-colors duration-300">
                      &quot;Consistent practice is the only shortcut to expertise.&quot;
                    </p>
                  </div>
               </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
