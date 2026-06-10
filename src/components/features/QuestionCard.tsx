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
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";

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
  
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [showDetailedResults, setShowDetailedResults] = useState(false);

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
        setShowDetailedResults(true);
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
        body: JSON.stringify({ answers: userAnswers, type: 'daily' }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setResult(data);
        setShowResultPopup(true);
        
        // Trigger celebration
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#7A1F4D', '#E2E8F0', '#10B981']
        });
      }
    } catch (error) {
      toast.error("Failed to submit answers");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const score = result.results.filter((r: any) => r.correct).length;
    const total = result.results.length;
    
    // Header Title
    doc.setFontSize(12);
    doc.setTextColor(122, 31, 77); 
    doc.text("QuizStreak Daily Challenge Report", 14, 20);
    
    // Sub-header details
    doc.setFontSize(7);
    doc.setTextColor(100);
    doc.text(`Date: ${today}`, 14, 25);
    doc.text(`Final Score: ${score} / ${total}`, 14, 29);

    const tableData = result.results.map((res: any, index: number) => {
      const q = questions.find(quest => quest.day === res.day) || res;
      
      const getOptionText = (key: string) => {
        if (!q || !q.options || !key) return key;
        const text = q.options[key as keyof typeof q.options];
        return text ? `${key}) ${text}` : key;
      };

      return [
        index + 1,
        q?.question || "Question " + res.day,
        getOptionText(res.selectedAnswer),
        getOptionText(res.correctAnswer),
        res.correct ? "Pass" : "Fail",
        res.explanation
      ];
    });

    autoTable(doc, {
      startY: 34,
      head: [['#', 'Question', 'Your Answer', 'Correct Answer', 'Status', 'Explanation']],
      body: tableData,
      headStyles: { 
        fillColor: [122, 31, 77],
        fontSize: 6,
        halign: 'center',
        minCellHeight: 6
      },
      bodyStyles: {
        fontSize: 6,
        valign: 'top'
      },
      columnStyles: {
        0: { cellWidth: 7, halign: 'center' },
        1: { cellWidth: 48 },
        2: { cellWidth: 35 },
        3: { cellWidth: 35 },
        4: { cellWidth: 10, halign: 'center', textColor: [100, 100, 100] },
        5: { cellWidth: 47 },
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 4) {
          if (data.cell.raw === 'Pass') {
            data.cell.styles.textColor = [16, 185, 129];
            data.cell.styles.fontStyle = 'bold';
          } else if (data.cell.raw === 'Fail') {
            data.cell.styles.textColor = [239, 68, 68];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      theme: 'grid',
      styles: {
        cellPadding: 1.5,
        lineColor: [230, 230, 230],
        lineWidth: 0.1,
      }
    });

    doc.save(`QuizStreak_Report_${new Date().toISOString().split('T')[0]}.pdf`);
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
          <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">
            Redirects to UPI payment link
          </p>
        </div>

        <div className="p-4 bg-muted/50 rounded-2xl text-xs font-bold text-muted-foreground leading-relaxed">
          Note: After payment, please allow up to 10 mins for our team to verify and unlock your account.
        </div>
      </Card>
    );
  }

  if (showDetailedResults && result) {
    return (
      <div className="space-y-4 animate-in fade-in duration-500">
        <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-xl border border-primary/10 overflow-hidden relative">
          {/* Exam Header */}
          <div className="bg-slate-50/80 border-b border-primary/10 px-4 md:px-6 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="text-center md:text-left">
               <div className="flex items-center gap-3 justify-center md:justify-start">
                 <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-foreground">Challenge Report</h2>
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={downloadPDF}
                   className="h-7 px-2 rounded-md text-primary hover:bg-primary/5 font-black text-[9px] uppercase tracking-widest shadow-sm"
                 >
                   <Download className="w-3 h-3 mr-1" /> PDF
                 </Button>
               </div>
               <p className="text-xs md:text-xs text-muted-foreground font-bold tracking-widest uppercase mt-1">Official Result Document</p>
             </div>
             <div className="text-center md:text-right">
               <div className="text-xl md:text-2xl font-black text-primary">{result.results.filter((r: any) => r.correct).length} / {result.results.length}</div>
               <p className="text-xs md:text-xs text-muted-foreground font-bold tracking-widest uppercase mt-1">Score</p>
             </div>
          </div>

          <div className="divide-y divide-primary/10">
            {result.results?.map((res: any, i: number) => {
              const q = res.question ? res : (questions.find(quest => quest.day === res.day) || res);
              
              const correctValue = q.options ? q.options[res.correctAnswer as keyof typeof q.options] : "Correct Answer";
              const selectedValue = q.options ? q.options[res.selectedAnswer as keyof typeof q.options] : "Your Answer";

              return (
                <div key={i} className="p-4 hover:bg-slate-50/30 transition-colors">
                  <div className="flex gap-3 md:gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      {res.correct ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-destructive" />}
                    </div>
                    
                    <div className="flex-grow space-y-1">
                      <p className="text-sm md:text-base font-bold text-foreground leading-snug">
                        <span className="text-muted-foreground/50 mr-2">{i + 1}.</span>
                        {q?.question || "Question " + res.day}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 pl-1 md:pl-6">
                        {q?.options ? Object.entries(q.options).map(([key, value]) => {
                          const isCorrect = key === res.correctAnswer;
                          const isSelected = key === res.selectedAnswer;
                          const isError = isSelected && !res.correct;

                          let bgColor = "bg-muted/10 text-muted-foreground";
                          let badgeColor = "bg-white border-primary/10 text-muted-foreground";
                          
                          if (isCorrect) {
                            bgColor = "bg-emerald-50 text-emerald-900 border border-emerald-500/30";
                            badgeColor = "bg-emerald-500 text-white border-transparent shadow-sm";
                          } else if (isError) {
                            bgColor = "bg-destructive/5 text-destructive border border-destructive/20";
                            badgeColor = "bg-destructive text-white border-transparent shadow-sm";
                          }

                          return (
                            <div key={key} className={`flex items-start gap-2 p-1.5 md:p-2 rounded-md transition-all ${bgColor}`}>
                              <span className={`w-4 h-4 md:w-5 md:h-5 rounded flex items-center justify-center font-black text-[9px] md:text-xs shrink-0 mt-0.5 ${badgeColor}`}>{key}</span>
                              <span className="text-[11px] md:text-xs font-semibold leading-snug mt-0.5">{value as string}</span>
                            </div>
                          );
                        }) : (
                          // Fallback if options aren't available
                          <div className="space-y-1.5">
                            <div className="flex items-start gap-2 p-1.5 md:p-2 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-500/30">
                               <span className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5">{res.correctAnswer}</span>
                               <span className="text-[11px] font-semibold leading-snug mt-0.5">Correct Answer</span>
                            </div>
                            {!res.correct && (
                              <div className="flex items-start gap-2 p-1.5 md:p-2 rounded-md bg-destructive/5 text-destructive border border-destructive/20">
                                 <span className="w-4 h-4 rounded bg-destructive text-white flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5">{res.selectedAnswer}</span>
                                 <span className="text-[11px] font-semibold leading-snug mt-0.5">Your Answer</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="bg-primary/[0.02] rounded-md p-2 border border-primary/5 ml-1 md:ml-6 mt-1">
                        <p className="text-[11px] md:text-xs text-foreground/80 font-medium leading-relaxed">
                          <strong className="text-primary font-black mr-2 uppercase tracking-widest text-[9px]">Explanation</strong> 
                          {res.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center py-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-muted-foreground font-black text-xs uppercase tracking-widest">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
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
    <>
      <Card className="rounded-xl border border-primary/5 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-primary/5 bg-primary/[0.01] p-3 md:p-4">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary/60" />
              </div>
              <div className="space-y-0">
                <CardTitle className="text-sm font-black text-foreground">
                  Set #{questions[0]?.set || "1"}
                  {questions.length > 1 && (
                    <span className="text-primary/40 ml-1.5 text-xs font-bold">[{currentIndex + 1}/{questions.length}]</span>
                  )}
                </CardTitle>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/5 text-primary/60 text-[8px] font-black uppercase tracking-tighter px-1.5 py-0 h-4 border-none">
                {currentQuestion?.category || "General"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-3">
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

              <RadioGroup value={selectedOption} onValueChange={handleOptionSelect} className="grid grid-cols-1 gap-1.5">
                {currentQuestion && Object.entries(currentQuestion.options).map(([key, value]) => (
                  <div key={key} className="relative">
                    <RadioGroupItem value={key} id={key} className="peer sr-only" />
                    <Label
                      htmlFor={key}
                      className="flex items-center p-2 md:p-2.5 border border-primary/5 rounded-lg cursor-pointer bg-slate-50/50 hover:bg-primary/[0.02] hover:border-primary/20 peer-data-checked:border-primary peer-data-checked:bg-primary/[0.03] transition-all group"
                    >
                      <span className="w-5 h-5 rounded bg-white border border-primary/5 flex items-center justify-center mr-3 text-[9px] font-black text-muted-foreground peer-data-checked:bg-primary peer-data-checked:text-white peer-data-checked:border-primary transition-all shadow-xs shrink-0">
                        {key}
                      </span>
                      <span className="text-[11px] md:text-sm text-foreground font-semibold group-hover:text-primary transition-colors leading-tight flex-grow">{value}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex gap-2 pt-0.5">
                {currentIndex > 0 && (
                  <Button variant="ghost" onClick={() => setCurrentIndex(prev => prev - 1)} className="flex-1 h-8 rounded-lg text-[9px] font-black border border-transparent hover:bg-primary/5 hover:text-primary transition-all uppercase tracking-widest">
                    <ChevronLeft className="w-3 h-3 mr-1" /> Back
                  </Button>
                )}
                <Button 
                  onClick={handleNext} 
                  disabled={submitting || !selectedOption}
                  className="flex-[2] bg-primary hover:bg-primary/90 text-white rounded-lg h-8 md:h-9 text-[9px] md:text-xs font-black shadow-lg shadow-primary/10 transition-all active:scale-[0.98] uppercase tracking-widest gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : currentIndex < questions.length - 1 ? (
                    <>Next Step <ChevronRight className="w-3 h-3" /></>
                  ) : (
                    <>Complete Challenge</>
                  )}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      <Dialog open={showResultPopup} onOpenChange={setShowResultPopup}>
        <DialogContent className="sm:max-w-md text-center p-8 rounded-[2rem] border-primary/10 shadow-2xl">
          <DialogTitle className="sr-only">Challenge Complete</DialogTitle>
          <div className="mx-auto w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-4 relative">
             <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-20" />
             <Trophy className="w-12 h-12 text-primary" />
          </div>
          <div className="space-y-2">
             <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
               Set Complete!
             </h2>
             <p className="text-sm font-bold text-muted-foreground leading-relaxed">
               {result?.correct 
                 ? "Excellent work! You've mastered today's challenges." 
                 : "Great effort! Consistency is the key to mastery. Keep it up!"}
             </p>
             <div className="pt-2">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">XP EARNED</p>
               <div className="text-3xl font-black text-foreground">+{result?.totalPointsEarned} XP</div>
             </div>
          </div>
          <Button 
            className="w-full mt-8 h-12 rounded-xl text-xs font-black shadow-lg shadow-primary/20 gap-2 uppercase tracking-widest transition-all active:scale-[0.98] bg-primary hover:bg-primary/90 text-white"
            onClick={() => {
              setShowResultPopup(false);
              setShowDetailedResults(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Review Performance <ChevronRight className="w-4 h-4" />
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
