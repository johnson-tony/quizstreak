"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react";
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
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string>("");
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
        fetchQuestion();
      }
    } catch (error) {
      toast.error("Failed to load today's challenge");
      setLoading(false);
    }
  };

  const fetchQuestion = async () => {
    try {
      const res = await fetch("/api/questions/today");
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setQuestion(data);
      }
    } catch (error) {
      toast.error("Failed to load question");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOption) {
      toast.error("Please select an answer");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedAnswer: selectedOption }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setResult(data);
        if (data.correct) {
          toast.success("Correct answer! +" + data.pointsEarned + " points");
        } else {
          toast.error("Incorrect answer. Better luck tomorrow!");
        }
      }
    } catch (error) {
      toast.error("Failed to submit answer");
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

  if (!question && !result) {
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
              <CardTitle className="text-sm md:text-base font-black text-foreground">Today&apos;s Challenge</CardTitle>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] font-bold px-2 py-0 h-4 border-none">
                  {question?.category || result?.category || "General"}
                </Badge>
                <Badge variant="outline" className="border-primary/10 text-muted-foreground text-[10px] font-bold px-2 py-0 h-4">
                  {question?.difficulty || result?.difficulty || "Medium"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Day {question?.day || result?.day || "01"}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {!result ? (
          <div className="space-y-6">
            <p className="text-sm md:text-base text-foreground font-bold leading-relaxed px-1">
              {question?.question}
            </p>

            <RadioGroup 
              value={selectedOption} 
              onValueChange={setSelectedOption}
              className="grid gap-2"
            >
              {question && Object.entries(question.options).map(([key, value]) => (
                <div key={key}>
                  <RadioGroupItem value={key} id={key} className="peer sr-only" />
                  <Label
                    htmlFor={key}
                    className="flex items-center p-3 border border-primary/5 rounded-xl cursor-pointer hover:bg-primary/[0.02] peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/[0.03] transition-all group"
                  >
                    <span className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center mr-3 text-xs font-black text-muted-foreground peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white transition-colors">
                      {key}
                    </span>
                    <span className="text-xs md:text-sm text-foreground font-semibold group-hover:text-primary transition-colors">{value}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <Button 
              onClick={handleSubmit} 
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12 text-sm font-bold shadow-lg shadow-primary/10 transition-all active:scale-[0.98]"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Submit Answer"}
            </Button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-2"
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${result.correct ? "bg-emerald-100 text-emerald-600" : "bg-destructive/10 text-destructive"}`}>
              {result.correct ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            </div>
            <h3 className="text-lg font-black text-foreground mb-1">
              {result.correct ? "Great Job!" : "Not quite, keep learning!"}
            </h3>
            <p className="text-xs text-muted-foreground font-medium mb-6 px-4">
              {result.correct 
                ? `You earned ${result.pointsEarned} points and secured your streak.` 
                : "The correct answer was " + result.correctAnswer + ". Check the explanation below."}
            </p>

            <div className="bg-muted/50 rounded-xl p-4 text-left mb-6 border border-primary/5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Analysis</h4>
              <p className="text-xs text-foreground font-medium leading-relaxed">
                {result.explanation}
              </p>
            </div>

            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">
              New challenge arrives in 24 hours
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
