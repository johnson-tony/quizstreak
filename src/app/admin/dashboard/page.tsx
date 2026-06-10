"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Zap,
  Sparkles,
  UserCheck,
  Library,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface AdminStats {
  totalUsers: number;
  totalAttempts: number;
  successRate: number;
  activeToday: number;
  newUsersLastWeek: number;
  totalQuestions: number;
  categoryCounts: Record<string, number>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.error) toast.error(data.error);
      else setStats(data);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to load platform stats";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="p-2 md:p-6 space-y-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  const smallStats = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-500/10", href: "/admin/users" },
    { label: "Total Attempts", value: stats?.totalAttempts, icon: Activity, color: "text-primary", bg: "bg-primary/10", href: "/admin/questions" },
    { label: "Success Rate", value: `${stats?.successRate}%`, icon: Zap, color: "text-amber-600", bg: "bg-amber-500/10" },
    { label: "Active Today", value: stats?.activeToday, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 mx-auto animate-in fade-in duration-700">
      {/* Mini Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {smallStats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
          >
            {stat.href ? (
              <Link href={stat.href}>
                <Card className="rounded-xl md:rounded-2xl border-primary/5 shadow-sm bg-white hover:shadow-md hover:border-primary/10 transition-all cursor-pointer group">
                  <CardContent className="p-2.5 md:p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[7px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">{stat.label}</p>
                      <p className="text-base md:text-xl font-black text-foreground leading-none">{stat.value?.toLocaleString()}</p>
                    </div>
                    <div className={`w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0 ml-1.5`}>
                      <stat.icon className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <Card className="rounded-xl md:rounded-2xl border-primary/5 shadow-sm bg-white">
                <CardContent className="p-2.5 md:p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[7px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">{stat.label}</p>
                    <p className="text-base md:text-xl font-black text-foreground leading-none">{stat.value?.toLocaleString()}</p>
                  </div>
                  <div className={`w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0 ml-1.5`}>
                    <stat.icon className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ))}
      </div>

      {/* System Health Section */}
      <div className="bg-primary/5 rounded-xl md:rounded-3xl p-4 md:p-8 border border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl -mr-24 -mt-24 rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
          <div className="text-center md:text-left space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white rounded-full border border-primary/10 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-widest text-primary">System Online</span>
            </div>
            <h2 className="text-lg md:text-xl font-black text-foreground tracking-tight">Nominal State</h2>
            <p className="text-xs md:text-xs text-muted-foreground max-w-lg leading-relaxed">
              Sync complete. Engine operational. engagement is up <span className="text-primary font-bold">12%</span>.
            </p>
          </div>
          <div className="flex gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-black text-primary leading-none">+{stats?.newUsersLastWeek}</div>
              <p className="text-[7px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Growth</p>
            </div>
            <div className="w-[1px] h-6 md:h-8 bg-primary/10" />
            <div className="text-center">
              <div className="text-xl md:text-2xl font-black text-primary leading-none">{stats?.successRate}%</div>
              <p className="text-[7px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Accuracy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="rounded-xl md:rounded-3xl border-primary/5 shadow-sm bg-white overflow-hidden lg:col-span-2">
          <div className="p-4 md:p-6 border-b border-primary/5 bg-primary/[0.01] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Library className="w-4 h-4 text-primary" />
              <h3 className="text-sm md:text-base font-black text-foreground uppercase tracking-tight">Curriculum Health</h3>
            </div>
            <Link href="/admin/questions">
               <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5">
                 Manage Bank <ChevronRight className="w-3 h-3 ml-1" />
               </Button>
            </Link>
          </div>
          <CardContent className="p-4 md:p-6">
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {stats && Object.entries(stats.categoryCounts).sort((a: [string, number], b: [string, number]) => b[1] - a[1]).map(([cat, count]: [string, number]) => (
                  <div key={cat} className="p-3 rounded-xl bg-muted/30 border border-primary/5 flex items-center justify-between group hover:border-primary/20 transition-all">
                    <div>
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">{cat}</p>
                      <p className="text-sm font-black text-foreground">{count} <span className="text-[10px] text-muted-foreground/60 font-medium">Items</span></p>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl md:rounded-3xl border-primary/5 shadow-sm bg-primary overflow-hidden text-white group">
          <CardContent className="p-6 md:p-8 flex flex-col h-full relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
             
             <div className="relative z-10 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                   <h3 className="text-lg md:text-xl font-black uppercase tracking-tight">AI Architect</h3>
                   <p className="text-xs text-white/70 font-medium leading-relaxed mt-1">Generate 15-20 fresh professional challenges in seconds.</p>
                </div>
                <Link href="/admin/questions" className="block pt-2">
                  <Button className="w-full bg-white text-primary hover:bg-white/90 rounded-xl font-black uppercase tracking-widest text-[10px] h-10 shadow-lg">
                    Open Architect
                  </Button>
                </Link>
             </div>
             
             <div className="mt-auto pt-8 flex items-end justify-between relative z-10">
                <div>
                   <div className="text-3xl font-black leading-none">{stats?.totalQuestions}</div>
                   <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Total Bank Size</p>
                </div>
                <TrendingUp className="w-8 h-8 opacity-20" />
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
