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
    </div>
  );
}
