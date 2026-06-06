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
  ArrowLeft
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
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <Skeleton className="h-12 w-48 rounded-xl" />
        <Skeleton className="h-[500px] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground hover:text-primary">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Console
            </Button>
          </Link>
          <h1 className="text-3xl font-black text-foreground tracking-tight">User Directory</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">Total {users.length} users enrolled.</p>
        </div>
      </div>

      {/* User Management Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 pl-10 pr-4 bg-white border border-primary/5 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all w-full sm:w-80 shadow-sm"
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-primary/5 bg-white">
              <Filter className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <Card className="rounded-[2rem] border-primary/5 shadow-2xl bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/[0.02] border-b border-primary/5">
                  <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Student Info</th>
                  <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Progress</th>
                  <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Points</th>
                  <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Enrolled</th>
                  <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {filteredUsers.map((user, i) => (
                  <tr key={user._id} className="hover:bg-primary/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-primary/5 transition-transform group-hover:scale-110">
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
                        <span className="text-xs font-black">{user.currentStreak}d / Set {user.currentSet || 1}</span>
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
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="max-w-xs mx-auto space-y-2">
                        <Users className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-sm font-bold text-foreground">No students found</p>
                        <p className="text-xs text-muted-foreground">We couldn&apos;t find any users matching &quot;{searchTerm}&quot;</p>
                      </div>
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
