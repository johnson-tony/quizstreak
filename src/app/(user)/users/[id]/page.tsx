"use client";

import { useState, useEffect, use } from "react";
import StatsSection from "@/components/features/StatsSection";
import BadgesSection from "@/components/features/BadgesSection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, TrendingUp, Calendar, Trophy, ChevronLeft, Code2, Database, Cloud, Terminal, MessageSquare, Target as TargetIcon, BrainCircuit, Award, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const CATEGORY_MAP: Record<string, { icon: any, color: string, bg: string }> = {
  'JavaScript': { icon: Code2, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  'SQL': { icon: Database, color: 'text-blue-600', bg: 'bg-blue-50' },
  'AWS': { icon: Cloud, color: 'text-orange-600', bg: 'bg-orange-50' },
  'Python': { icon: Terminal, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'Data Science': { icon: BarChart3, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  'Digital Marketing': { icon: Megaphone, color: 'text-pink-600', bg: 'bg-pink-50' },
  'Product Management': { icon: ClipboardList, color: 'text-violet-600', bg: 'bg-violet-50' },
  'Communication': { icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  'Interviews': { icon: TargetIcon, color: 'text-rose-600', bg: 'bg-rose-50' },
  'Aptitude': { icon: BrainCircuit, color: 'text-purple-600', bg: 'bg-purple-50' },
  'Leadership': { icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
};

interface UserProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/users/${id}`);
      const profileData = await res.json();
      setData(profileData);
    } catch (error) {
      console.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-48 w-full rounded-[2.5rem]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2 rounded-[2rem]" />
          <Skeleton className="h-64 rounded-[2rem]" />
        </div>
      </div>
    );
  }

  if (!data || !data.user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-black text-foreground">User Not Found</h1>
        <Link href="/rankings">
          <Button variant="outline" className="rounded-xl font-bold">
            Back to Rankings
          </Button>
        </Link>
      </div>
    );
  }

  const { user, stats } = data;

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-4 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link href="/rankings">
        <Button variant="ghost" size="sm" className="rounded-lg font-bold text-muted-foreground hover:text-foreground group text-xs">
          <ChevronLeft className="w-3 h-3 mr-1 transition-transform group-hover:-translate-x-1" />
          Back to Rankings
        </Button>
      </Link>

      <section className="relative overflow-hidden glass-card p-4 md:p-8 rounded-2xl md:rounded-[2rem] border-primary/5 shadow-xl bg-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.03] blur-3xl -mr-32 -mt-32 rounded-full" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8 relative z-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Avatar className="h-20 w-20 md:h-28 md:w-28 border-4 border-white shadow-xl relative z-10 ring-1 ring-primary/5">
              <AvatarImage src={user.image} />
              <AvatarFallback className="bg-primary/5 text-primary text-2xl md:text-4xl font-black">
                {user.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-primary text-white w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg border-2 border-white z-20">
              <Trophy className="w-3.5 h-3.5 md:w-5 md:h-5 fill-white" />
            </div>
          </div>

          <div className="flex-grow text-center md:text-left space-y-3">
            <div className="space-y-0.5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary/5 rounded-full border border-primary/10 text-primary text-[9px] md:text-xs font-black uppercase tracking-widest mb-1">
                <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                Ranked #{user.rank}
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-foreground tracking-tight leading-tight uppercase">
                {user.name}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground font-bold text-xs md:text-xs">
                <Calendar className="w-3 h-3" />
                Joined {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <div className="bg-orange-500/[0.03] border border-orange-500/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-600 fill-orange-600" />
                <div>
                  <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Streak</div>
                  <div className="text-sm md:text-base font-black text-foreground">{user.currentStreak}d</div>
                </div>
              </div>
              <div className="bg-primary/[0.03] border border-primary/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Points</div>
                  <div className="text-sm md:text-base font-black text-foreground">{user.totalPoints.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="glass-card p-4 md:p-6 rounded-2xl md:rounded-[2rem] border-primary/5 shadow-lg bg-white">
            <h2 className="text-[10px] md:text-xs font-black text-foreground mb-4 flex items-center gap-2 uppercase tracking-widest">
              <TrendingUp className="w-4 h-4 text-primary" />
              Performance Stats
            </h2>
            <StatsSection stats={{
              totalPoints: user.totalPoints,
              accuracy: stats.accuracy,
              totalSolved: stats.totalSolved,
              currentStreak: user.currentStreak,
              longestStreak: user.longestStreak,
            }} />
          </div>

          {/* Category Mastery Section */}
          <div className="glass-card p-4 md:p-6 rounded-2xl md:rounded-[2rem] border-primary/5 shadow-lg bg-white">
            <h2 className="text-[10px] md:text-xs font-black text-foreground mb-4 flex items-center gap-2 uppercase tracking-widest">
              <BookOpen className="w-4 h-4 text-primary" />
              Skill Mastery
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats.categoryStats && stats.categoryStats.length > 0 ? (
                stats.categoryStats.map((cat: any) => {
                  const config = CATEGORY_MAP[cat.name] || { icon: BookOpen, color: 'text-slate-600', bg: 'bg-slate-50' };
                  const mastery = Math.round((cat.solved / (cat.total || 1)) * 100);
                  
                  return (
                    <motion.div 
                      key={cat.name}
                      whileHover={{ y: -2 }}
                      className="p-4 rounded-2xl border border-primary/5 bg-slate-50/30 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                            <config.icon className={`w-4 h-4 ${config.color}`} />
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-tight text-foreground">{cat.name}</h4>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{cat.points} XP Earned</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-primary">{mastery}%</div>
                          <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Accuracy</div>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                          <span>{cat.solved} Solved</span>
                          <span>{cat.total} Total</span>
                        </div>
                        <Progress value={mastery} className="h-1.5 bg-white border border-primary/5" />
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full py-12 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-slate-300" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-foreground uppercase tracking-tight">Begin Your Journey</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                      Complete practice sessions to see your skill mastery here. If you need more challenges, contact our admin.
                    </p>
                  </div>
                  <Link href="/contact">
                    <Button variant="outline" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest border-primary/10 hover:bg-primary/5 hover:text-primary transition-all">
                      Contact Admin
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:block">
            <BadgesSection userBadges={user.badges} />
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="lg:hidden">
            <BadgesSection userBadges={user.badges} />
          </div>
          
          <Card className="rounded-2xl md:rounded-[2rem] border-primary/5 bg-primary overflow-hidden shadow-xl shadow-primary/10 group">
             <CardContent className="p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl -mr-12 -mt-12 rounded-full" />
                <div className="relative z-10">
                  <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-white/60 mb-2">Expert Analysis</h3>
                  <p className="text-sm md:text-base font-bold leading-tight">
                    Expertly handled {stats.totalAttempts} technical challenges with {stats.accuracy}% accuracy.
                  </p>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
