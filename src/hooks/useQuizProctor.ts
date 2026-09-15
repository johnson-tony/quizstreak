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

export function useQuizProctor({ isActive, maxViolations = 2, onViolate, onConclude }: UseQuizProctorOptions) {
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

  useEffect(() => { violationCountRef.current = violationCount; }, [violationCount]);
  useEffect(() => { isTerminatedRef.current = isTerminated; }, [isTerminated]);

  const triggerViolation = useCallback((reason: string) => {
    if (!isActive || isTerminatedRef.current) return;

    const now = Date.now();
    if (now - lastViolationTimeRef.current < 2000) return;
    lastViolationTimeRef.current = now;

    const nextCount = violationCountRef.current + 1;
    setViolationCount(nextCount);
    setViolationLogs((prev) => [...prev, { count: nextCount, reason, timestamp: new Date() }]);

    if (nextCount === 1) {
      setIsWarningOpen(true);
      toast.warning("Warning: Stay on the quiz", { duration: 3500 });
      onViolate?.(1, reason);
    } else if (nextCount >= maxViolations) {
      setIsWarningOpen(false);
      setIsTerminated(true);
      setTerminationReason(reason);
      toast.error("Quiz terminated", { duration: 4000 });
      onConclude?.(reason);
    }
  }, [isActive, maxViolations, onViolate, onConclude]);

  useEffect(() => {
    if (!isActive) return;
    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === "hidden") {
        triggerViolation("Switched browser tab or minimized window");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isActive, triggerViolation]);

  useEffect(() => {
    if (!isActive) return;
    const handleBlur = () => {
      triggerViolation("Window lost focus");
    };
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [isActive, triggerViolation]);

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
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [isActive, triggerViolation]);

  // Prevent text selection/copy UI during the quiz, including mobile share actions.
  useEffect(() => {
    if (!isActive) return;
    const previousUserSelect = document.body.style.userSelect;
    const previousWebkitUserSelect = document.body.style.webkitUserSelect;
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    return () => {
      document.body.style.userSelect = previousUserSelect;
      document.body.style.webkitUserSelect = previousWebkitUserSelect;
    };
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12") {
        e.preventDefault();
        e.stopPropagation();
        toast.warning("Developer tools are disabled.", { duration: 2500 });
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (isCtrlOrCmd && e.shiftKey && ["I", "i", "J", "j", "C", "c"].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        toast.warning("Developer tools are disabled.", { duration: 2500 });
        return;
      }

      if (isCtrlOrCmd && ["u", "U"].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        toast.warning("This shortcut is disabled.", { duration: 2500 });
        return;
      }

      if (isCtrlOrCmd && ["c", "v", "x", "p", "s", "a"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
        toast.warning("This shortcut is disabled.", { duration: 2500 });
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;
    const handleCopy = (e: ClipboardEvent) => { e.preventDefault(); toast.warning("Copying is disabled.", { duration: 2500 }); };
    const handleCut = (e: ClipboardEvent) => { e.preventDefault(); toast.warning("Cutting is disabled.", { duration: 2500 }); };
    const handlePaste = (e: ClipboardEvent) => { e.preventDefault(); toast.warning("Pasting is disabled.", { duration: 2500 }); };
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("paste", handlePaste);
    };
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.warning("Right-click is disabled.", { duration: 2500 });
    };
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        toast.info("Please stay within the quiz.", { duration: 2000 });
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Quiz in progress. If you leave, your quiz will be concluded.";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isActive]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        wasFullscreenRef.current = true;
        toast.success("Fullscreen mode enabled.", { duration: 2500 });
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        wasFullscreenRef.current = false;
      }
    } catch {
      toast.info("Fullscreen is not supported.", { duration: 2500 });
    }
  }, []);

  const closeWarning = useCallback(() => setIsWarningOpen(false), []);

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
