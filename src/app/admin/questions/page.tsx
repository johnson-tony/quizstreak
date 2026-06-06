"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Sparkles, 
  Plus,
  Save, 
  Loader2, 
  Wand2,
  RefreshCcw,
  ArrowLeft,
  Library,
  ChevronRight,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [category, setCategory] = useState("JavaScript");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("Medium");
  const [targetSet, setTargetSet] = useState("");
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (questions.length > 0 && !targetSet) {
      const uniqueSetNumbers = Array.from(new Set(questions.map(q => parseInt(q.set) || 0))).sort((a,b) => a-b);
      const lastSet = uniqueSetNumbers[uniqueSetNumbers.length - 1] || 1;
      const questionsInLast = questions.filter(q => parseInt(q.set) === lastSet).length;
      
      if (questionsInLast < 15) setTargetSet(lastSet.toString());
      else setTargetSet((lastSet + 1).toString());
    } else if (questions.length === 0) {
      setTargetSet("1");
    }
  }, [questions]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/questions");
      const data = await res.json();
      setQuestions(data);
    } catch (error) {
      toast.error("Failed to load curriculum");
    } finally {
      setLoading(false);
    }
  };

  const generateAI = async () => {
    const existingInTarget = questions.filter(q => q.set === targetSet).length;
    const remaining = 15 - existingInTarget;

    if (remaining <= 0) {
      toast.error(`Set #${targetSet} is already full (15/15).`);
      return;
    }

    if (count > remaining) {
      toast.error(`Set #${targetSet} only has space for ${remaining} more.`);
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, count, difficulty }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      const formatted = data.map((q: any, i: number) => ({
        ...q,
        day: `Q${(questions.length + i + 1).toString().padStart(3, '0')}`,
        set: targetSet
      }));
      
      setAiQuestions(formatted);
      toast.success(`AI Drafted ${count} questions for Set ${targetSet}`);
    } catch (error: any) {
      toast.error(error.message || "AI Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const saveToSheet = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: aiQuestions }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      toast.success("Questions synced with Google Sheets!");
      setAiQuestions([]);
      fetchQuestions();
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const uniqueSets = Array.from(new Set(questions.map(q => q.set))).sort((a,b) => parseInt(a)-parseInt(b));

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            <Wand2 className="text-primary w-8 h-8" /> Curriculum Architect
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Design challenge sets and generate AI-powered curriculum.</p>
        </div>
        
        <Link href="/admin/questions/bank">
          <Button variant="outline" className="rounded-2xl h-12 px-6 border-primary/10 bg-white hover:bg-primary/5 text-primary font-bold shadow-sm transition-all">
            <Library className="w-4 h-4 mr-2" /> View Question Bank <ChevronRight className="w-4 h-4 ml-1 opacity-50" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Set Configuration Form */}
        <Card className="rounded-[2rem] border-primary/5 shadow-2xl bg-white overflow-hidden border-t-8 border-t-primary lg:col-span-2">
          <CardHeader className="bg-primary/[0.01] border-b border-primary/5 p-6">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary">Set Configuration</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Target Skill</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-11 px-4 bg-muted/30 border border-primary/5 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                  >
                    {["JavaScript", "React", "Angular", "Python", "SQL", "AWS", "AI", ".NET", "Laravel", "Aptitude", "Debugging", "Interviews"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Difficulty</label>
                    <select 
                      value={difficulty} 
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full h-11 px-4 bg-muted/30 border border-primary/5 rounded-xl text-sm font-bold appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-primary/10"
                    >
                      {["Easy", "Medium", "Hard"].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Quantity</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="15" 
                      value={isNaN(count) ? "" : count} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setCount(isNaN(val) ? 0 : val);
                      }}
                      className="w-full h-11 px-4 bg-muted/30 border border-primary/5 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Target Set</label>
                  <select 
                    value={targetSet} 
                    onChange={(e) => setTargetSet(e.target.value)}
                    className="w-full h-11 px-4 bg-muted/30 border border-primary/5 rounded-xl text-sm font-bold appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-primary/10"
                  >
                    {uniqueSets
                      .filter(s => questions.filter(q => q.set === s).length < 15)
                      .map(s => {
                        const c = questions.filter(q => q.set === s).length;
                        return <option key={s} value={s}>Set #{s} ({c}/15 slots)</option>
                      })
                    }
                    <option value={(Math.max(...questions.map(q => parseInt(q.set) || 0)) + 1).toString()}>
                      Create New Set #{(Math.max(...questions.map(q => parseInt(q.set) || 0)) + 1)}
                    </option>
                  </select>
                </div>

                <Button 
                  onClick={generateAI} 
                  disabled={generating}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-xl font-black shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-auto"
                >
                  {generating ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <><Sparkles className="w-4 h-4 mr-3 fill-white" /> Generate AI Questions</>}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sheet Health / Stats Card */}
        <Card className="rounded-[2rem] border-primary/5 shadow-2xl bg-white overflow-hidden flex flex-col">
          <CardHeader className="bg-primary/[0.01] border-b border-primary/5 p-6 flex-shrink-0">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-emerald-600" />
                </div>
                <CardTitle className="text-xs font-black uppercase tracking-widest text-emerald-700">Database Status</CardTitle>
             </div>
          </CardHeader>
          <CardContent className="p-6 flex-grow flex flex-col justify-center gap-6">
            <div>
               <div className="text-3xl font-black text-foreground">{questions.length}</div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Total Challenges in Sheet</p>
            </div>
            
            <div className="space-y-4">
              {uniqueSets.slice(-3).map(setNum => {
                const setQuestions = questions.filter(q => q.set === setNum);
                const isFull = setQuestions.length >= 15;
                return (
                  <div key={setNum} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black uppercase">
                      <span className="text-muted-foreground tracking-tighter">Set #{setNum}</span>
                      <span className={isFull ? 'text-emerald-600' : 'text-primary'}>{setQuestions.length}/15</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(setQuestions.length / 15) * 100}%` }}
                        className={`h-full ${isFull ? 'bg-emerald-500' : 'bg-primary'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Draft Preview - Appears below when generating */}
      <AnimatePresence>
        {aiQuestions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6 pt-4"
          >
            <div className="flex items-center justify-between bg-primary p-6 rounded-[2rem] text-white shadow-xl shadow-primary/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
                  <RefreshCcw className="w-6 h-6 text-white animate-spin-slow" />
                </div>
                <div>
                  <h2 className="text-xl font-black leading-none tracking-tight">Drafting Set #{aiQuestions[0].set}</h2>
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-1.5">{aiQuestions.length} AI generated challenges</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" size="sm" onClick={() => setAiQuestions([])} className="text-xs font-black text-white hover:bg-white/10 px-4 rounded-xl">DISCARD</Button>
                <Button size="sm" onClick={saveToSheet} disabled={saving} className="bg-white text-primary hover:bg-white/90 text-xs font-black px-6 rounded-xl h-11 transition-all active:scale-95 shadow-lg">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} SYNC TO SHEET
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiQuestions.map((q, i) => (
                <Card key={i} className="rounded-3xl border-primary/5 shadow-md bg-white p-6 border-l-8 border-l-primary hover:border-l-secondary transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <Badge className="bg-primary/5 text-primary border-none text-[9px] font-black uppercase px-2 py-0.5">{q.category}</Badge>
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Draft Q{i+1}</span>
                  </div>
                  <p className="text-sm font-bold text-foreground mb-6 leading-relaxed">{q.question}</p>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(q.options).map(([key, val]) => (
                      <div key={key} className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${key === q.correctAnswer ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm" : "bg-muted/30 border-transparent text-muted-foreground"}`}>
                        <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-black mr-2 inline-flex ${key === q.correctAnswer ? "bg-emerald-600 text-white" : "bg-white text-muted-foreground"}`}>{key}</span>
                        {val as string}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Hint */}
      {aiQuestions.length === 0 && (
        <div className="text-center pt-10">
           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Ready for Generation</p>
        </div>
      )}
    </div>
  );
}
