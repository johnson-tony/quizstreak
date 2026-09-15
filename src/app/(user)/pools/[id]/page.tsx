"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  Users,
  Share2,
  Copy,
  CheckCircle2,
  Clock,
  Play,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  IndianRupee,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import PoolPaymentModal from "@/components/features/PoolPaymentModal";

export default function PoolDetailPage() {
  const params = useParams();
  const poolId = params.id as string;
  const router = useRouter();
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetchPoolDetails();
  }, [poolId]);

  const fetchPoolDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pools/${poolId}`);
      const json = await res.json();
      if (json.error) {
        toast.error(json.error);
      } else {
        setData(json);
      }
    } catch {
      toast.error("Failed to load pool details");
    } finally {
      setLoading(false);
    }
  };

  const pool = data?.pool;
  const myParticipation = data?.myParticipation;
  const isEnrolled = !!myParticipation;
  const isCompleted = myParticipation?.quizStatus === "completed" || myParticipation?.quizStatus === "terminated_cheating";

  const copyInviteLink = () => {
    if (typeof window === "undefined" || !pool) return;
    const shareUrl = `${window.location.origin}/pools/${pool._id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    toast.success("Pool invite link copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyCode = () => {
    if (!pool?.inviteCode) return;
    navigator.clipboard.writeText(pool.inviteCode);
    setCopiedCode(true);
    toast.success("Invite code copied!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const shareWhatsApp = () => {
    if (typeof window === "undefined" || !pool) return;
    const shareUrl = `${window.location.origin}/pools/${pool._id}`;
    const text = encodeURIComponent(
      `🔥 Join my QuizStreak Challenge!\n🏆 ${pool.title}\n💡 Category: ${pool.category}\n💰 Entry: ₹${pool.entryFee} | Prize Pool: ₹${pool.totalPrizePool}\nJoin here: ${shareUrl}\nInvite Code: ${pool.inviteCode}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] space-y-4">
        <h2 className="text-xl font-black">Pool Not Found</h2>
        <Link href="/pools">
          <Button variant="outline">Return to Pools</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <main className="flex-grow mx-auto px-4 md:px-6 py-6 w-full max-w-5xl space-y-6 animate-in fade-in duration-500">
        {/* Navigation Back */}
        <div className="flex items-center justify-between">
          <Link href="/pools">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-primary gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> All Pools
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono font-black uppercase px-2 py-0.5">
              Code: {pool.inviteCode}
            </Badge>
          </div>
        </div>

        {/* Hero Pool Header */}
        <section className="bg-white rounded-[2rem] border border-primary/10 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider border-none">
                  {pool.category}
                </Badge>
                <Badge variant="outline" className="text-[9px] font-bold uppercase">
                  {pool.questionCount} Questions
                </Badge>
                <Badge variant="outline" className="text-[9px] font-bold uppercase">
                  {pool.difficulty} Level
                </Badge>
              </div>
              <h1 className="text-xl md:text-3xl font-black uppercase tracking-tight text-foreground">
                {pool.title}
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Created by <strong className="text-foreground">{pool.creatorName}</strong> • {data?.participantsCount || 0} / {pool.maxMembers} Players Joined
              </p>
            </div>

            {/* Prize & Action Box */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-primary/5 min-w-[240px]">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">
                  Total Prize Pool
                </span>
                <span className="text-2xl md:text-3xl font-black text-primary">
                  ₹{pool.totalPrizePool}
                </span>
              </div>

              {/* Action Button depending on user state */}
              {!isEnrolled ? (
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full h-11 rounded-xl text-xs font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2"
                >
                  Pay ₹{pool.entryFee} & Join Challenge
                </Button>
              ) : isCompleted ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold w-full justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Score: {myParticipation?.score} / {pool.questionCount}
                </div>
              ) : (
                <Link href={`/pools/${pool._id}/play`} className="w-full">
                  <Button className="w-full h-11 rounded-xl text-xs font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 gap-2">
                    <Play className="w-4 h-4 fill-white" /> Start Quiz Arena
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Social Share / Invite Bar */}
          <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-purple-950 font-bold text-xs">
              <Share2 className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Invite friends to compete for the ₹{pool.totalPrizePool} prize!</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={copyCode}
                className="h-8 px-3 rounded-lg text-[10px] font-black uppercase bg-white border-purple-200 text-purple-900 hover:bg-purple-50"
              >
                <Copy className="w-3 h-3 mr-1" />
                {copiedCode ? "Copied!" : `Code: ${pool.inviteCode}`}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={copyInviteLink}
                className="h-8 px-3 rounded-lg text-[10px] font-black uppercase bg-white border-purple-200 text-purple-900 hover:bg-purple-50"
              >
                <Copy className="w-3 h-3 mr-1" />
                {copiedLink ? "Link Copied!" : "Copy Link"}
              </Button>

              <Button
                size="sm"
                onClick={shareWhatsApp}
                className="h-8 px-3 rounded-lg text-[10px] font-black uppercase bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </Button>
            </div>
          </div>
        </section>

        {/* Live Leaderboard & Standings */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm md:text-base font-black uppercase tracking-tight text-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" /> Pool Leaderboard & Standings
            </h2>
            <span className="text-xs font-bold text-muted-foreground">
              Tie-breaker: Faster completion time
            </span>
          </div>

          <Card className="rounded-2xl border-primary/5 bg-white shadow-xs overflow-hidden">
            {data?.leaderboard && data.leaderboard.length > 0 ? (
              <div className="divide-y divide-primary/5">
                {data.leaderboard.map((item: any) => (
                  <div key={item.rank} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                          item.rank === 1
                            ? "bg-amber-100 text-amber-900"
                            : item.rank === 2
                            ? "bg-slate-200 text-slate-900"
                            : item.rank === 3
                            ? "bg-amber-800/10 text-amber-900"
                            : "bg-slate-100 text-muted-foreground"
                        }`}
                      >
                        {item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : item.rank === 3 ? "🥉" : `#${item.rank}`}
                      </div>

                      <Avatar className="w-8 h-8 border border-primary/10">
                        <AvatarImage src={item.userImage} />
                        <AvatarFallback className="font-bold text-xs">{item.userName?.[0]}</AvatarFallback>
                      </Avatar>

                      <div>
                        <h4 className="text-xs md:text-sm font-black text-foreground uppercase tracking-tight">
                          {item.userName}
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.timeTakenSeconds}s
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm md:text-base font-black text-foreground">
                        {item.score} / {item.totalQuestions}
                      </span>
                      {item.prizeWon > 0 && (
                        <span className="block text-[10px] font-black text-emerald-600 uppercase">
                          Prize: ₹{item.prizeWon}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center space-y-2">
                <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                <p className="text-xs font-bold text-muted-foreground">
                  No completed attempts yet. Be the first to play and top the leaderboard!
                </p>
              </div>
            )}
          </Card>
        </section>

        {/* Enrolled Players Roster */}
        <section className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
            Enrolled Players ({data?.participants?.length || 0})
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {data?.participants?.map((p: any) => (
              <div
                key={p._id}
                className="bg-white p-3 rounded-xl border border-primary/5 flex items-center gap-2.5 shadow-xs"
              >
                <Avatar className="w-8 h-8 border border-primary/10">
                  <AvatarImage src={p.userImage} />
                  <AvatarFallback className="text-[10px] font-bold">{p.userName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-bold text-foreground truncate">{p.userName}</h5>
                  <span className="text-[9px] font-black uppercase tracking-wider block text-muted-foreground">
                    {p.quizStatus === "completed" ? (
                      <span className="text-emerald-600">Finished</span>
                    ) : (
                      <span className="text-amber-600">In Pool</span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Payment Modal */}
      <PoolPaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        poolId={pool._id}
        poolTitle={pool.title}
        entryFee={pool.entryFee}
        onSuccess={fetchPoolDetails}
      />
    </div>
  );
}
