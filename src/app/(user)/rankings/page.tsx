"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Crown, Flame, Target, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

type RankingUser = {
  _id: string;
  name: string;
  image?: string;
  totalPoints: number;
  weeklyPoints?: number;
  challengesCompleted?: number;
  correctAnswers?: number;
  badges?: string[];
};

export default function RankingsPage() {
  const [users, setUsers] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("allTime");

  useEffect(() => {
    fetchRankings();
  }, [timeRange]);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?type=${timeRange}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load rankings");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = (rank: number) => {
    if (rank === 0) return { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Crown };
    if (rank === 1) return { color: "text-slate-400", bg: "bg-slate-400/10", border: "border-slate-400/20", icon: Medal };
    if (rank === 2) return { color: "text-orange-600", bg: "bg-orange-600/10", border: "border-orange-600/20", icon: Medal };
    return { color: "text-muted-foreground", bg: "bg-muted", border: "border-transparent", icon: null };
  };

  if (loading && users.length === 0) {
    return (
      <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-full max-w-md" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  const isWeekly = timeRange === "weekly";
  const topThree = isWeekly ? users.slice(0, 3) : [];
  const restUsers = isWeekly ? users.slice(3) : users;

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-4 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-foreground tracking-tight uppercase">Global Rankings</h1>
          <p className="text-muted-foreground font-medium text-xs md:text-xs">
            {isWeekly ? "Weekly Challenge — compete for the highest score this week." : "Top performing experts in Software Engineering."}
          </p>
        </div>
        
        <Tabs value={timeRange} onValueChange={setTimeRange} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-2 w-full md:w-[220px] bg-primary/5 p-0.5 rounded-lg">
            <TabsTrigger value="allTime" className="rounded-md font-bold text-xs data-[state=active]:bg-white data-[state=active]:shadow-xs">Daily Challenge</TabsTrigger>
            <TabsTrigger value="weekly" className="rounded-md font-bold text-xs data-[state=active]:bg-white data-[state=active]:shadow-xs">Weekly Challenge</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isWeekly ? (
        <div className="space-y-5">
          <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-primary/[0.08] via-background to-background shadow-xl rounded-2xl md:rounded-[2rem]">
            <CardContent className="p-4 md:p-7">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                    <Trophy className="w-4 h-4" /> Weekly Champions
                  </div>
                  <h2 className="text-xl md:text-2xl font-black mt-1">This Week&apos;s Leaders</h2>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                  <Flame className="w-4 h-4 text-orange-500" /> Earn points daily
                </div>
              </div>

              {topThree.length === 0 ? (
                <div className="py-10 text-center text-sm font-medium text-muted-foreground">No weekly scores yet. Be the first to take the lead.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 items-end">
                  {topThree.map((user, index) => {
                    const rank = index + 1;
                    const isFirst = rank === 1;
                    return (
                      <Link href={`/users/${user._id}`} key={user._id} className={isFirst ? "sm:order-2" : rank === 2 ? "sm:order-1" : "sm:order-3"}>
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.08 }}
                          className={`relative text-center p-4 md:p-5 rounded-2xl border bg-background/70 hover:bg-background transition-all hover:-translate-y-1 ${isFirst ? "border-amber-500/30 shadow-lg shadow-amber-500/10 sm:pb-7" : "border-primary/10"}`}
                        >
                          {isFirst && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest">#1</div>}
                          <div className="flex justify-center mb-3">
                            <Avatar className={`${isFirst ? "h-16 w-16 md:h-20 md:w-20" : "h-14 w-14"} border-2 border-background shadow-lg ring-2 ring-primary/10`}>
                              <AvatarImage src={user.image} />
                              <AvatarFallback className="bg-primary/5 text-primary font-black">{user.name?.[0]}</AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="font-black text-sm md:text-base truncate">{user.name}</div>
                          <div className="text-2xl md:text-3xl font-black text-primary tracking-tight mt-1 tabular-nums">{(user.weeklyPoints || 0).toLocaleString()}</div>
                          <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Weekly Points</div>
                          <div className="flex justify-center gap-2 mt-3 text-[9px] font-bold text-muted-foreground">
                            <span className="inline-flex items-center gap-1"><Target className="w-3 h-3" /> {user.challengesCompleted || 0} days</span>
                            <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {user.correctAnswers || 0} correct</span>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-2">
            {restUsers.map((user, index) => {
              const rank = index + 4;
              return (
                <Link href={`/users/${user._id}`} key={user._id}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="glass-card p-3 md:p-4 rounded-xl md:rounded-2xl border border-primary/5 shadow-md hover:scale-[1.005] transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 md:gap-5 min-w-0">
                        <div className="w-8 md:w-10 text-center font-black text-sm md:text-base text-muted-foreground">#{rank}</div>
                        <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-white shadow-lg">
                          <AvatarImage src={user.image} />
                          <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">{user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h3 className="font-black text-sm md:text-lg truncate uppercase">{user.name}</h3>
                          <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">{user.challengesCompleted || 0} challenge days · {user.correctAnswers || 0} correct</div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg md:text-2xl font-black text-primary tabular-nums">{(user.weeklyPoints || 0).toLocaleString()}</div>
                        <div className="text-[7px] md:text-[8px] font-black text-muted-foreground uppercase tracking-widest">Points</div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid gap-2 md:gap-3">
          {users.map((user, i) => {
            const style = getRankStyle(i);
            const RankIcon = style.icon;
            
            return (
              <Link href={`/users/${user._id}`} key={user._id}>
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`glass-card p-3 md:p-4 rounded-xl md:rounded-[1.5rem] border-2 transition-all hover:scale-[1.005] cursor-pointer ${i === 0 ? "border-amber-500/20 shadow-lg shadow-amber-500/5" : "border-primary/5 shadow-md"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 md:gap-6 min-w-0">
                      <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center font-black text-xs md:text-lg ${style.bg} ${style.color} ${style.border} border shadow-inner`}>
                        {RankIcon ? <RankIcon className="w-4 h-4 md:w-6 md:h-6" /> : i + 1}
                      </div>
                      
                      <div className="flex items-center gap-2 md:gap-4 min-w-0">
                        <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 md:border-[3px] border-white shadow-lg ring-1 ring-primary/5">
                          <AvatarImage src={user.image} />
                          <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">{user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h3 className="font-black text-sm md:text-xl text-foreground truncate uppercase">{user.name}</h3>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            {user.badges?.slice(0, 2).map((badge: string) => (
                              <span key={badge} className="px-1.5 py-0.5 bg-primary/5 text-primary text-[7px] md:text-[8px] font-black rounded-full border border-primary/10 uppercase tracking-tighter">
                                {badge}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg md:text-2xl font-black text-primary tracking-tighter tabular-nums leading-none">
                        {user.totalPoints.toLocaleString()}
                      </div>
                      <div className="text-[7px] md:text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">Points</div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
