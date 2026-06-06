"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, Sparkles, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  day: string;
  category: string;
  difficulty: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

export default function QuestionCard() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<{ day: string, selectedAnswer: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/attempts");
      const data = await res.json();
      if (data.attempted) {
        setResult(data);
        setLoading(false);
      } else {
        fetchQuestions();
      }
    } catch (error) {
      toast.error("Failed to load today's challenge");
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/questions/today");
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setQuestions(Array.isArray(data) ? data : [data]);
      }
    } catch (error) {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const selectedOption = userAnswers.find(a => a.day === currentQuestion?.day)?.selectedAnswer || "";

  const handleOptionSelect = (val: string) => {
    setUserAnswers(prev => {
      const filtered = prev.filter(a => a.day !== currentQuestion.day);
      return [...filtered, { day: currentQuestion.day, selectedAnswer: val }];
    });
  };

  const handleNext = () => {
    if (!selectedOption) {
      toast.error("Please select an answer");
      return;
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: userAnswers }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setResult(data);
        if (data.correct) {
          toast.success(`Excellent! +${data.totalPointsEarned} points`);
        } else {
          toast.error("Some answers were incorrect. Keep learning!");
        }
      }
    } catch (error) {
      toast.error("Failed to submit answers");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="rounded-2xl border-primary/5 shadow-sm bg-white/50 backdrop-blur-sm h-64 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </Card>
    );
  }

  if (questions.length === 0 && !result) {
    return (
      <Card className="rounded-2xl border-primary/5 shadow-sm bg-white/50 backdrop-blur-sm p-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">Check back later for today&apos;s challenge!</p>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-primary/5 shadow-md bg-white overflow-hidden">
      <CardHeader className="border-b border-primary/5 bg-primary/[0.02] p-4 md:p-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="space-y-0.5">
              <CardTitle className="text-sm md:text-base font-black text-foreground">
                Daily Challenge {questions.length > 1 && `(${currentIndex + 1}/${questions.length})`}
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] font-bold px-2 py-0 h-4 border-none">
                  {currentQuestion?.category || result?.results?.[0]?.category || "General"}
                </Badge>
                <Badge variant="outline" className="border-primary/10 text-muted-foreground text-[10px] font-bold px-2 py-0 h-4">
                  {currentQuestion?.difficulty || "Medium"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Day {currentQuestion?.day || result?.results?.[0]?.day || "01"}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 md:p-6">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div 
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <p className="text-sm md:text-base text-foreground font-bold leading-relaxed px-1">
                {currentQuestion?.question}
              </p>

              <RadioGroup 
                value={selectedOption} 
                onValueChange={handleOptionSelect}
                className="grid gap-2"
              >
                {currentQuestion && Object.entries(currentQuestion.options).map(([key, value]) => (
                  <div key={key}>
                    <RadioGroupItem value={key} id={key} className="peer sr-only" />
                    <Label
                      htmlFor={key}
                      className="flex items-center p-3 border border-primary/5 rounded-xl cursor-pointer hover:bg-primary/[0.02] peer-data-checked:border-primary peer-data-checked:bg-primary/[0.03] transition-all group"
                    >
                      <span className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center mr-3 text-xs font-black text-muted-foreground peer-data-checked:bg-primary peer-data-checked:text-white transition-colors">
                        {key}
                      </span>
                      <span className="text-xs md:text-sm text-foreground font-semibold group-hover:text-primary transition-colors">{value}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex gap-3">
                {currentIndex > 0 && (
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentIndex(prev => prev - 1)}
                    className="flex-1 border-primary/10 h-12 text-sm font-bold"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                )}
                <Button 
                  onClick={handleNext} 
                  disabled={submitting || !selectedOption}
                  className="flex-[2] bg-primary hover:bg-primary/90 text-white rounded-xl h-12 text-sm font-bold shadow-lg shadow-primary/10 transition-all active:scale-[0.98]"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : currentIndex < questions.length - 1 ? (
                    <>Next Question <ChevronRight className="w-4 h-4 ml-1" /></>
                  ) : (
                    "Submit Final Answers"
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="text-center py-2">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${result.correct ? "bg-emerald-100 text-emerald-600" : "bg-destructive/10 text-destructive"}`}>
                  {result.correct ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                </div>
                <h3 className="text-lg font-black text-foreground mb-1">
                  {result.correct ? "Challenge Completed!" : "Good effort, keep it up!"}
                </h3>
                <p className="text-xs text-muted-foreground font-medium px-4">
                  You earned <span className="text-primary font-bold">+{result.pointsEarned || result.totalPointsEarned}</span> points today.
                </p>
              </div>

              <div className="space-y-4">
                {result.results?.map((res: any, i: number) => (
                  <div key={i} className="bg-muted/50 rounded-xl p-4 border border-primary/5">
                    <div className="flex items-center gap-2 mb-2">
                      {res.correct ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-destructive" />}
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Question {i + 1} Analysis</h4>
                    </div>
                    <p className="text-xs text-foreground font-medium leading-relaxed">
                      {res.explanation}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic pt-2">
                New challenge arrives in 24 hours
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
