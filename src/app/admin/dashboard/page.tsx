"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Users, 
  BarChart3, 
  Activity, 
  UserPlus, 
  TrendingUp, 
  Zap,
  ChevronRight,
  Search,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchSearchTerm] = useState("");

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users"),
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();

      if (statsData.error) toast.error(statsData.error);
      else setStats(statsData);

      if (usersData.error) toast.error(usersData.error);
      else setUsers(usersData);
    } catch (error) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[500px] rounded-2xl" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-500/10" },
    { label: "Daily Attempts", value: stats?.totalAttempts, icon: Activity, color: "text-primary", bg: "bg-primary/10" },
    { label: "Success Rate", value: `${stats?.successRate}%`, icon: Zap, color: "text-amber-600", bg: "bg-amber-500/10" },
    { label: "New (7d)", value: `+${stats?.newUsersLastWeek}`, icon: UserPlus, color: "text-emerald-600", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">System Overview</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">Platform analytics and user management.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-xl border border-primary/10">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">{stats?.activeToday} Users active today</span>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
          >
            <Card className="rounded-2xl border-primary/5 shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden hover:shadow-md transition-shadow group">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-foreground leading-none">{stat.value}</div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* User Management Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            User Directory
            <span className="px-2 py-0.5 bg-muted rounded text-xs font-bold text-muted-foreground">{filteredUsers.length}</span>
          </h2>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search name or email..."
                value={searchTerm}
                onChange={(e) => setSearchSearchTerm(e.target.value)}
                className="h-10 pl-10 pr-4 bg-white border border-primary/5 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all w-full sm:w-64"
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-primary/5">
              <Filter className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <Card className="rounded-2xl border-primary/5 shadow-xl bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/[0.02] border-b border-primary/5">
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">User Details</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Streak</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Points</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Joined</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {filteredUsers.map((user, i) => (
                  <tr key={user._id} className="hover:bg-primary/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-primary/5">
                          <AvatarImage src={user.image} />
                          <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{user.name}</p>
                          <p className="text-[10px] text-muted-foreground font-medium truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-600">
                        <Zap className="w-3 h-3 fill-orange-600" />
                        <span className="text-xs font-black">{user.currentStreak}d</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-black text-foreground">{user.totalPoints.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-xs font-bold text-muted-foreground">
                        {new Date(user.joinedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/users/${user._id}`}>
                        <Button variant="ghost" size="sm" className="rounded-lg font-bold text-[10px] text-primary hover:bg-primary/5">
                          VIEW STATS <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <p className="text-sm text-muted-foreground font-medium italic">No users found matching your search.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
