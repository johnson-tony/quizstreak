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
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 w-full">
          <Skeleton className="h-32 w-full rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-96 lg:col-span-2 rounded-3xl" />
            <Skeleton className="h-96 rounded-3xl" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 w-full">
        {/* Welcome Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-sm p-8 rounded-[32px] border border-white/60">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-4 border-white shadow-xl">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session?.user?.name?.split(' ')[0]}!</h1>
              <p className="text-gray-500 mt-1">You&apos;re currently ranked <span className="font-bold text-blue-600">#{profile?.user?.rank}</span> globally.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-white">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Streak</div>
              <div className="text-xl font-black text-orange-500 flex items-center">
                {profile?.user?.currentStreak} Days
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-white">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Points</div>
              <div className="text-xl font-black text-blue-600">
                {profile?.user?.totalPoints}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Row */}
        <StatsSection stats={{
          totalPoints: profile?.user?.totalPoints || 0,
          accuracy: profile?.stats?.accuracy || 0,
          totalSolved: profile?.stats?.totalSolved || 0,
          currentStreak: profile?.user?.currentStreak || 0,
          longestStreak: profile?.user?.longestStreak || 0,
        }} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Challenge */}
          <div className="lg:col-span-2 space-y-8">
            <QuestionCard />
            <StreakCalendar />
          </div>

          {/* Sidebar - Badges & Activity */}
          <div className="space-y-8">
            <BadgesSection userBadges={profile?.user?.badges || []} />
            
            {/* Quick Activity Card or Tip */}
            <div className="bg-blue-600 rounded-[24px] p-8 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">Pro Tip</h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Consistency is key. Solving just one challenge a day keeps your skills sharp and your streak alive!
                </p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl -mr-16 -mt-16 rounded-full" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
