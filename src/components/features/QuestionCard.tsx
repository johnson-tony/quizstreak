"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
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
      <Card className="rounded-[24px] border-none shadow-sm bg-white/70 backdrop-blur-md h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </Card>
    );
  }

  if (!question && !result) {
    return (
      <Card className="rounded-[24px] border-none shadow-sm bg-white/70 backdrop-blur-md p-12 text-center">
        <p className="text-gray-500">No challenge available for today. Check back later!</p>
      </Card>
    );
  }

  return (
    <Card className="rounded-[24px] border-none shadow-lg bg-white/72 backdrop-blur-xl overflow-hidden">
      <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold">Today&apos;s Challenge</CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none rounded-lg px-3">
                {question?.category || result?.category || "General"}
              </Badge>
              <Badge variant="outline" className="border-gray-200 text-gray-500 rounded-lg px-3">
                {question?.difficulty || result?.difficulty || "Medium"}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-gray-400">Day {question?.day || "01"}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-8 pb-10 px-8">
        {!result ? (
          <div className="space-y-8">
            <p className="text-lg text-gray-800 font-medium leading-relaxed">
              {question?.question}
            </p>

            <RadioGroup 
              value={selectedOption} 
              onValueChange={setSelectedOption}
              className="grid gap-4"
            >
              {question && Object.entries(question.options).map(([key, value]) => (
                <div key={key}>
                  <RadioGroupItem value={key} id={key} className="peer sr-only" />
                  <Label
                    htmlFor={key}
                    className="flex items-center p-4 border border-gray-200 rounded-2xl cursor-pointer hover:bg-blue-50/50 hover:border-blue-200 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50/50 transition-all"
                  >
                    <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-4 text-sm font-bold text-gray-500 peer-data-[state=checked]:bg-blue-600 peer-data-[state=checked]:text-white">
                      {key}
                    </span>
                    <span className="text-gray-700 font-medium">{value}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <Button 
              onClick={handleSubmit} 
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 text-lg font-bold shadow-lg shadow-blue-100"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Submit Answer"}
            </Button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${result.correct ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
              {result.correct ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {result.correct ? "Excellent Work!" : "Not quite right"}
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {result.correct 
                ? `You earned ${result.pointsEarned} points and kept your streak alive!` 
                : "The correct answer was " + result.correctAnswer + ". Check the explanation below to learn."}
            </p>

            <div className="bg-gray-50 rounded-2xl p-6 text-left mb-8 border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-2">Explanation</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {result.explanation}
              </p>
            </div>

            <Button disabled className="w-full bg-gray-100 text-gray-400 rounded-2xl h-14 font-bold border-none">
              Come back tomorrow for a new challenge
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
