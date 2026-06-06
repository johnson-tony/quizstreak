"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StreakCalendar() {
  // Mock data for the grid (52 weeks x 7 days)
  const days = Array.from({ length: 364 }, (_, i) => ({
    count: Math.random() > 0.8 ? 1 : 0,
    date: i
  }));

  return (
    <Card className="rounded-[24px] border-none shadow-sm bg-white/70 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Streak Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1 overflow-x-auto pb-4">
          <div className="flex gap-1">
            {Array.from({ length: 52 }).map((_, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const day = days[weekIndex * 7 + dayIndex];
                  return (
                    <div 
                      key={dayIndex} 
                      className={`w-3 h-3 rounded-sm ${day.count > 0 ? "bg-blue-500" : "bg-gray-100"}`}
                      title={`Challenge solved on day ${day.date}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-gray-400 font-medium px-1">
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
