"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Users, 
  Search, 
  Filter,
  Zap,
  ChevronRight,
  ArrowLeft,
  Crown
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.error) toast.error(data.error);
      else setUsers(data);
    } catch (error) {
      toast.error("Failed to load users");
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
      <div className="p-2 md:p-6 space-y-4 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-32 rounded-lg" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm" className="mb-0.5 -ml-2 text-muted-foreground hover:text-primary h-7 text-[9px] md:text-xs">
              <ArrowLeft className="w-3 h-3 mr-1.5" /> Back
            </Button>
          </Link>
          <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight uppercase">User Directory</h1>
          <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">{users.length} enrolled users</p>
        </div>
      </div>

      {/* User Management Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-8 pr-3 bg-white border border-primary/5 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all w-full md:w-80 shadow-sm"
            />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-primary/5 bg-white shrink-0">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </div>

        <Card className="rounded-xl md:rounded-2xl border-primary/5 shadow-md bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-primary/[0.02] border-b border-primary/5">
                  <th className="px-3 md:px-5 py-3 md:py-4 text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest">Student Info</th>
                  <th className="px-3 md:px-5 py-3 md:py-4 text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">Progress</th>
                  <th className="px-3 md:px-5 py-3 md:py-4 text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">Points</th>
                  <th className="px-3 md:px-5 py-3 md:py-4 text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Joined</th>
                  <th className="px-3 md:px-5 py-3 md:py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {filteredUsers.map((user, i) => (
                  <tr key={user._id} className="hover:bg-primary/[0.01] transition-colors group">
                    <td className="px-3 md:px-5 py-2.5 md:py-3.5">
                      <div className="flex items-center gap-2 md:gap-3">
                        <Avatar className="h-8 w-8 md:h-9 md:w-9 border border-white shadow-sm ring-1 ring-primary/5">
                          <AvatarImage src={user.image} />
                          <AvatarFallback className="bg-primary/5 text-primary text-[9px] font-bold">{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-[11px] md:text-sm font-bold text-foreground truncate">{user.name}</p>
                            {user.isSubscribed && (
                              <Crown className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                            )}
                          </div>
                          <p className="text-[9px] md:text-[10px] text-muted-foreground font-medium truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 md:px-5 py-2.5 md:py-3.5 text-center">
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-600">
                        <Zap className="w-2 h-2.5 fill-orange-600" />
                        <span className="text-[9px] md:text-[11px] font-black">{user.currentStreak}d / S{user.currentSet || 1}</span>
                      </div>
                    </td>
                    <td className="px-3 md:px-5 py-2.5 md:py-3.5 text-center">
                      <div className="text-[11px] md:text-sm font-black text-foreground tabular-nums">{user.totalPoints.toLocaleString()}</div>
                    </td>
                    <td className="px-3 md:px-5 py-2.5 md:py-3.5 text-right">
                      <div className="text-[9px] md:text-[11px] font-bold text-muted-foreground uppercase">
                        {new Date(user.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-3 md:px-5 py-2.5 md:py-3.5 text-right">
                      <Link href={`/admin/users/${user._id}`}>
                        <Button variant="ghost" size="sm" className="rounded-lg font-bold text-[8px] md:text-[9px] text-primary hover:bg-primary/5 h-7 px-2">
                          STATS <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
