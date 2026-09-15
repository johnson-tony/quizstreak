"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ban, ShieldAlert, ChevronRight, BarChart2 } from "lucide-react";

interface QuizTerminatedModalProps {
  open: boolean;
  score: number;
  total: number;
  pointsEarned: number;
  reason?: string;
  onReview: () => void;
}

export default function QuizTerminatedModal({
  open,
  score,
  total,
  pointsEarned,
  reason,
  onReview,
}: QuizTerminatedModalProps) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md text-center p-6 md:p-8 rounded-[2rem] border-red-500/30 shadow-2xl bg-white"
        showCloseButton={false}
      >
        <DialogHeader className="items-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 border-4 border-red-500/20 flex items-center justify-center mb-2 relative">
            <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping opacity-30" />
            <Ban className="w-10 h-10 text-red-600" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-900 text-[10px] font-black uppercase tracking-widest border border-red-300/50 mb-1">
            <ShieldAlert className="w-3 h-3 text-red-600" />
            Cheating Limit Reached (2/2)
          </div>

          <DialogTitle className="text-xl md:text-2xl font-black uppercase tracking-tight text-destructive">
            Quiz Terminated
          </DialogTitle>
          <DialogDescription className="text-xs font-bold text-muted-foreground">
            {reason || "Repeated focus loss or tab switching detected"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <p className="text-xs text-muted-foreground font-medium">
            Your quiz was concluded early due to security violations. Your answers up to the termination point have been submitted and evaluated.
          </p>

          <div className="p-4 bg-slate-50 rounded-2xl border border-primary/10 grid grid-cols-3 gap-2 text-center">
            <div className="space-y-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Score</span>
              <div className="text-lg md:text-xl font-black text-foreground">{score} / {total}</div>
            </div>
            <div className="space-y-0.5 border-x border-primary/10">
              <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Accuracy</span>
              <div className="text-lg md:text-xl font-black text-foreground">{percentage}%</div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">XP</span>
              <div className="text-lg md:text-xl font-black text-primary">+{pointsEarned}</div>
            </div>
          </div>
        </div>

        <Button
          onClick={onReview}
          className="w-full mt-4 h-12 rounded-xl text-xs font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98] gap-2"
        >
          <BarChart2 className="w-4 h-4" /> Review Final Performance <ChevronRight className="w-4 h-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
