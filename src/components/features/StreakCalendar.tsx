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
      const res = await fetch(`/api/user/activity?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      setActivity(data);
    } catch (error) {
      console.error("Failed to load activity");
    } finally {
      setLoading(false);
    }
  };

  // Generate 30 days for a focused monthly heatmap
  const generateGrid = () => {
    const today = new Date();
    const grid = [];
    
    // Calculate start date (29 days ago)
    const startDate = new Date();
    startDate.setDate(today.getDate() - 29);

    for (let i = 0; i < 30; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      // Fix timezone shifting for local date rendering
      const offset = currentDate.getTimezoneOffset();
      const localDate = new Date(currentDate.getTime() - (offset * 60 * 1000));
      const dateStr = localDate.toISOString().split('T')[0];
      
      // Check if user has an attempt on this date
      const hasAttempt = activity.some(a => {
        const attemptDate = new Date(a.date).toISOString().split('T')[0];
        return attemptDate === dateStr;
      });

      grid.push({
        date: dateStr,
        count: hasAttempt ? 1 : 0,
        dayNum: localDate.getDate(),
        isToday: dateStr === new Date().toISOString().split('T')[0]
      });
    }
    return grid;
  };

  const days = generateGrid();

  return (
    <Card className="rounded-2xl border-primary/5 shadow-sm bg-white overflow-hidden">
      <CardHeader className="p-4 md:p-5 border-b border-primary/5 bg-primary/[0.01]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm md:text-base font-black text-foreground uppercase tracking-tight">Growth Tracker</CardTitle>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">Last 30 Days Activity</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {loading ? (
          <div className="h-24 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-10 gap-1.5 md:gap-2">
              {days.map((day, i) => (
                <div 
                  key={i} 
                  className={`aspect-square rounded-md flex flex-col items-center justify-center gap-0.5 transition-all duration-300 relative group ${
                    day.count > 0 
                      ? "bg-primary text-white shadow-md shadow-primary/20 scale-105" 
                      : day.isToday
                        ? "bg-primary/5 border border-primary/20 text-primary"
                        : "bg-muted/30 hover:bg-muted/50 text-muted-foreground/40"
                  }`}
                >
                  <span className="text-[8px] md:text-[10px] font-black">{day.dayNum}</span>
                  {day.count > 0 && <div className="w-1 h-1 rounded-full bg-white/40" />}
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[8px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap uppercase tracking-widest">
                    {day.date} {day.count > 0 ? "• COMPLETED" : ""}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between border-t border-primary/5 pt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm bg-primary" />
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Active</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm bg-muted" />
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Inactive</span>
                </div>
              </div>
              <div className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded">
                Streak: {activity.length} Days
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
