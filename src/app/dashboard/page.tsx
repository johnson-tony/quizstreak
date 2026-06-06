"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import QuestionCard from "@/components/features/QuestionCard";
import StatsSection from "@/components/features/StatsSection";
import StreakCalendar from "@/components/features/StreakCalendar";
import BadgesSection from "@/components/features/BadgesSection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Award, Zap, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    } else if (status === "unauthenticated") {
      redirect("/");
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      toast.error("Failed to load profile");
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
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 py-6 space-y-4 md:space-y-6 w-full">
        {/* Compact Welcome & Quick Stats Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-5 md:p-6 rounded-2xl border-primary/5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Avatar className="h-14 w-14 md:h-16 md:w-16 border-2 border-white shadow-md relative z-10">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-primary/5 text-primary text-lg font-bold">
                  {session?.user?.name?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                Hey, {session?.user?.name?.split(' ')[0]}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground font-medium flex items-center gap-1">
                Global Rank <span className="text-primary font-bold">#{profile?.user?.rank}</span>
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1 md:flex-none bg-primary/[0.03] border border-primary/5 px-4 py-2 rounded-xl flex items-center gap-3">
              <Zap className="w-4 h-4 text-primary" />
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Streak</div>
                <div className="text-sm font-black text-primary">
                  {profile?.user?.currentStreak} Days
                </div>
              </div>
            </div>
            <div className="flex-1 md:flex-none bg-secondary/[0.03] border border-secondary/5 px-4 py-2 rounded-xl flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-secondary" />
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Points</div>
                <div className="text-sm font-black text-secondary">
                  {profile?.user?.totalPoints}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Content - Challenge & Calendar */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <QuestionCard />
            <StreakCalendar />
          </div>

          {/* Sidebar - Badges & Activity */}
          <div className="space-y-4 md:space-y-6">
            <StatsSection stats={{
              totalPoints: profile?.user?.totalPoints || 0,
              accuracy: profile?.stats?.accuracy || 0,
              totalSolved: profile?.stats?.totalSolved || 0,
              currentStreak: profile?.user?.currentStreak || 0,
              longestStreak: profile?.user?.longestStreak || 0,
            }} />
            
            <BadgesSection userBadges={profile?.user?.badges || []} />
            
            <div className="bg-primary rounded-2xl p-6 text-white shadow-lg shadow-primary/10 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-white/80" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-white/90">Daily Tip</h3>
                </div>
                <p className="text-sm font-medium leading-relaxed text-white/90 group-hover:text-white transition-colors duration-300">
                  Consistency beats intensity. Solve one challenge daily to maintain your peak cognitive performance.
                </p>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl -mr-12 -mt-12 rounded-full" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
