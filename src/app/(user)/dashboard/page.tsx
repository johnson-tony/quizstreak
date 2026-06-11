"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import StatsSection from "@/components/features/StatsSection";
import StreakCalendar from "@/components/features/StreakCalendar";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Award, Zap, TrendingUp, Sparkles, ChevronRight, CheckCircle2, Code2, MessageSquare, Layers, Target, Rocket, MousePointer2, Database, Cloud, Terminal, BrainCircuit, Megaphone, BarChart3, ClipboardList, Plus } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const SKILLS = [
  { id: 'JavaScript', name: 'JavaScript', icon: Code2, color: 'text-yellow-600', bg: 'bg-yellow-50', type: 'technical' },
  { id: 'SQL', name: 'Database', icon: Database, color: 'text-blue-600', bg: 'bg-blue-50', type: 'technical' },
  { id: 'AWS', name: 'Cloud/AWS', icon: Cloud, color: 'text-orange-600', bg: 'bg-orange-50', type: 'technical' },
  { id: 'Python', name: 'Python', icon: Terminal, color: 'text-emerald-600', bg: 'bg-emerald-50', type: 'technical' },
  { id: 'Data Science', name: 'Data Science', icon: BarChart3, color: 'text-cyan-600', bg: 'bg-cyan-50', type: 'technical' },
  { id: 'Digital Marketing', name: 'Marketing', icon: Megaphone, color: 'text-pink-600', bg: 'bg-pink-50', type: 'non-technical' },
  { id: 'Product Management', name: 'Product', icon: ClipboardList, color: 'text-violet-600', bg: 'bg-violet-50', type: 'non-technical' },
  { id: 'Communication', name: 'Communication', icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50', type: 'non-technical' },
  { id: 'Aptitude', name: 'Aptitude', icon: BrainCircuit, color: 'text-purple-600', bg: 'bg-purple-50', type: 'non-technical' },
  { id: 'Leadership', name: 'Leadership', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50', type: 'non-technical' },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [attemptStatus, setAttemptStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [updatingPersona, setUpdatingPersona] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    } else if (status === "unauthenticated") {
      redirect("/");
    }
  }, [status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, attemptRes] = await Promise.all([
        fetch(`/api/user/profile?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/attempts?t=${Date.now()}`, { cache: 'no-store' })
      ]);
      
      const profileData = await profileRes.json();
      const attemptData = await attemptRes.json();

      setProfile(profileData);
      setAttemptStatus(attemptData);
      
      if (profileData.user.persona === 'unselected') {
        setShowOnboarding(true);
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handlePersonaSelect = async (persona: string) => {
    setUpdatingPersona(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile((prev: any) => ({ ...prev, user: { ...prev.user, persona } }));
        setShowOnboarding(false);
        toast.success(`Welcome, ${persona === 'mixed' ? 'Explorer' : persona === 'technical' ? 'Architect' : 'Professional'}!`);
      }
    } catch (error) {
      toast.error("Failed to save selection");
    } finally {
      setUpdatingPersona(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-grow max-w-7xl mx-auto px-4 py-8 space-y-6 w-full">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 lg:col-span-2 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  const userPersona = profile?.user?.persona || 'mixed';
  const filteredSkills = SKILLS.filter(skill => {
    if (userPersona === 'mixed') return true;
    return skill.type === userPersona;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-grow max-w-7xl mx-auto px-2 sm:px-4 py-2 md:py-4 space-y-4 md:space-y-6 w-full animate-in fade-in duration-700">
        {/* Compact Welcome & Quick Stats Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-3 glass-card p-3 md:p-5 rounded-xl md:rounded-[2rem] border-primary/5 shadow-lg bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/[0.02] blur-3xl -mr-24 -mt-24 rounded-full" />
          
          <div className="flex items-center gap-3 md:gap-4 relative z-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Avatar className="h-12 w-12 md:h-16 md:w-16 border-[3px] border-white shadow-xl relative z-10 ring-1 ring-primary/5">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-primary/5 text-primary text-lg md:text-xl font-black">
                  {session?.user?.name?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-0">
              <h1 className="text-sm md:text-2xl font-black text-foreground tracking-tight uppercase leading-none">
                {session?.user?.name?.split(' ')[0]}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                 <div className="px-1.5 py-0.5 bg-primary/5 rounded-full border border-primary/10 flex items-center gap-1">
                   <div className="w-0.5 h-0.5 rounded-full bg-primary animate-pulse" />
                   <span className="text-[6px] md:text-[9px] font-black text-primary uppercase tracking-widest">
                     {userPersona === 'technical' ? 'Architect' : userPersona === 'non-technical' ? 'Professional' : 'Explorer'}
                   </span>
                 </div>
                 <span className="text-[7px] md:text-xs text-muted-foreground font-bold italic uppercase tracking-tighter">Rank #{profile?.user?.rank}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-1 md:gap-2 relative z-10">
            <div className="flex-1 md:flex-none bg-orange-500/[0.02] border border-orange-500/5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2 transition-all hover:bg-orange-500/[0.04]">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-md bg-orange-500/10 flex items-center justify-center">
                <Zap className="w-3 h-3 md:w-4 md:h-4 text-orange-600 fill-orange-600" />
              </div>
              <div>
                <div className="text-[6px] md:text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Streak</div>
                <div className="text-xs md:text-sm font-black text-foreground">{profile?.user?.currentStreak}d</div>
              </div>
            </div>
            <div className="flex-1 md:flex-none bg-primary/[0.02] border border-primary/5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2 transition-all hover:bg-primary/[0.04]">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-md bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-primary" />
              </div>
              <div>
                <div className="text-[6px] md:text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Score</div>
                <div className="text-xs md:text-sm font-black text-foreground">{profile?.user?.totalPoints.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Big CTA for the Daily Task */}
        <section>
          {attemptStatus?.attempted ? (
            <motion.div 
              whileHover={{ scale: 1.002 }}
              className="relative rounded-xl md:rounded-[2rem] overflow-hidden group shadow-xl shadow-primary/20 bg-primary border-4 border-primary/30"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl -mr-24 -mt-24 rounded-full" />
              
              <div className="relative z-10 p-4 md:p-10 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                <div className="text-center md:text-left space-y-1 md:space-y-3">
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/10 rounded-full border border-white/20 text-white text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em]">
                    <CheckCircle2 className="w-2 h-2" /> Mission Complete
                  </div>
                  <h2 className="text-lg sm:text-2xl md:text-4xl font-black text-white tracking-tight leading-[1.1] uppercase">
                    {userPersona === 'non-technical' ? 'Session Complete' : 'Challenge Done'} <br className="hidden sm:block" />
                    <span className="text-white/60 font-medium italic text-xs md:text-2xl">Return in 24h</span>
                  </h2>
                  <p className="text-primary-foreground/70 text-[9px] md:text-xs max-w-xs md:max-w-md font-medium leading-tight">
                    Great work! You have finished today&apos;s tailored challenges. Keep the momentum going!
                  </p>
                </div>
                
                <Link href="/challenge" className="w-full sm:w-auto">
                  <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                    <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 h-10 md:h-16 px-5 md:px-10 rounded-lg md:rounded-2xl font-black text-xs md:text-base shadow-lg group transition-all uppercase tracking-widest">
                      Review Results <ChevronRight className="ml-0.5 w-3 h-3 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          ) : (
            <Link href="/challenge">
              <motion.div 
                whileHover={{ scale: 1.002 }}
                whileTap={{ scale: 0.998 }}
                className="relative rounded-xl md:rounded-[2rem] overflow-hidden group shadow-xl shadow-primary/20 bg-primary border-4 border-primary/30"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl -mr-24 -mt-24 rounded-full" />
                
                <div className="relative z-10 p-4 md:p-10 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                  <div className="text-center md:text-left space-y-1 md:space-y-3">
                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/10 rounded-full border border-white/20 text-white text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em]">
                      <Sparkles className="w-2 h-2" /> Personalized Set Ready
                    </div>
                    <h2 className="text-lg sm:text-2xl md:text-4xl font-black text-white tracking-tight leading-[1.1] uppercase">
                      Daily Streak <br className="hidden sm:block" />
                      <span className="text-white/60 font-medium italic text-xs md:text-2xl">Start Your Progress</span>
                    </h2>
                    <p className="text-primary-foreground/70 text-[9px] md:text-xs max-w-xs md:max-w-md font-medium leading-tight">
                      Attempt 15 questions tailored to your <strong>{userPersona}</strong> focus. Earn XP and grow!
                    </p>
                  </div>
                  
                  <div className="w-full sm:w-auto">
                    <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                      <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 h-10 md:h-16 px-5 md:px-10 rounded-lg md:rounded-2xl font-black text-xs md:text-base shadow-lg group transition-all uppercase tracking-widest">
                        Launch <ChevronRight className="ml-0.5 w-3 h-3 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </Link>
          )}
        </section>

        {/* Forge Your Skills Section (Filtered) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] md:text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
              <Code2 className="w-3 h-3 md:w-4 md:h-4 text-primary" />
              Focus Mastery
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowOnboarding(true)}
              className="h-6 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary"
            >
              Change Focus
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {filteredSkills.map((skill) => (
              <Link key={skill.id} href={`/practice/${skill.id}`}>
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-primary/5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden h-full"
                >
                  <div className={`absolute top-0 right-0 w-16 h-16 ${skill.bg} blur-2xl -mr-8 -mt-8 rounded-full opacity-50 group-hover:opacity-100 transition-opacity`} />
                  
                  <div className="relative z-10 space-y-3">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${skill.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <skill.icon className={`w-5 h-5 md:w-6 md:h-6 ${skill.color}`} />
                    </div>
                    <div>
                      <h4 className="text-[10px] md:text-sm font-black text-foreground uppercase tracking-tight">{skill.name}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Practice Now</span>
                        <ChevronRight className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
            
            {/* Suggest a Skill Card */}
            <Link href="/contact">
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-primary/[0.02] p-4 md:p-6 rounded-xl md:rounded-2xl border border-dashed border-primary/20 hover:border-primary/40 transition-all group relative h-full flex flex-col justify-center"
              >
                <div className="relative z-10 space-y-2 text-center md:text-left">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto md:mx-0 group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-[10px] md:text-sm font-black text-primary uppercase tracking-tight">Suggest More</h4>
                    <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Tell us what to add</p>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-5 pt-2">
          <div className="lg:col-span-2 space-y-3 md:space-y-4 order-2 lg:order-1">
            <StreakCalendar />
            <div className="glass-card p-3 md:p-5 rounded-xl md:rounded-2xl border-primary/5 shadow-md bg-white">
              <h3 className="text-[8px] md:text-xs font-black text-foreground uppercase tracking-widest mb-2 md:mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" />
                Growth Stats
              </h3>
              <StatsSection stats={{
                totalPoints: profile?.user?.totalPoints || 0,
                accuracy: profile?.stats?.accuracy || 0,
                totalSolved: profile?.stats?.totalSolved || 0,
                currentStreak: profile?.user?.currentStreak || 0,
                longestStreak: profile?.user?.longestStreak || 0,
              }} />
            </div>
          </div>

          <div className="space-y-3 md:space-y-4 order-1 lg:order-2">
            <Card className="rounded-xl md:rounded-2xl border-primary/5 bg-primary overflow-hidden shadow-lg group">
               <CardContent className="p-4 md:p-5 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 blur-2xl -mr-10 -mt-10 rounded-full" />
                  <div className="relative z-10">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center mb-2">
                      <Award className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h3 className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Daily Wisdom</h3>
                    <p className="text-xs md:text-base font-bold leading-tight group-hover:text-primary-foreground transition-colors">
                      &quot;Consistent practice is the shortcut to expertise.&quot;
                    </p>
                  </div>
               </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Persona Onboarding Modal */}
      <Dialog open={showOnboarding} onOpenChange={(val) => !updatingPersona && userPersona !== 'unselected' && setShowOnboarding(val)}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[500px] p-0 overflow-hidden rounded-[1.5rem] md:rounded-[2rem] border-none shadow-2xl">
          <div className="bg-primary p-6 md:p-8 text-center text-white relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-3xl rounded-full -mr-12 -mt-12" />
            <Rocket className="w-8 h-8 md:w-10 md:h-10 text-white mx-auto mb-3 animate-bounce" />
            <DialogTitle className="text-xl md:text-2xl font-black uppercase tracking-tight leading-none mb-2">Personalize</DialogTitle>
            <DialogDescription className="text-white/70 text-[10px] md:text-xs font-bold uppercase tracking-widest">Tailor your daily challenges</DialogDescription>
          </div>
          
          <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-3 bg-white">
             {[
               { id: 'technical', label: 'Architect', desc: 'Code & Data', icon: Code2, color: 'blue' },
               { id: 'non-technical', label: 'Pro', desc: 'Soft Skills', icon: MessageSquare, color: 'rose' },
               { id: 'mixed', label: 'Explorer', desc: 'Mixed Skills', icon: Sparkles, color: 'primary' }
             ].map((opt) => (
               <button
                 key={opt.id}
                 disabled={updatingPersona}
                 onClick={() => handlePersonaSelect(opt.id)}
                 className="flex md:flex-col items-center md:text-center p-3 md:p-4 rounded-xl border-2 border-slate-100 hover:border-primary hover:bg-primary/[0.02] transition-all group relative active:scale-[0.98] gap-3 md:gap-0"
               >
                 <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg bg-${opt.color}-500/10 flex items-center justify-center md:mb-2 shrink-0 group-hover:scale-110 transition-transform`}>
                    <opt.icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                 </div>
                 <div className="text-left md:text-center">
                   <h4 className="text-[11px] md:text-xs font-black uppercase tracking-tight text-foreground">{opt.label}</h4>
                   <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground leading-tight">{opt.desc}</p>
                 </div>
                 <MousePointer2 className="w-3 h-3 text-primary absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
               </button>
             ))}
          </div>
          
          <div className="px-6 pb-6 text-center bg-white">
            <p className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              You can change this anytime in settings.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
