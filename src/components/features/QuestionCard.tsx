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

        <div className="pt-4 space-y-4">
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
          Note: After payment, please allow up to 24 hours for our team to verify and unlock your account.
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
    <Card className="rounded-2xl border-primary/5 shadow-md bg-white overflow-hidden">
      <CardHeader className="border-b border-primary/5 bg-primary/[0.02] p-4 md:p-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="space-y-0.5">
              <CardTitle className="text-sm md:text-base font-black text-foreground">
                Challenge Set #{result ? (result.newSet - 1 || questions[0]?.set) : (questions[0]?.set || "1")}
                {!result && questions.length > 1 && ` (${currentIndex + 1}/${questions.length})`}
              </CardTitle>
              {!result && (
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] font-bold px-2 py-0 h-4 border-none">
                    {currentQuestion?.category || "General"}
                  </Badge>
                  <Badge variant="outline" className="border-primary/10 text-muted-foreground text-[10px] font-bold px-2 py-0 h-4">
                    {currentQuestion?.difficulty || "Medium"}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <div className="text-right flex items-center gap-3">
            {result && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={downloadPDF}
                className="h-8 px-2 text-primary hover:bg-primary/5 font-bold text-[10px]"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> EXPORT PDF
              </Button>
            )}
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              {currentQuestion?.day || "Review"}
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

              <RadioGroup value={selectedOption} onValueChange={handleOptionSelect} className="grid gap-2">
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
                  <Button variant="outline" onClick={() => setCurrentIndex(prev => prev - 1)} className="flex-1 border-primary/10 h-12 text-sm font-bold">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                )}
                <Button 
                  onClick={handleNext} 
                  disabled={submitting || !selectedOption}
                  className="flex-[2] bg-primary hover:bg-primary/90 text-white rounded-xl h-12 text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
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
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="text-center py-2">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${result.correct ? "bg-emerald-100 text-emerald-600" : "bg-destructive/10 text-destructive"}`}>
                  {result.correct ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                </div>
                <h3 className="text-lg font-black text-foreground mb-1">{result.correct ? "Excellent Work!" : "Set Complete!"}</h3>
                <p className="text-xs text-muted-foreground font-medium">You earned <span className="text-primary font-bold">+{result.totalPointsEarned}</span> points today.</p>
              </div>

              <div className="space-y-4">
                {result.results?.map((res: any, i: number) => {
                  const q = questions.find(quest => quest.day === res.day);
                  return (
                    <div key={i} className="bg-muted/50 rounded-xl p-4 border border-primary/5">
                      <div className="flex items-center gap-2 mb-3">
                        {res.correct ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-destructive" />}
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Question {i + 1}</h4>
                      </div>
                      <p className="text-xs text-foreground font-bold mb-3 leading-relaxed">{q?.question}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {q && Object.entries(q.options).map(([key, value]) => (
                          <div key={key} className={`px-2 py-1 rounded-md border text-[10px] font-medium flex items-center gap-1.5 ${key === res.correctAnswer ? "bg-emerald-50 border-emerald-200 text-emerald-700" : key === res.selectedAnswer && !res.correct ? "bg-destructive/5 border-destructive/20 text-destructive" : "bg-white border-primary/5 text-muted-foreground opacity-60"}`}>
                            <span className={`w-4 h-4 rounded flex items-center justify-center font-black ${key === res.correctAnswer ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}>{key}</span>
                            {value}
                          </div>
                        ))}
                      </div>
                      <div className="bg-white/50 rounded-lg p-3 border border-primary/5">
                        <h5 className="text-[9px] font-black uppercase tracking-widest text-primary/60 mb-1.5">Analysis</h5>
                        <p className="text-[11px] text-foreground font-medium leading-relaxed">{res.explanation}</p>
                        <div className="mt-2 text-[10px] font-bold"><span className="text-muted-foreground">Correct Answer: </span><span className="text-emerald-600 font-black">{res.correctAnswer}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic pt-2">
                Come back tomorrow for Set #{result.newSet || (questions[0]?.set ? parseInt(questions[0]?.set) + 1 : 2)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
