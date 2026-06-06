"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  ChevronLeft, 
  Calendar, 
  Trophy, 
  Zap, 
  CheckCircle2, 
  XCircle,
  Mail,
  History
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      const userData = await res.json();
      if (userData.error) toast.error(userData.error);
      else setData(userData);
    } catch (error) {
      toast.error("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8 max-w-5xl mx-auto">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  const user = data?.user;
  const attempts = data?.attempts || [];

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link href="/admin/dashboard">
        <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-primary group">
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Directory
        </Button>
      </Link>

      {/* User Profile Header */}
      <section className="glass-card p-6 md:p-8 rounded-3xl border-primary/5 shadow-xl bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.02] blur-3xl -mr-32 -mt-32 rounded-full" />
        
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start relative z-10">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white shadow-xl ring-1 ring-primary/5">
            <AvatarImage src={user?.image} />
            <AvatarFallback className="bg-primary/5 text-primary text-3xl font-black">{user?.name[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex-grow text-center md:text-left space-y-2">
            <h1 className="text-3xl font-black text-foreground tracking-tight">{user?.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium italic text-primary/60">Joined {new Date(user?.joinedAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
              <div className="px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Total Points</p>
                <p className="text-xl font-black text-foreground">{user?.totalPoints.toLocaleString()}</p>
              </div>
              <div className="px-4 py-2 bg-orange-500/5 rounded-xl border border-orange-500/10">
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Current Streak</p>
                <p className="text-xl font-black text-foreground">{user?.currentStreak} Days</p>
              </div>
              <div className="px-4 py-2 bg-amber-500/5 rounded-xl border border-amber-500/10">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Best Streak</p>
                <p className="text-xl font-black text-foreground">{user?.longestStreak} Days</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Log */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Attempt History
        </h2>

        <div className="grid gap-3">
          {attempts.map((attempt: any, i: number) => (
            <motion.div 
              key={attempt._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="rounded-2xl border-primary/5 shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${attempt.correct ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"}`}>
                      {attempt.correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground">Question {attempt.questionId}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                        {new Date(attempt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden sm:block text-right">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Answer</p>
                      <p className="text-sm font-bold text-primary">{attempt.selectedAnswer}</p>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Awarded</p>
                      <p className={`text-sm font-black ${attempt.pointsEarned > 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                        +{attempt.pointsEarned} PTS
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {attempts.length === 0 && (
            <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-primary/10">
              <p className="text-muted-foreground font-medium italic">This user hasn&apos;t started their journey yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
