"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Download,
  Crown,
  Lock,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Question {
  day: string;
  set: string;
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
  const [paywall, setPaywall] = useState<{ enabled: boolean, upiLink: string }>({ enabled: false, upiLink: "" });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
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
      toast.error("Failed to load your progress");
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/questions/today");
      const data = await res.json();
      if (data.requiresSubscription) {
        setPaywall({ enabled: true, upiLink: data.upiLink });
      } else if (data.error) {
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
          toast.success(`Excellent! Challenge Set #${data.newSet - 1} Complete`);
        } else {
          toast.error("Some answers were incorrect. Set complete!");
        }
      }
    } catch (error) {
      toast.error("Failed to submit answers");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString();
    
    doc.setFontSize(20);
    doc.setTextColor(122, 31, 77); 
    doc.text("QuizStreak Daily Challenge Report", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${today}`, 14, 30);
    doc.text(`Overall Result: ${result.correct ? "PASSED" : "REVIEW NEEDED"}`, 14, 35);

    const tableData = result.results.map((res: any, index: number) => {
      const q = questions.find(quest => quest.day === res.day);
      return [
        index + 1,
        q?.question || "Question " + res.day,
        res.selectedAnswer,
        res.correctAnswer,
        res.correct ? "Correct" : "Incorrect",
        res.explanation
      ];
    });

    autoTable(doc, {
      startY: 45,
      head: [['#', 'Question', 'Your Answer', 'Correct', 'Status', 'Explanation']],
      body: tableData,
      headStyles: { fillColor: [122, 31, 77] },
      columnStyles: {
        1: { cellWidth: 50 },
        5: { cellWidth: 60 },
      },
      theme: 'grid'
    });

    doc.save(`QuizStreak_Result_Set_${questions[0]?.set || "Unknown"}.pdf`);
    toast.success("Result PDF downloaded!");
  };

  if (loading) {
    return (
      <Card className="rounded-2xl border-primary/5 shadow-sm bg-white/50 backdrop-blur-sm h-64 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </Card>
    );
  }

  if (paywall.enabled) {
    return (
      <Card className="rounded-[2.5rem] border-primary/10 shadow-2xl bg-white overflow-hidden p-8 md:p-12 text-center space-y-8 animate-in zoom-in duration-500">
        <div className="mx-auto w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center relative">
          <Lock className="w-10 h-10 text-amber-600" />
          <div className="absolute -top-1 -right-1 bg-white p-1.5 rounded-full shadow-lg border border-amber-100">
            <Crown className="w-5 h-5 text-amber-500" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-foreground tracking-tight">Free Limit Reached</h2>
          <p className="text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">
            You&apos;ve completed the free trial sets! To continue your streak and access daily challenges, please subscribe to our Pro plan.
          </p>
        </div>

        <div className="pt-3 space-y-2">
          <Button 
            onClick={() => window.open(paywall.upiLink, '_blank')}
            className="w-full h-16 rounded-2xl text-xl font-black shadow-xl shadow-amber-200 bg-amber-500 hover:bg-amber-600 gap-3 group"
          >
            Get Unlimited Access
            <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Button>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
            Redirects to UPI payment link
          </p>
        </div>

        <div className="p-4 bg-muted/50 rounded-2xl text-xs font-bold text-muted-foreground leading-relaxed">
          Note: After payment, please allow up to  10 mins for our team to verify and unlock your account.
        </div>
      </Card>
    );
  }

  if (questions.length === 0 && !result) {
    return (
      <Card className="rounded-2xl border-primary/5 shadow-sm bg-white/50 backdrop-blur-sm p-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">Check back tomorrow for the next challenge set!</p>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-primary/5 shadow-sm bg-white overflow-hidden">
      <CardHeader className="border-b border-primary/5 bg-primary/[0.01] p-3 md:p-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary/60" />
            </div>
            <div className="space-y-0">
              <CardTitle className="text-sm font-black text-foreground">
                Set #{result ? (result.newSet - 1 || questions[0]?.set) : (questions[0]?.set || "1")}
                {!result && questions.length > 1 && (
                  <span className="text-primary/40 ml-1.5 text-xs font-bold">[{currentIndex + 1}/{questions.length}]</span>
                )}
              </CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {result && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={downloadPDF}
                className="h-7 px-2 text-primary/60 hover:bg-primary/5 font-black text-[8px] uppercase tracking-widest"
              >
                <Download className="w-3 h-3 mr-1" /> PDF
              </Button>
            )}
            <Badge variant="secondary" className="bg-primary/5 text-primary/60 text-[8px] font-black uppercase tracking-tighter px-1.5 py-0 h-4 border-none">
              {currentQuestion?.category || "General"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 md:p-6">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div 
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 md:space-y-6"
            >
              <h2 className="text-sm md:text-base font-bold text-foreground leading-snug tracking-tight">
                {currentQuestion?.question}
              </h2>

              <RadioGroup value={selectedOption} onValueChange={handleOptionSelect} className="grid grid-cols-1 gap-1.5">
                {currentQuestion && Object.entries(currentQuestion.options).map(([key, value]) => (
                  <div key={key} className="relative">
                    <RadioGroupItem value={key} id={key} className="peer sr-only" />
                    <Label
                      htmlFor={key}
                      className="flex items-center p-2.5 md:p-3 border border-primary/5 rounded-lg cursor-pointer bg-slate-50/50 hover:bg-primary/[0.02] hover:border-primary/20 peer-data-checked:border-primary peer-data-checked:bg-primary/[0.03] transition-all group"
                    >
                      <span className="w-6 h-6 rounded bg-white border border-primary/5 flex items-center justify-center mr-3 text-[10px] font-black text-muted-foreground peer-data-checked:bg-primary peer-data-checked:text-white peer-data-checked:border-primary transition-all shadow-xs">
                        {key}
                      </span>
                      <span className="text-xs md:text-sm text-foreground font-semibold group-hover:text-primary transition-colors leading-tight flex-grow">{value}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex gap-2 pt-1">
                {currentIndex > 0 && (
                  <Button variant="ghost" onClick={() => setCurrentIndex(prev => prev - 1)} className="flex-1 h-9 rounded-lg text-[10px] font-black border border-transparent hover:bg-primary/5 hover:text-primary transition-all uppercase tracking-widest">
                    <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back
                  </Button>
                )}
                <Button 
                  onClick={handleNext} 
                  disabled={submitting || !selectedOption}
                  className="flex-[2] bg-primary hover:bg-primary/90 text-white rounded-lg h-9 md:h-10 text-[10px] md:text-xs font-black shadow-lg shadow-primary/10 transition-all active:scale-[0.98] uppercase tracking-widest gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : currentIndex < questions.length - 1 ? (
                    <>Next Step <ChevronRight className="w-3.5 h-3.5" /></>
                  ) : (
                    <>Complete Challenge</>
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="text-center space-y-2 py-1">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${result.correct ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-destructive/5 text-destructive border border-destructive/10"}`}>
                  {result.correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
                <div className="space-y-0">
                  <h3 className="text-sm font-black text-foreground tracking-tight">Mission Success</h3>
                  <p className="text-[10px] text-muted-foreground font-bold">
                    Earned <span className="text-primary">+{result.totalPointsEarned} XP</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {result.results?.map((res: any, i: number) => {
                  const q = questions.find(quest => quest.day === res.day);
                  return (
                    <div key={i} className="bg-slate-50/50 rounded-lg p-3 md:p-4 border border-primary/5">
                      <div className="flex items-center gap-1.5 mb-2">
                        {res.correct ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-destructive" />}
                        <h4 className="text-[8px] font-black uppercase tracking-widest text-primary/40">Step {i + 1}</h4>
                      </div>

                      <p className="text-xs font-bold text-foreground mb-3 leading-tight tracking-tight">{q?.question}</p>
                      
                      <div className="grid grid-cols-1 gap-1.5 mb-3">
                        {q && Object.entries(q.options).map(([key, value]) => {
                          const isCorrect = key === res.correctAnswer;
                          const isSelected = key === res.selectedAnswer;
                          const isError = isSelected && !res.correct;

                          return (
                            <div key={key} className={`p-2 rounded-lg border flex items-center gap-2.5 transition-all ${isCorrect ? "bg-emerald-50/50 border-emerald-500/20 text-emerald-900" : isError ? "bg-destructive/5 border-destructive/20 text-destructive" : "bg-white border-primary/5 text-muted-foreground/50 opacity-60"}`}>
                              <span className={`w-5 h-5 rounded flex items-center justify-center font-black text-[10px] ${isCorrect ? "bg-emerald-500 text-white" : isError ? "bg-destructive text-white" : "bg-muted text-muted-foreground"}`}>{key}</span>
                              <span className="text-[10px] font-bold leading-tight">{value}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-white/50 rounded-lg p-2.5 border border-primary/5">
                        <p className="text-[10px] text-foreground/70 font-medium leading-tight">{res.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center opacity-30">
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                  Cycle Complete • Next Set in 24h
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
