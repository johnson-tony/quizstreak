"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldAlert, ArrowRight } from "lucide-react";

interface QuizWarningModalProps {
  open: boolean;
  onClose: () => void;
  reason?: string;
}

export default function QuizWarningModal({
  open,
  onClose,
  reason,
}: QuizWarningModalProps) {
  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="sm:max-w-md text-center p-6 md:p-8 rounded-[2rem] border-amber-500/30 shadow-2xl bg-white">
        <DialogHeader className="items-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-amber-500/10 border-4 border-amber-500/20 flex items-center justify-center mb-2 relative">
            <div className="absolute inset-0 rounded-full bg-amber-500/10 animate-ping opacity-30" />
            <AlertTriangle className="w-10 h-10 text-amber-600 animate-bounce" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-widest border border-amber-300/50 mb-1">
            <ShieldAlert className="w-3 h-3 text-amber-600" />
            Strike 1 of 2 Issued
          </div>

          <DialogTitle className="text-xl md:text-2xl font-black uppercase tracking-tight text-foreground">
            Cheating Activity Detected!
          </DialogTitle>
          <DialogDescription className="sr-only">
            Warning for focus loss or tab switching during quiz
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2 text-left bg-amber-50/70 p-4 rounded-xl border border-amber-200 text-xs">
          <p className="text-amber-950 font-bold leading-relaxed">
            We detected that you navigated away from the quiz window or switched tabs.
          </p>
          {reason && (
            <p className="text-[11px] text-amber-900/80 italic">
              <strong>Detected:</strong> {reason}
            </p>
          )}
          <div className="p-2.5 bg-white/80 rounded-lg border border-amber-300 text-amber-900 text-[11px] font-semibold space-y-1">
            <p className="font-black uppercase tracking-wider text-[10px] text-red-600">
              🚨 Final Warning Notice:
            </p>
            <p>
              You are permitted only <strong>1 warning</strong>. If you leave this window, switch tabs, or minimize the browser again, the quiz will be <strong>immediately terminated and auto-submitted</strong>.
            </p>
          </div>
        </div>

        <Button
          onClick={onClose}
          className="w-full mt-4 h-12 rounded-xl text-xs font-black uppercase tracking-widest bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] gap-2"
        >
          I Understand & Resume Quiz <ArrowRight className="w-4 h-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
