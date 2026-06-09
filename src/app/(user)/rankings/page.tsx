"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function RankingsPage() {
  const [users, setUsers] = useState<any[]>([]);
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
      setUsers(data);
    } catch (error) {
      console.error("Failed to load rankings");
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

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-4 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-foreground tracking-tight uppercase">Global Rankings</h1>
          <p className="text-muted-foreground font-medium text-[10px] md:text-xs">Top performing experts in Software Engineering.</p>
        </div>
        
        <Tabs value={timeRange} onValueChange={setTimeRange} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-2 w-full md:w-[180px] bg-primary/5 p-0.5 rounded-lg">
            <TabsTrigger value="allTime" className="rounded-md font-bold text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-xs">All Time</TabsTrigger>
            <TabsTrigger value="weekly" className="rounded-md font-bold text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-xs">Weekly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

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
                        <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">{user.name[0]}</AvatarFallback>
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
    </div>
  );
}
