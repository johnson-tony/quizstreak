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
    <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
      {statCards.map((stat, i) => (
        <Card key={i} className="rounded-xl border-primary/5 shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden flex flex-col justify-center items-center py-3 md:py-4">
          <CardContent className="p-0 flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-1`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div className="text-sm md:text-lg font-black text-foreground leading-none">{stat.value}</div>
            <div className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
