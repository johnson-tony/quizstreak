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
  Zap
} from "lucide-react";

interface BadgesSectionProps {
  userBadges: string[];
}

export default function BadgesSection({ userBadges }: BadgesSectionProps) {
  const allBadges = [
    { name: "First Challenge", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-50", desc: "Complete your first challenge" },
    { name: "7-Day Streak", icon: Flame, color: "text-orange-500", bg: "bg-orange-50", desc: "Solve 7 challenges in a row" },
    { name: "30-Day Streak", icon: Flame, color: "text-red-500", bg: "bg-red-50", desc: "Solve 30 challenges in a row" },
    { name: "JavaScript Expert", icon: Code2, desc: "Solve 10 JS challenges" },
    { name: "SQL Expert", icon: Database, desc: "Solve 10 SQL challenges" },
    { name: "AWS Explorer", icon: Cloud, desc: "Solve 10 AWS challenges" },
    { name: "Top Performer", icon: Trophy, color: "text-amber-500", bg: "bg-amber-50", desc: "Reach Top 10 on leaderboard" },
  ];

  return (
    <Card className="rounded-[24px] border-none shadow-sm bg-white/70 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Your Badges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {allBadges.map((badge, i) => {
            const isEarned = userBadges.includes(badge.name);
            return (
              <div key={i} className={`flex flex-col items-center text-center p-4 rounded-2xl border ${isEarned ? "bg-white border-blue-100 shadow-sm" : "bg-gray-50/50 border-transparent opacity-40 grayscale"}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isEarned ? (badge.bg || "bg-blue-50") : "bg-gray-100"}`}>
                  <badge.icon className={`w-6 h-6 ${isEarned ? (badge.color || "text-blue-600") : "text-gray-400"}`} />
                </div>
                <div className="text-[10px] font-bold text-gray-900 leading-tight uppercase tracking-wider mb-1">
                  {badge.name}
                </div>
                {isEarned && (
                  <Badge variant="secondary" className="bg-green-50 text-green-600 text-[8px] h-4 uppercase px-1.5 border-none">
                    Earned
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
