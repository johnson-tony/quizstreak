"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Crown, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function PublicLeaderboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?type=allTime`);
      const data = await res.json();
      // Only show Top 3 for the public view
      setUsers(data.slice(0, 3));
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
      <Navbar />
      
      <main className="flex-grow max-w-4xl mx-auto px-4 py-12 md:py-20 w-full space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2">
            <Trophy className="w-3 h-3" />
            Season 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">World Class Talent</h1>
          <p className="text-base text-muted-foreground font-medium max-w-lg mx-auto">
            The Top 3 engineers globally. Join 10,000+ others and start your journey to the top.
          </p>
        </div>

        <div className="grid gap-4 max-w-2xl mx-auto">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-3xl" />
            ))
          ) : (
            users.map((user, i) => {
              const style = getRankStyle(i);
              const RankIcon = style.icon;
              
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={user._id} 
                  className={`p-5 md:p-6 rounded-[2rem] border-2 transition-all ${i === 0 ? "border-amber-500/20 bg-white shadow-xl shadow-amber-500/5 scale-105" : "border-primary/5 bg-white/50 shadow-lg"}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 md:gap-6 min-w-0">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${style.bg} ${style.color} ${style.border} border shadow-inner`}>
                        {RankIcon ? <RankIcon className="w-6 h-6" /> : i + 1}
                      </div>
                      
                      <div className="flex items-center gap-4 min-w-0">
                        <Avatar className="h-12 w-12 md:h-14 md:w-14 border-4 border-white shadow-xl ring-1 ring-primary/5">
                          <AvatarImage src={user.image} />
                          <AvatarFallback className="bg-primary/5 text-primary font-bold">{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h3 className="font-black text-lg md:text-xl text-foreground truncate">{user.name}</h3>
                          <div className="flex items-center gap-1.5 mt-1">
                             <div className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Elite Member</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl md:text-2xl font-black text-primary leading-none">{user.totalPoints}</div>
                      <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2">Global PTS</div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Restricted Area CTA */}
        <div className="max-w-2xl mx-auto pt-8">
           <Card className="rounded-[2.5rem] border-primary/5 bg-primary overflow-hidden shadow-2xl shadow-primary/20 relative">
             <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl -mr-24 -mt-24 rounded-full" />
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 blur-2xl -ml-16 -mb-16 rounded-full" />
             <CardContent className="p-10 text-center space-y-6 relative z-10">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto border border-white/20">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">Full Leaderboard Locked</h2>
                  <p className="text-primary-foreground/70 text-sm font-medium">
                    Log in with Google to view all 1,000+ ranked engineers and track your own progress.
                  </p>
                </div>
                <Button 
                  onClick={() => signIn("google")}
                  className="bg-white text-primary hover:bg-white/90 rounded-2xl h-14 px-10 font-black text-base shadow-xl shadow-black/10 transition-all active:scale-95"
                >
                  Join the Community
                </Button>
             </CardContent>
           </Card>
        </div>
      </main>
    </div>
  );
}
