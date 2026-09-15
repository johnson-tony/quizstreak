"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  ShieldAlert,
  Maximize2,
  Minimize2,
  Info,
  Lock,
  AlertTriangle,
  Ban,
  CheckCircle,
} from "lucide-react";

interface QuizProctorBarProps {
  violationCount: number;
  maxViolations?: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export default function QuizProctorBar({
  violationCount,
  maxViolations = 2,
  isFullscreen,
  onToggleFullscreen,
}: QuizProctorBarProps) {
  const [showRules, setShowRules] = useState(false);

  const getStatusBadge = () => {
    if (violationCount === 0) {
      return (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 flex items-center gap-1.5 shadow-xs"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Violations: 0/{maxViolations} (Clear)</span>
        </Badge>
      );
    }
    if (violationCount === 1) {
      return (
        <Badge
          variant="destructive"
          className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 flex items-center gap-1.5 animate-pulse shadow-md shadow-amber-500/20 border-none"
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Warning 1/{maxViolations} (Final Chance)</span>
        </Badge>
      );
    }
    return (
      <Badge
        variant="destructive"
        className="bg-destructive text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 flex items-center gap-1.5 shadow-md shadow-destructive/20 border-none"
      >
        <Ban className="w-3 h-3" />
        <span>Terminated: {violationCount}/{maxViolations}</span>
      </Badge>
    );
  };

  return (
    <>
      <div className="w-full bg-white/90 backdrop-blur-md rounded-xl border border-primary/10 shadow-xs px-3 py-2 flex flex-wrap items-center justify-between gap-2 transition-all">
        {/* Left: Proctor Live Status */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/5 flex items-center justify-center text-primary">
            {violationCount > 0 ? (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
                Proctor Guard
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
              Live Monitoring
            </span>
          </div>
        </div>

        {/* Center: Violation Pill */}
        <div className="flex items-center gap-1.5">{getStatusBadge()}</div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowRules(true)}
            className="h-7 px-2 text-[9px] font-black uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md gap-1"
            title="View Proctoring Rules"
          >
            <Info className="w-3 h-3" />
            <span className="hidden sm:inline">Rules</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleFullscreen}
            className="h-7 px-2 text-[9px] font-black uppercase tracking-wider text-primary border-primary/20 hover:bg-primary/5 rounded-md gap-1"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Mode"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3 h-3" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3 h-3" />
                <span className="hidden sm:inline">Fullscreen</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Proctor Rules Modal */}
      <Dialog open={showRules} onOpenChange={setShowRules}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl border-primary/10 shadow-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-black uppercase tracking-tight text-foreground">
                  Anti-Cheat Proctoring Rules
                </DialogTitle>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Quiz Integrity & Security Policy
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs text-foreground/80 leading-relaxed">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-900 font-black uppercase tracking-wider text-[10px]">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                2-Strike Policy
              </div>
              <p className="text-[11px] text-amber-900/90 font-medium">
                • <strong>1st Violation:</strong> Warning issued on screen.
                <br />
                • <strong>2nd Violation:</strong> Quiz is automatically concluded and scored immediately.
              </p>
            </div>

            <div className="space-y-2 pt-1 text-[11px]">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>No Tab Switching:</strong> Do not navigate to other tabs or minimize the browser window.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>No Focus Loss:</strong> Keep focus strictly inside the quiz window. Alt-tabbing or clicking outside triggers a strike.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Copy / Paste Blocked:</strong> Question copying and answer pasting are prohibited and disabled.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>DevTools & Shortcuts Disabled:</strong> Right-click inspect and developer tools are blocked.
                </span>
              </div>
            </div>
          </div>

          <Button
            className="w-full mt-4 h-9 rounded-xl text-xs font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white"
            onClick={() => setShowRules(false)}
          >
            Understood
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
