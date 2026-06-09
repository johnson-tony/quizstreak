"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Flame, 
  Code2, 
  Database, 
  Cloud, 
  Star,
  Zap,
  Medal
} from "lucide-react";

interface BadgesSectionProps {
  userBadges: string[];
}

export default function BadgesSection({ userBadges }: BadgesSectionProps) {
  const allBadges = [
    { name: "First Challenge", icon: Zap, color: "text-amber-600", bg: "bg-amber-100", desc: "Complete your first challenge" },
    { name: "7-Day Streak", icon: Flame, color: "text-orange-600", bg: "bg-orange-100", desc: "Solve 7 challenges in a row" },
    { name: "30-Day Streak", icon: Flame, color: "text-rose-600", bg: "bg-rose-100", desc: "Solve 30 challenges in a row" },
    { name: "JavaScript Expert", icon: Code2, color: "text-primary", bg: "bg-primary/10", desc: "Solve 10 JS challenges" },
    { name: "SQL Expert", icon: Database, color: "text-secondary", bg: "bg-secondary/10", desc: "Solve 10 SQL challenges" },
    { name: "AWS Explorer", icon: Cloud, color: "text-blue-600", bg: "bg-blue-100", desc: "Solve 10 AWS challenges" },
    { name: "Top Performer", icon: Trophy, color: "text-amber-600", bg: "bg-amber-100", desc: "Reach Top 10 on leaderboard" },
  ];

  return (
    <Card className="rounded-2xl border-primary/5 shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="p-4 md:p-5 border-b border-primary/5 bg-primary/[0.01]">
        <div className="flex items-center gap-2">
          <Medal className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm md:text-base font-black text-foreground">Achievement Vault</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
          {allBadges.map((badge, i) => {
            const isEarned = userBadges.includes(badge.name);
            return (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${isEarned ? "bg-white border-primary/10 shadow-sm" : "bg-muted/30 border-transparent opacity-40 grayscale"}`}>
                <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${isEarned ? (badge.bg || "bg-primary/5") : "bg-muted"}`}>
                  <badge.icon className={`w-5 h-5 ${isEarned ? (badge.color || "text-primary") : "text-muted-foreground"}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-foreground leading-tight uppercase tracking-tight truncate">
                    {badge.name}
                  </div>
                  {isEarned && (
                    <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">
                      Earned
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
