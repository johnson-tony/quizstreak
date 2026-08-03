"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Trash2, ArrowLeft, UserCheck, Loader2, Zap } from "lucide-react";
import Link from "next/link";

export default function AdminDeletedUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users?status=deleted");
      const data = await res.json();
      if (data.error) toast.error(data.error);
      else setUsers(data);
    } catch (error) {
      toast.error("Failed to load trashed users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const restoreUser = async (id: string) => {
    setRestoringId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      const result = await res.json();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User restored to the directory");
        fetchUsers();
      }
    } catch (error) {
      toast.error("Failed to restore user");
    } finally {
      setRestoringId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-2 md:p-6 space-y-4 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm" className="mb-0.5 -ml-2 text-muted-foreground hover:text-primary h-7 text-[9px] md:text-xs">
              <ArrowLeft className="w-3 h-3 mr-1.5" /> Back
            </Button>
          </Link>
          <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight uppercase flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" /> User Trash
          </h1>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            {users.length} deleted {users.length === 1 ? "user" : "users"} — hidden from all user lists
          </p>
        </div>
        <Link href="/admin/users">
          <Button variant="outline" size="sm" className="rounded-lg font-bold text-[9px] md:text-xs uppercase tracking-widest border-primary/10 h-8">
            View Directory
          </Button>
        </Link>
      </div>

      <Card className="rounded-xl md:rounded-2xl border-primary/5 shadow-md bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-destructive/[0.02] border-b border-destructive/10">
                <th className="px-3 md:px-5 py-3 md:py-4 text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest">Student Info</th>
                <th className="px-3 md:px-5 py-3 md:py-4 text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">Streak</th>
                <th className="px-3 md:px-5 py-3 md:py-4 text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">Points</th>
                <th className="px-3 md:px-5 py-3 md:py-4 text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Joined</th>
                <th className="px-3 md:px-5 py-3 md:py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-primary/[0.01] transition-colors group">
                  <td className="px-3 md:px-5 py-2.5 md:py-3.5">
                    <div className="flex items-center gap-2 md:gap-3">
                      <Avatar className="h-8 w-8 md:h-9 md:w-9 border border-white shadow-sm ring-1 ring-destructive/10">
                        <AvatarImage src={user.image} />
                        <AvatarFallback className="bg-destructive/5 text-destructive text-[9px] font-bold">{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-[11px] md:text-sm font-bold text-foreground truncate">{user.name}</p>
                        <p className="text-[9px] md:text-xs text-muted-foreground font-medium truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 md:px-5 py-2.5 md:py-3.5 text-center">
                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-600">
                      <Zap className="w-2 h-2.5 fill-orange-600" />
                      <span className="text-[9px] md:text-[11px] font-black">{user.currentStreak}d</span>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => restoreUser(user._id)}
                      disabled={restoringId === user._id}
                      className="rounded-lg font-bold text-[8px] md:text-[9px] text-emerald-600 hover:bg-emerald-50 border-emerald-200 h-7 px-2 gap-1"
                    >
                      {restoringId === user._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                      Restore
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <CardContent className="py-16 text-center">
            <Trash2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-xs md:text-sm text-muted-foreground font-bold uppercase tracking-widest">Trash is empty</p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Deleted users will appear here.</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}