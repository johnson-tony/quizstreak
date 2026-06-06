"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Star, Crown } from "lucide-react";
import { motion } from "framer-motion";

export default function RankingsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("allTime");

  useEffect(() => {
    fetchLeaderboard();
  }, [type]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?type=${type}`);
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load leaderboard");
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-grow max-w-4xl mx-auto px-4 py-8 md:py-12 w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
            <Trophy className="w-3 h-3" />
            Global Rankings
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight leading-none">Elite Leaderboard</h1>
          <p className="text-sm text-muted-foreground font-medium">The world&apos;s most consistent engineers.</p>
        </div>

        <Tabs defaultValue="allTime" className="w-full" onValueChange={setType}>
          <div className="flex justify-center mb-6">
            <TabsList className="bg-primary/5 border border-primary/10 p-1 rounded-xl h-11">
              <TabsTrigger value="weekly" className="rounded-lg px-6 text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="rounded-lg px-6 text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Monthly</TabsTrigger>
              <TabsTrigger value="allTime" className="rounded-lg px-6 text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">All Time</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={type} className="mt-0 space-y-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card p-4 rounded-xl border border-primary/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-6 w-6 rounded-md" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))
            ) : (
              users.map((user, i) => {
                const style = getRankStyle(i);
                const RankIcon = style.icon;
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={user._id} 
                    className={`group glass-card p-3 md:p-4 rounded-xl border transition-all duration-300 hover:shadow-md hover:shadow-primary/5 ${i < 3 ? `border-primary/20 bg-white` : "border-primary/5 bg-white/50"}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 md:gap-5 min-w-0">
                        <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center font-black text-xs md:text-sm ${style.bg} ${style.color} ${style.border} border`}>
                          {RankIcon ? <RankIcon className="w-4 h-4 md:w-5 md:h-5" /> : i + 1}
                        </div>
                        
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-9 w-9 md:h-11 md:w-11 border-2 border-white shadow-sm ring-1 ring-primary/5 flex-shrink-0">
                            <AvatarImage src={user.image} />
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm md:text-base text-foreground truncate group-hover:text-primary transition-colors">{user.name}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {user.badges.slice(0, 3).map((badge: string, j: number) => (
                                <div key={j} className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-primary/5 flex items-center justify-center" title={badge}>
                                  <Star className="w-2 md:w-2.5 h-2 md:h-2.5 text-primary fill-primary" />
                                </div>
                              ))}
                              {user.badges.length > 3 && (
                                <span className="text-[9px] font-black text-muted-foreground">+{user.badges.length - 3}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm md:text-lg font-black text-primary leading-none">{user.totalPoints}</div>
                        <div className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Points</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
