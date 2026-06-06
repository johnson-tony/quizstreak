"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function StreakCalendar() {
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const res = await fetch("/api/user/activity");
      const data = await res.json();
      setActivity(data);
    } catch (error) {
      console.error("Failed to load activity");
    } finally {
      setLoading(false);
    }
  };

  // Generate 364 days for the heatmap
  const generateGrid = () => {
    const today = new Date();
    const grid = [];
    
    // Calculate start date (364 days ago)
    const startDate = new Date();
    startDate.setDate(today.getDate() - 363);

    for (let i = 0; i < 364; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Check if user has an attempt on this date
      const hasAttempt = activity.some(a => {
        const attemptDate = new Date(a.date).toISOString().split('T')[0];
        return attemptDate === dateStr;
      });

      grid.push({
        date: dateStr,
        count: hasAttempt ? 1 : 0
      });
    }
    return grid;
  };

  const days = generateGrid();

  return (
    <Card className="rounded-2xl border-primary/5 shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden text-black">
      <CardHeader className="p-4 md:p-5 border-b border-primary/5 bg-primary/[0.01]">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm md:text-base font-black text-foreground">Activity Timeline</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {loading ? (
          <div className="h-24 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
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
                          title={day.date}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between text-[9px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest px-1">
              <span>Start</span>
              <span>Timeline (364 Days)</span>
              <span>Today</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
