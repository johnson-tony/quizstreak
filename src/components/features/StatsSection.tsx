"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  Trophy, 
  Target, 
  CheckCircle2, 
  Zap,
  Award
} from "lucide-react";

interface StatsProps {
  stats: {
    totalPoints: number;
    accuracy: number;
    totalSolved: number;
    currentStreak: number;
    longestStreak: number;
  };
}

export default function StatsSection({ stats }: StatsProps) {
  const statCards = [
    { label: "Points", value: stats.totalPoints, icon: Trophy, color: "text-amber-600", bg: "bg-amber-500/10" },
    { label: "Accuracy", value: `${stats.accuracy}%`, icon: Target, color: "text-secondary", bg: "bg-secondary/10" },
    { label: "Solved", value: stats.totalSolved, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { label: "Current", value: `${stats.currentStreak}d`, icon: Zap, color: "text-primary", bg: "bg-primary/10" },
    { label: "Best", value: `${stats.longestStreak}d`, icon: Award, color: "text-accent", bg: "bg-accent/10" },
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-1.5 md:gap-3">
      {statCards.map((stat, i) => (
        <Card key={i} className="rounded-lg md:rounded-xl border-primary/5 shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden flex flex-col justify-center items-center py-2 md:py-3">
          <CardContent className="p-0 flex flex-col items-center gap-0.5">
            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-0.5`}>
              <stat.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
            <div className="text-xs md:text-base font-black text-foreground leading-none">{stat.value}</div>
            <div className="text-[7px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-tight">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
