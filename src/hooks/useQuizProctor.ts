"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

export interface ProctorViolationLog {
  count: number;
  reason: string;
  timestamp: Date;
}

interface UseQuizProctorOptions {
  isActive: boolean;
  maxViolations?: number;
  onViolate?: (count: number, reason: string) => void;
  onConclude?: (reason: string) => void;
}

export function useQuizProctor({
  isActive,
  maxViolations = 2,
  onViolate,
  onConclude,
}: UseQuizProctorOptions) {
  const [violationCount, setViolationCount] = useState(0);
  const [violationLogs, setViolationLogs] = useState<ProctorViolationLog[]>([]);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  const [terminationReason, setTerminationReason] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const lastViolationTimeRef = useRef<number>(0);
  const wasFullscreenRef = useRef<boolean>(false);
  const violationCountRef = useRef<number>(0);
  const isTerminatedRef = useRef<boolean>(false);

  useEffect(() => {
    violationCountRef.current = violationCount;
  }, [violationCount]);

  useEffect(() => {
    isTerminatedRef.current = isTerminated;
  }, [isTerminated]);

  const triggerViolation = useCallback(
    (reason: string) => {
      if (!isActive || isTerminatedRef.current) return;

      const now = Date.now();
      // Cooldown of 2000ms prevents dual triggers from tab switch (which fires both blur and visibilitychange)
      if (now - lastViolationTimeRef.current < 2000) {
        return;
      }
      lastViolationTimeRef.current = now;

      const nextCount = violationCountRef.current + 1;
      setViolationCount(nextCount);
      setViolationLogs((prev) => [
        ...prev,
        { count: nextCount, reason, timestamp: new Date() },
      ]);

      if (nextCount === 1) {
        setIsWarningOpen(true);
        toast.error("⚠️ Cheating Warning (1/2): Focus Loss Detected!", {
          description: "Leaving the quiz window or switching tabs is strictly prohibited.",
          duration: 6000,
        });
        onViolate?.(1, reason);
      } else if (nextCount >= maxViolations) {
        setIsWarningOpen(false);
        setIsTerminated(true);
        setTerminationReason(reason);
        toast.error("🚫 Quiz Terminated: Cheating Limit Reached (2/2)", {
          description: "Quiz concluded due to repeated window focus loss.",
          duration: 8000,
        });
        onConclude?.(reason);
      }
    },
    [isActive, maxViolations, onViolate, onConclude]
  );

  // Tab visibility change detection
  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === "hidden") {
        triggerViolation("Switched browser tab or minimized window");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isActive, triggerViolation]);

  // Window blur detection (loss of focus to external window or app)
  useEffect(() => {
    if (!isActive) return;

    const handleBlur = () => {
      triggerViolation("Window lost focus (Alt-Tab, clicked outside, or opened application)");
    };

    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("blur", handleBlur);
    };
  }, [isActive, triggerViolation]);

  // Fullscreen exit detection
  useEffect(() => {
    if (!isActive) return;

    const handleFullscreenChange = () => {
      const inFullscreen = !!document.fullscreenElement;
      setIsFullscreen(inFullscreen);
      if (wasFullscreenRef.current && !inFullscreen && !isTerminatedRef.current) {
        triggerViolation("Exited full-screen exam mode");
      }
      wasFullscreenRef.current = inFullscreen;
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isActive, triggerViolation]);

  // Keyboard shortcut blocking (DevTools, View Source, Copy/Paste/Print)
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12 (DevTools)
      if (e.key === "F12") {
        e.preventDefault();
        e.stopPropagation();
        toast.warning("Developer tools are disabled during the exam.");
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Block Inspect: Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (
        isCtrlOrCmd &&
        e.shiftKey &&
        ["I", "i", "J", "j", "C", "c"].includes(e.key)
      ) {
        e.preventDefault();
        e.stopPropagation();
        toast.warning("Developer tools shortcut disabled.");
        return;
      }

      // Block Ctrl+U (View Source)
      if (isCtrlOrCmd && ["u", "U"].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        toast.warning("Viewing source is disabled during the exam.");
        return;
      }

      // Block Ctrl+C (Copy), Ctrl+V (Paste), Ctrl+X (Cut), Ctrl+P (Print), Ctrl+S (Save), Ctrl+A (Select all)
      if (isCtrlOrCmd && ["c", "v", "x", "p", "s", "a"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
        toast.warning(`Shortcut [Ctrl+${e.key.toUpperCase()}] is disabled during the quiz.`);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isActive]);

  // Clipboard protections: copy, cut, paste
  useEffect(() => {
    if (!isActive) return;

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.warning("Copying quiz questions is prohibited.");
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.warning("Cutting quiz content is prohibited.");
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.warning("Pasting content is prohibited.");
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("paste", handlePaste);
    };
  }, [isActive]);

  // Context menu (Right-Click) blocking
  useEffect(() => {
    if (!isActive) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.warning("Right-click is disabled to preserve quiz integrity.");
    };

    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [isActive]);

  // Mouse leave viewport warning
  useEffect(() => {
    if (!isActive) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (
        e.clientY <= 0 ||
        e.clientX <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight
      ) {
        toast.info("⚠️ Please keep your cursor focused within the quiz area.", {
          duration: 2500,
        });
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isActive]);

  // Before unload warning
  useEffect(() => {
    if (!isActive) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Quiz in progress. If you leave, your quiz will be concluded.";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isActive]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        wasFullscreenRef.current = true;
        toast.success("Fullscreen proctoring mode enabled.");
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        wasFullscreenRef.current = false;
      }
    } catch {
      toast.info("Fullscreen mode is not supported by your browser.");
    }
  }, []);

  const closeWarning = useCallback(() => {
    setIsWarningOpen(false);
  }, []);

  const resetProctor = useCallback(() => {
    setViolationCount(0);
    setViolationLogs([]);
    setIsWarningOpen(false);
    setIsTerminated(false);
    setTerminationReason("");
    lastViolationTimeRef.current = 0;
  }, []);

  return {
    violationCount,
    violationLogs,
    isWarningOpen,
    isTerminated,
    terminationReason,
    isFullscreen,
    toggleFullscreen,
    closeWarning,
    resetProctor,
  };
}
