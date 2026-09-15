"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Users,
  Flame,
  Sparkles,
  ArrowRight,
  Plus,
  Search,
  IndianRupee,
  HelpCircle,
  Clock,
  CheckCircle2,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import CreatePoolModal from "@/components/features/CreatePoolModal";

export default function PoolsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [weekendTournaments, setWeekendTournaments] = useState<any[]>([]);
  const [openDuels, setOpenDuels] = useState<any[]>([]);
  const [myPools, setMyPools] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [searchingCode, setSearchingCode] = useState(false);

  const isAdmin = (session?.user as any)?.role === "admin";

  useEffect(() => {
    fetchPools();
  }, []);

  const fetchPools = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pools");
      const data = await res.json();
      if (data.weekendTournaments) setWeekendTournaments(data.weekendTournaments);
      if (data.openDuels) setOpenDuels(data.openDuels);
      if (data.myPools) setMyPools(data.myPools);
    } catch {
      toast.error("Failed to load quiz pools");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;

    setSearchingCode(true);
    try {
      const res = await fetch(`/api/pools?code=${encodeURIComponent(inviteCodeInput.trim())}`);
      const data = await res.json();
      if (data.poolId) {
        router.push(`/pools/${data.poolId}`);
      } else {
        toast.error("Invalid invite code. Please check and try again.");
      }
    } catch {
      toast.error("Error finding pool with that code.");
    } finally {
      setSearchingCode(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <main className="flex-grow mx-auto px-4 md:px-6 py-6 w-full max-w-6xl space-y-6 animate-in fade-in duration-500">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-primary/95 to-purple-950 p-6 md:p-10 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest text-white">
                <Trophy className="w-3 h-3 text-amber-400" />
                Real Stakes • Weekly Tournaments
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight uppercase leading-tight">
                Quiz Pools & Friend Duels
              </h1>
              <p className="text-white/80 text-xs md:text-sm font-medium leading-relaxed">
                Compete in official weekend 30-question arenas or create custom challenges with friends. Put your skills to the test and win the prize pool!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest bg-white text-primary hover:bg-white/90 shadow-lg gap-2"
              >
                <Plus className="w-4 h-4" /> Create Custom Duel
              </Button>
            </div>
          </div>

          {/* Quick Invite Code Finder */}
          <div className="mt-6 pt-6 border-t border-white/15 max-w-md">
            <form onSubmit={handleJoinByCode} className="flex gap-2">
              <input
                type="text"
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                placeholder="Have an Invite Code? e.g. QZ-8K21"
                className="flex-grow h-10 bg-white/10 border border-white/20 rounded-xl px-3 text-xs font-mono font-bold text-white placeholder:text-white/50 focus:bg-white/20 focus:outline-none"
              />
              <Button
                type="submit"
                disabled={searchingCode || !inviteCodeInput.trim()}
                className="h-10 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider"
              >
                <Search className="w-3.5 h-3.5 mr-1" /> Join
              </Button>
            </form>
          </div>
        </section>

        {/* My Active Enrolled Pools */}
        {myPools.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black uppercase tracking-widest text-foreground flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" /> My Active Pools
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {myPools.map((pool: any) => (
                <Link key={pool._id} href={`/pools/${pool._id}`}>
                  <Card className="rounded-2xl border-primary/10 shadow-xs hover:shadow-md transition-all group bg-white overflow-hidden">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-primary/5 text-primary text-[9px] font-black uppercase">
                          {pool.category}
                        </Badge>
                        <span className="text-[10px] font-mono font-bold text-muted-foreground">
                          {pool.inviteCode}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                          {pool.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground font-medium">
                          {pool.myQuizStatus === "completed" ? (
                            <span className="text-emerald-600 font-bold">Completed • Score: {pool.myScore}</span>
                          ) : (
                            <span className="text-amber-600 font-bold">Ready to Play</span>
                          )}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Official Weekend Tournaments Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-sm md:text-base font-black uppercase tracking-tight text-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" /> Weekend Arena Tournaments
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Official 30-Question Challenges with Big Prize Pools
              </p>
            </div>
          </div>

          {weekendTournaments.length === 0 ? (
            <Card className="rounded-2xl p-6 text-center bg-white border-primary/5 shadow-xs">
              <p className="text-xs font-bold text-muted-foreground">
                Next Weekend Arena opens on Friday 6:00 PM! In the meantime, you can create a Custom Duel with friends below.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weekendTournaments.map((pool: any) => (
                <Link key={pool._id} href={`/pools/${pool._id}`}>
                  <Card className="rounded-2xl border-primary/10 shadow-xs hover:shadow-lg transition-all group bg-white overflow-hidden relative">
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-purple-100 text-purple-900 border-purple-200 text-[9px] font-black uppercase">
                          30 Questions
                        </Badge>
                        <span className="text-xs font-black text-emerald-600">
                          Prize: ₹{pool.totalPrizePool}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                          {pool.title}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">
                          {pool.category} • {pool.difficulty} Level
                        </p>
                      </div>

                      <div className="pt-2 border-t border-primary/5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 font-bold text-foreground">
                          <Users className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{pool.joinedCount || 0} Joined</span>
                        </div>
                        <div className="flex items-center gap-1 font-black text-primary">
                          <span>Entry: ₹{pool.entryFee}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Custom Friend Duels & Community Pools */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-sm md:text-base font-black uppercase tracking-tight text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Community & Friend Duels
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                User-created pools • Instant Play
              </p>
            </div>
          </div>

          {openDuels.length === 0 ? (
            <Card className="rounded-2xl p-8 text-center bg-white border-primary/5 shadow-xs space-y-3">
              <p className="text-xs font-bold text-muted-foreground">
                No active custom duels yet. Be the first to create one!
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="h-10 px-5 rounded-xl font-black text-xs uppercase tracking-widest bg-primary hover:bg-primary/90 text-white"
              >
                Create First Duel
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {openDuels.map((pool: any) => (
                <Link key={pool._id} href={`/pools/${pool._id}`}>
                  <Card className="rounded-2xl border-primary/10 shadow-xs hover:shadow-md transition-all group bg-white overflow-hidden">
                    <CardContent className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-primary/5 text-primary text-[9px] font-black uppercase">
                          {pool.category}
                        </Badge>
                        <span className="text-[10px] font-mono font-bold text-muted-foreground">
                          Code: {pool.inviteCode}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                          {pool.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground font-medium">
                          Created by {pool.creatorName} • {pool.questionCount} Questions
                        </p>
                      </div>

                      <div className="pt-2 border-t border-primary/5 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-bold">
                          {pool.joinedCount || 1} / {pool.maxMembers} Players
                        </span>
                        <span className="font-black text-primary">
                          ₹{pool.entryFee} Entry • ₹{pool.totalPrizePool} Pot
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Create Pool Modal */}
      <CreatePoolModal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          fetchPools();
        }}
        isAdmin={isAdmin}
      />
    </div>
  );
}
