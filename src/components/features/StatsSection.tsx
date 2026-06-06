"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  Trophy, 
  Target, 
  CheckCircle2, 
  Flame,
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
    { label: "Total Points", value: stats.totalPoints, icon: Trophy, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Accuracy", value: `${stats.accuracy}%`, icon: Target, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Solved", value: stats.totalSolved, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
    { label: "Current Streak", value: stats.currentStreak, icon: Flame, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Longest Streak", value: stats.longestStreak, icon: Award, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statCards.map((stat, i) => (
        <Card key={i} className="rounded-2xl border-none shadow-sm bg-white/70 backdrop-blur-md overflow-hidden">
          <CardContent className="p-6">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-1">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
