"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Trophy,
  Clock,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useQuizProctor } from "@/hooks/useQuizProctor";
import QuizProctorBar from "@/components/features/QuizProctorBar";
import QuizWarningModal from "@/components/features/QuizWarningModal";
import QuizTerminatedModal from "@/components/features/QuizTerminatedModal";

interface QuestionItem {
  day: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

export default function PoolQuizArenaPage() {
  const params = useParams();
  const poolId = params.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pool, setPool] = useState<any>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ day: string; selectedAnswer: string }[]>([]);
  const [result, setResult] = useState<any>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showTerminatedModal, setShowTerminatedModal] = useState(false);
  const [terminatedReason, setTerminatedReason] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchQuiz();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [poolId]);

  // Start timer once questions are loaded
  useEffect(() => {
    if (!loading && questions.length > 0 && !result) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, questions.length, result]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pools/${poolId}/quiz`);
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        router.push(`/pools/${poolId}`);
        return;
      }
      if (data.alreadyCompleted) {
        toast.info("You have already completed this pool quiz.");
        router.push(`/pools/${poolId}`);
        return;
      }
      setPool(data.pool);
      setQuestions(data.questions || []);
    } catch {
      toast.error("Failed to load pool challenge questions");
      router.push(`/pools/${poolId}`);
    } finally {
      setLoading(false);
    }
  };

  const isQuizActive = !loading && questions.length > 0 && !result;

  const handleCheatTermination = async (reason: string) => {
    if (submitting || result) return;
    setSubmitting(true);
    setTerminatedReason(reason);
    if (timerRef.current) clearInterval(timerRef.current);

    const completedAnswers = questions.map((q) => {
      const answered = userAnswers.find((a) => a.day === q.day);
      return answered || { day: q.day, selectedAnswer: "None" };
    });

    try {
      const res = await fetch(`/api/pools/${poolId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: completedAnswers,
          timeTakenSeconds: timeElapsed,
          terminatedDueToCheating: true,
          cheatingReason: reason,
        }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setResult(data);
        setShowTerminatedModal(true);
      }
    } catch {
      toast.error("Quiz ended due to focus loss violations.");
      setResult({
        score: 0,
        totalQuestions: questions.length,
        timeTakenSeconds: timeElapsed,
        rank: 99,
        prizeWon: 0,
        xpEarned: 0,
      });
      setShowTerminatedModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  const proctor = useQuizProctor({
    isActive: isQuizActive,
    maxViolations: 2,
    onConclude: (reason) => {
      handleCheatTermination(reason);
    },
  });

  const currentQuestion = questions[currentIndex];
  const selectedOption =
    userAnswers.find((a) => a.day === currentQuestion?.day)?.selectedAnswer || "";

  const handleOptionSelect = (val: string) => {
    setUserAnswers((prev) => {
      const filtered = prev.filter((a) => a.day !== currentQuestion.day);
      return [...filtered, { day: currentQuestion.day, selectedAnswer: val }];
    });
  };

  const handleNext = () => {
    if (!selectedOption) {
      toast.error("Please select an answer");
      return;
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (submitting || result) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await fetch(`/api/pools/${poolId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: userAnswers,
          timeTakenSeconds: timeElapsed,
        }),
      });

      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setResult(data);
        toast.success("Pool Quiz Completed! Check your standing on the leaderboard.");
      }
    } catch {
      toast.error("Failed to submit answers");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Finished / Result View
  if (result) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <main className="flex-grow mx-auto px-4 md:px-6 py-10 w-full max-w-xl space-y-6 animate-in zoom-in-95 duration-500 text-center">
          <div className="bg-white rounded-[2.5rem] border border-primary/10 shadow-xl p-8 space-y-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-20" />
              <Trophy className="w-12 h-12 text-primary" />
            </div>

            <div className="space-y-1">
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-primary border-primary/20">
                Challenge Complete
              </Badge>
              <h1 className="text-2xl font-black uppercase text-foreground">
                {pool?.title}
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Your performance has been evaluated & recorded on the pool standings.
              </p>
            </div>

            {/* Score Metrics */}
            <div className="grid grid-cols-3 gap-2 p-4 bg-slate-50 rounded-2xl border border-primary/5">
              <div>
                <span className="text-[9px] font-black uppercase text-muted-foreground block">Score</span>
                <span className="text-xl font-black text-foreground">{result.score} / {result.totalQuestions}</span>
              </div>
              <div className="border-x border-primary/10">
                <span className="text-[9px] font-black uppercase text-muted-foreground block">Time</span>
                <span className="text-xl font-black text-foreground">{formatTimer(result.timeTakenSeconds)}</span>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-muted-foreground block">Current Rank</span>
                <span className="text-xl font-black text-primary">#{result.rank}</span>
              </div>
            </div>

            {result.prizeWon > 0 && (
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 font-bold text-xs">
                🎉 Congratulations! Estimated Prize: <strong className="text-sm font-black text-emerald-700">₹{result.prizeWon}</strong>
              </div>
            )}

            <Link href={`/pools/${poolId}`}>
              <Button className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2">
                View Pool Standings & Leaderboard <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <main className="flex-grow mx-auto px-4 md:px-6 py-6 w-full max-w-4xl space-y-4 animate-in fade-in duration-500">
        {/* Arena Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0">
            <h1 className="text-lg md:text-xl font-black text-foreground tracking-tight leading-none uppercase">
              {pool?.title}
            </h1>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest opacity-60">
              {pool?.category} • Official Arena Session
            </p>
          </div>

          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
            <Clock className="w-3.5 h-3.5 animate-spin text-primary" />
            <span>{formatTimer(timeElapsed)}</span>
          </div>
        </div>

        {/* Live Proctor Bar */}
        {isQuizActive && (
          <QuizProctorBar
            violationCount={proctor.violationCount}
            maxViolations={2}
            isFullscreen={proctor.isFullscreen}
            onToggleFullscreen={proctor.toggleFullscreen}
          />
        )}

        {/* Question Card */}
        <Card className="rounded-xl border border-primary/5 shadow-sm bg-white overflow-hidden select-none">
          <CardHeader className="border-b border-primary/5 bg-primary/[0.01] p-3 md:p-4">
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary/60" />
                </div>
                <CardTitle className="text-sm font-black text-foreground">
                  Question [{currentIndex + 1}/{questions.length}]
                </CardTitle>
              </div>
              <Badge variant="secondary" className="bg-primary/5 text-primary/60 text-[8px] font-black uppercase px-2 py-0.5 border-none">
                {pool?.category}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <h2 className="text-sm md:text-base font-bold text-foreground leading-snug tracking-tight">
                  {currentQuestion?.question}
                </h2>

                <RadioGroup value={selectedOption} onValueChange={handleOptionSelect} className="grid grid-cols-1 gap-2">
                  {currentQuestion &&
                    Object.entries(currentQuestion.options).map(([key, value]) => (
                      <div key={key} className="relative">
                        <RadioGroupItem value={key} id={key} className="peer sr-only" />
                        <Label
                          htmlFor={key}
                          className="flex items-center p-2.5 md:p-3 border border-primary/5 rounded-xl cursor-pointer bg-slate-50/50 hover:bg-primary/[0.02] hover:border-primary/20 peer-data-checked:border-primary peer-data-checked:bg-primary/[0.03] transition-all group"
                        >
                          <span className="w-6 h-6 rounded-lg bg-white border border-primary/10 flex items-center justify-center mr-3 text-[10px] font-black text-muted-foreground peer-data-checked:bg-primary peer-data-checked:text-white peer-data-checked:border-primary transition-all shadow-xs shrink-0">
                            {key}
                          </span>
                          <span className="text-xs md:text-sm text-foreground font-semibold group-hover:text-primary transition-colors leading-tight flex-grow">
                            {value}
                          </span>
                        </Label>
                      </div>
                    ))}
                </RadioGroup>

                <div className="flex gap-2 pt-2 border-t border-primary/5">
                  {currentIndex > 0 && (
                    <Button
                      variant="ghost"
                      onClick={() => setCurrentIndex((prev) => prev - 1)}
                      className="flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-wider"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back
                    </Button>
                  )}
                  <Button
                    onClick={handleNext}
                    disabled={submitting || !selectedOption}
                    className="flex-[2] bg-primary hover:bg-primary/90 text-white rounded-xl h-10 text-xs font-black shadow-lg shadow-primary/10 transition-all uppercase tracking-widest gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : currentIndex < questions.length - 1 ? (
                      <>Next Step <ChevronRight className="w-4 h-4" /></>
                    ) : (
                      <>Submit Final Challenge</>
                    )}
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </main>

      {/* Cheating Warning Modal (Strike 1 of 2) */}
      <QuizWarningModal
        open={proctor.isWarningOpen}
        onClose={proctor.closeWarning}
        reason={proctor.violationLogs[proctor.violationLogs.length - 1]?.reason}
      />

      {/* Cheating Termination Modal (Strike 2 of 2 - Conclude & Score) */}
      <QuizTerminatedModal
        open={showTerminatedModal}
        score={result?.score || 0}
        total={result?.totalQuestions || questions.length}
        pointsEarned={result?.xpEarned || 0}
        reason={terminatedReason}
        onReview={() => {
          setShowTerminatedModal(false);
          router.push(`/pools/${poolId}`);
        }}
      />
    </div>
  );
}
