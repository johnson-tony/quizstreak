"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Users, 
  BookOpen, 
  Activity, 
  TrendingUp, 
  Zap,
  Sparkles,
  ArrowUpRight,
  UserCheck
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.error) toast.error(data.error);
      else setStats(data);
    } catch (error) {
      toast.error("Failed to load platform stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
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
    <div className="p-3 sm:p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      {/* Mini Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
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
                  <CardContent className="p-3 md:p-5 flex items-center justify-between">
                    <div>
                      <p className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 md:mb-1">{stat.label}</p>
                      <p className="text-lg md:text-2xl font-black text-foreground leading-none">{stat.value?.toLocaleString()}</p>
                    </div>
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 ml-2`}>
                      <stat.icon className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <Card className="rounded-xl md:rounded-2xl border-primary/5 shadow-sm bg-white">
                <CardContent className="p-3 md:p-5 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 md:mb-1">{stat.label}</p>
                    <p className="text-lg md:text-2xl font-black text-foreground leading-none">{stat.value?.toLocaleString()}</p>
                  </div>
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0 ml-2`}>
                    <stat.icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Navigation Section: Users */}
        <Link href="/admin/users">
          <motion.div whileHover={{ y: -3 }} className="group h-full">
            <Card className="rounded-2xl md:rounded-3xl border-primary/5 shadow-xl bg-white overflow-hidden h-full border-l-4 border-l-blue-600 transition-all hover:shadow-blue-600/5">
              <CardContent className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <Users className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-blue-600 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <h3 className="text-lg md:text-xl font-black text-foreground mb-1.5 md:mb-2">User Management</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Monitor student progress, track streaks, and view detailed attempt histories for all registered users.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </Link>

        {/* Navigation Section: Curriculum */}
        <Link href="/admin/questions">
          <motion.div whileHover={{ y: -3 }} className="group h-full">
            <Card className="rounded-2xl md:rounded-3xl border-primary/5 shadow-xl bg-white overflow-hidden h-full border-l-4 border-l-primary transition-all hover:shadow-primary/5">
              <CardContent className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                    <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <h3 className="text-lg md:text-xl font-black text-foreground mb-1.5 md:mb-2">Curriculum Architect</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Generate new challenge sets with Gemini AI, manage existing questions, and monitor curriculum set capacity.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </Link>
      </div>

      {/* System Health Section */}
      <div className="bg-primary/5 rounded-2xl md:rounded-[2.5rem] p-5 md:p-10 border border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -mr-32 -mt-32 rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white rounded-full border border-primary/10 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-primary">System Online</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight px-1">Performance is Nominal</h2>
            <p className="text-[11px] md:text-sm text-muted-foreground max-w-lg px-2">
              The AI generation engine and Google Sheets database are fully synchronized. User engagement has increased by <span className="text-primary font-bold">12%</span> this week.
            </p>
          </div>
          <div className="flex gap-4 md:gap-8">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black text-primary leading-none">+{stats?.newUsersLastWeek}</div>
              <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">New Users (7d)</p>
            </div>
            <div className="w-[1px] h-8 md:h-10 bg-primary/10" />
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black text-primary leading-none">{stats?.successRate}%</div>
              <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Avg Accuracy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
