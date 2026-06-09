"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  ChevronLeft, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  Mail,
  History,
  CreditCard,
  Crown,
  Loader2,
  Trash2,
  Ban,
  UserCheck
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const updateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (result.error) {
        toast.error(result.error);
      } else {
        setData((prev: any) => ({ ...prev, user: result.user }));
        toast.success(`User marked as ${newStatus}`);
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteUser = async () => {
    if (!confirm("Are you sure you want to delete this user? They will be marked as 'deleted' and won't be able to sign in.")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User marked as deleted");
        router.push("/admin/users");
      }
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSubscription = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${id}/subscribe`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSubscribed: !user?.isSubscribed }),
      });
      const updatedUser = await res.json();
      if (updatedUser.error) {
        toast.error(updatedUser.error);
      } else {
        setData((prev: any) => ({ ...prev, user: updatedUser }));
        toast.success(`User ${updatedUser.isSubscribed ? 'subscribed' : 'unsubscribed'}`);
      }
    } catch (error) {
      toast.error("Failed to update subscription");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const user = data?.user;
  const attempts = data?.attempts || [];

  return (
    <div className="p-2 md:p-6 space-y-4 md:space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary group h-8 px-2 text-[10px] md:text-xs">
            <ChevronLeft className="w-3.5 h-3.5 mr-1 group-hover:-translate-x-1 transition-transform" /> Directory
          </Button>
        </Link>
        
        <div className="flex flex-wrap items-center gap-2">
          {user?.status !== 'deleted' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateStatus(user?.status === 'suspended' ? 'active' : 'suspended')}
                disabled={isUpdating}
                className="rounded-lg font-bold gap-1.5 text-[9px] md:text-[10px] uppercase tracking-widest border-primary/10 h-8"
              >
                {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : user?.status === 'suspended' ? <UserCheck className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                {user?.status === 'suspended' ? 'Activate' : 'Suspend'}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteUser}
                disabled={isDeleting}
                className="rounded-lg font-bold gap-1.5 text-[9px] md:text-[10px] uppercase tracking-widest shadow-sm h-8"
              >
                {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Delete
              </Button>
            </>
          )}

          <Button 
            variant={user?.isSubscribed ? "default" : "outline"}
            size="sm"
            onClick={toggleSubscription}
            disabled={isUpdating}
            className={`rounded-lg font-bold gap-1.5 transition-all h-8 text-[9px] md:text-[10px] uppercase tracking-widest ${user?.isSubscribed ? 'bg-amber-500 hover:bg-amber-600 shadow-sm' : 'border-amber-200 text-amber-700 hover:bg-amber-50'}`}
          >
            {isUpdating ? <Loader2 className="w-3.h-3 animate-spin" /> : user?.isSubscribed ? <Crown className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
            {user?.isSubscribed ? "PRO MEMBER" : "FREE USER"}
          </Button>
        </div>
      </div>

      {/* User Profile Header */}
      <section className="glass-card p-4 md:p-6 rounded-2xl border-primary/5 shadow-md bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.02] blur-3xl -mr-16 -mt-16 rounded-full" />
        
        <div className="flex flex-col md:flex-row gap-4 items-center md:items-start relative z-10">
          <Avatar className="h-20 w-20 md:h-24 md:w-24 border-2 border-white shadow-md ring-1 ring-primary/5">
            <AvatarImage src={user?.image} />
            <AvatarFallback className="bg-primary/5 text-primary text-xl font-black">{user?.name[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex-grow text-center md:text-left space-y-1.5">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-2">
              <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight uppercase">{user?.name}</h1>
              {user?.status !== 'active' && (
                <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${user?.status === 'suspended' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-destructive/5 text-destructive border-destructive/20'}`}>
                  {user?.status}
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                <Mail className="w-3 h-3" /> {user?.email}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium italic text-primary/60">
                <Calendar className="w-3 h-3" /> Joined {new Date(user?.joinedAt).toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
              <div className="px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-[8px] font-black text-primary uppercase tracking-widest">Points</p>
                <p className="text-sm md:text-base font-black text-foreground">{user?.totalPoints.toLocaleString()}</p>
              </div>
              <div className="px-3 py-1.5 bg-orange-500/5 rounded-lg border border-orange-500/10">
                <p className="text-[8px] font-black text-orange-600 uppercase tracking-widest">Streak</p>
                <p className="text-sm md:text-base font-black text-foreground">{user?.currentStreak}d</p>
              </div>
              <div className="px-3 py-1.5 bg-amber-500/5 rounded-lg border border-amber-500/10">
                <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Best</p>
                <p className="text-sm md:text-base font-black text-foreground">{user?.longestStreak}d</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Log */}
      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-black text-foreground tracking-tight flex items-center gap-2 uppercase">
          <History className="w-4 h-4 text-primary" />
          Attempt History
        </h2>

        <div className="grid gap-2">
          {attempts.map((attempt: any, i: number) => (
            <motion.div 
              key={attempt._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="rounded-xl border-primary/5 shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${attempt.correct ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"}`}>
                      {attempt.correct ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-bold text-foreground">Q{attempt.questionId}</p>
                      <p className="text-[8px] md:text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                        {new Date(attempt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block text-right">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Answer</p>
                      <p className="text-xs font-bold text-primary">{attempt.selectedAnswer}</p>
                    </div>
                    <div className="text-right min-w-[60px]">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Awarded</p>
                      <p className={`text-xs font-black ${attempt.pointsEarned > 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                        +{attempt.pointsEarned}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {attempts.length === 0 && (
            <div className="text-center py-12 bg-muted/10 rounded-2xl border border-dashed border-primary/5">
              <p className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-widest">No activity yet</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
