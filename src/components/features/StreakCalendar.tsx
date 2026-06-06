"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";

export default function StreakCalendar() {
  // Mock data for the grid (52 weeks x 7 days)
  const days = Array.from({ length: 364 }, (_, i) => ({
    count: Math.random() > 0.8 ? 1 : 0,
    date: i
  }));

  return (
    <Card className="rounded-2xl border-primary/5 shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="p-4 md:p-5 border-b border-primary/5 bg-primary/[0.01]">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm md:text-base font-black text-foreground">Activity Timeline</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col gap-2">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 min-w-max pb-2">
              {Array.from({ length: 52 }).map((_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const day = days[weekIndex * 7 + dayIndex];
                    return (
                      <div 
                        key={dayIndex} 
                        className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-[2px] transition-colors duration-500 ${day.count > 0 ? "bg-primary shadow-sm shadow-primary/20" : "bg-muted hover:bg-muted/80"}`}
                        title={`Challenge solved on day ${day.date}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between text-[9px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest px-1">
            <span>Jan</span>
            <span>Mar</span>
            <span>May</span>
            <span>Jul</span>
            <span>Sep</span>
            <span>Nov</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
