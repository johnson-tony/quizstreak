"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
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
        fetch(`/api/user/profile?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/attempts?t=${Date.now()}`, { cache: 'no-store' })
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
      <main className="flex-grow max-w-7xl mx-auto px-2 sm:px-4 py-2 md:py-4 space-y-3 md:space-y-4 w-full animate-in fade-in duration-700">
        {/* Compact Welcome & Quick Stats Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-3 glass-card p-3 md:p-5 rounded-xl md:rounded-[2rem] border-primary/5 shadow-lg bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/[0.02] blur-3xl -mr-24 -mt-24 rounded-full" />
          
          <div className="flex items-center gap-3 md:gap-4 relative z-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Avatar className="h-12 w-12 md:h-16 md:w-16 border-[3px] border-white shadow-xl relative z-10 ring-1 ring-primary/5">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-primary/5 text-primary text-lg md:text-xl font-black">
                  {session?.user?.name?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-0">
              <h1 className="text-sm md:text-2xl font-black text-foreground tracking-tight uppercase leading-none">
                {session?.user?.name?.split(' ')[0]}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                 <div className="px-1 py-0.5 bg-primary/5 rounded-full border border-primary/10 flex items-center gap-1">
                   <div className="w-0.5 h-0.5 rounded-full bg-primary animate-pulse" />
                   <span className="text-[6px] md:text-[9px] font-black text-primary uppercase tracking-widest">Rank #{profile?.user?.rank}</span>
                 </div>
                 <span className="text-[7px] md:text-xs text-muted-foreground font-bold italic uppercase tracking-tighter">Set #{profile?.user?.currentSet || 1}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-1 md:gap-2 relative z-10">
            <div className="flex-1 md:flex-none bg-orange-500/[0.02] border border-orange-500/5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2 transition-all hover:bg-orange-500/[0.04]">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-md bg-orange-500/10 flex items-center justify-center">
                <Zap className="w-3 h-3 md:w-4 md:h-4 text-orange-600 fill-orange-600" />
              </div>
              <div>
                <div className="text-[6px] md:text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Streak</div>
                <div className="text-xs md:text-sm font-black text-foreground">{profile?.user?.currentStreak}d</div>
              </div>
            </div>
            <div className="flex-1 md:flex-none bg-primary/[0.02] border border-primary/5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2 transition-all hover:bg-primary/[0.04]">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-md bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-primary" />
              </div>
              <div>
                <div className="text-[6px] md:text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Score</div>
                <div className="text-xs md:text-sm font-black text-foreground">{profile?.user?.totalPoints.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Big CTA for the Daily Task */}
        <section>
          {attemptStatus?.attempted ? (
            <motion.div 
              whileHover={{ scale: 1.002 }}
              className="relative rounded-xl md:rounded-[2rem] overflow-hidden group shadow-xl shadow-primary/20 bg-primary"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl -mr-24 -mt-24 rounded-full" />
              
              <div className="relative z-10 p-4 md:p-10 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                <div className="text-center md:text-left space-y-1 md:space-y-3">
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/10 rounded-full border border-white/20 text-white text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em]">
                    <CheckCircle2 className="w-2 h-2" /> Mission Complete
                  </div>
                  <h2 className="text-lg sm:text-2xl md:text-4xl font-black text-white tracking-tight leading-[1.1] uppercase">
                    Challenge Done <br className="hidden sm:block" />
                    <span className="text-white/60 font-medium italic text-xs md:text-2xl">Return in 24h</span>
                  </h2>
                  <p className="text-primary-foreground/70 text-[9px] md:text-xs max-w-xs md:max-w-md font-medium leading-tight">
                    You have successfully completed today's task. Next mission: Set #{profile?.user?.currentSet}.
                  </p>
                </div>
                
                <Link href="/challenge" className="w-full sm:w-auto">
                  <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                    <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 h-10 md:h-16 px-5 md:px-10 rounded-lg md:rounded-2xl font-black text-xs md:text-base shadow-lg group transition-all uppercase tracking-widest">
                      Review Answers <ChevronRight className="ml-0.5 w-3 h-3 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-5">
          <div className="lg:col-span-2 space-y-3 md:space-y-4 order-2 lg:order-1">
            <StreakCalendar />
            <div className="glass-card p-3 md:p-5 rounded-xl md:rounded-2xl border-primary/5 shadow-md bg-white">
              <h3 className="text-[8px] md:text-xs font-black text-foreground uppercase tracking-widest mb-2 md:mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" />
                Performance
              </h3>
              <StatsSection stats={{
                totalPoints: profile?.user?.totalPoints || 0,
                accuracy: profile?.stats?.accuracy || 0,
                totalSolved: profile?.stats?.totalSolved || 0,
                currentStreak: profile?.user?.currentStreak || 0,
                longestStreak: profile?.user?.longestStreak || 0,
              }} />
            </div>
          </div>

          <div className="space-y-3 md:space-y-4 order-1 lg:order-2">
            <BadgesSection userBadges={profile?.user?.badges || []} />
            
            <Card className="rounded-xl md:rounded-2xl border-primary/5 bg-primary overflow-hidden shadow-lg group">
               <CardContent className="p-4 md:p-5 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 blur-2xl -mr-10 -mt-10 rounded-full" />
                  <div className="relative z-10">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center mb-2">
                      <Award className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h3 className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Daily Wisdom</h3>
                    <p className="text-xs md:text-base font-bold leading-tight group-hover:text-primary-foreground transition-colors">
                      &quot;Consistent practice is the shortcut to expertise.&quot;
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
