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
      if (data.error) throw new Error(data.error);
      setQuestions(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load curriculum");
      setQuestions([]);
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
      
      if (!Array.isArray(data)) {
        throw new Error("AI returned an invalid response format. Please try again.");
      }
      
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

  const uniqueSets = Array.from(new Set(questions.map(q => parseInt(q.set) || 0))).sort((a,b) => a-b).map(s => s.toString());

  return (
    <div className="p-2 md:p-6 space-y-4 md:space-y-6 max-w-6xl mx-auto animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm" className="mb-0.5 -ml-2 text-muted-foreground hover:text-primary h-7 text-[9px] md:text-xs">
              <ArrowLeft className="w-3 h-3 mr-1.5" /> Back
            </Button>
          </Link>
          <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight uppercase flex items-center gap-2">
            <Wand2 className="text-primary w-5 h-5 md:w-6 md:h-6" /> Architect
          </h1>
          <p className="text-xs md:text-xs text-muted-foreground font-medium uppercase tracking-wider">AI Curriculum Design</p>
        </div>
        
        <Link href="/admin/questions/bank" className="w-full md:w-auto">
          <Button variant="outline" className="w-full md:w-auto rounded-lg h-10 px-4 border-primary/10 bg-white text-primary font-black uppercase text-xs md:text-xs shadow-sm">
            <Library className="w-3.5 h-3.5 mr-2" /> Question Bank
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 md:gap-6">
        {/* Set Configuration Form */}
        <Card className="rounded-xl md:rounded-2xl border-primary/5 shadow-md bg-white overflow-hidden border-t-4 border-t-primary lg:col-span-3">
          <CardHeader className="bg-primary/[0.01] border-b border-primary/5 p-4 md:p-6">
            <CardTitle className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-primary">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Skill</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 bg-muted/30 border border-primary/5 rounded-xl text-xs font-bold appearance-none cursor-pointer focus:ring-1 focus:ring-primary/10"
                  >
                    {["JavaScript", "React", "Angular", "Python", "SQL", "AWS", "AI", ".NET", "Laravel", "Aptitude", "Debugging", "Interviews"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Level</label>
                    <select 
                      value={difficulty} 
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full h-10 px-3 bg-muted/30 border border-primary/5 rounded-xl text-xs font-bold appearance-none cursor-pointer"
                    >
                      {["Easy", "Medium", "Hard"].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Qty</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="15" 
                      value={isNaN(count) ? "" : count} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setCount(isNaN(val) ? 0 : val);
                      }}
                      className="w-full h-10 px-3 bg-muted/30 border border-primary/5 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 flex flex-col">
                <div className="space-y-1">
                  <label className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Target Set</label>
                  <select 
                    value={targetSet} 
                    onChange={(e) => setTargetSet(e.target.value)}
                    className="w-full h-10 px-3 bg-muted/30 border border-primary/5 rounded-xl text-xs font-bold appearance-none cursor-pointer outline-none"
                  >
                    {uniqueSets
                      .filter(s => questions.filter(q => q.set === s).length < 15)
                      .map(s => {
                        const c = questions.filter(q => q.set === s).length;
                        return <option key={s} value={s}>Set #{s} ({c}/15 slots)</option>
                      })
                    }
                    <option value={(Math.max(...questions.map(q => parseInt(q.set) || 0)) + 1).toString()}>
                      New Set #{(Math.max(...questions.map(q => parseInt(q.set) || 0)) + 1)}
                    </option>
                  </select>
                </div>

                <Button 
                  onClick={generateAI} 
                  disabled={generating}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-xl font-black shadow-md shadow-primary/10 transition-all text-xs mt-auto uppercase tracking-widest"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Batch</>}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Health Stats */}
        <Card className="rounded-xl md:rounded-2xl border-primary/5 shadow-md bg-white overflow-hidden flex flex-col lg:col-span-2">
          <CardHeader className="bg-primary/[0.01] border-b border-primary/5 p-4 flex-shrink-0">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Database className="w-4 h-4 text-emerald-600" />
                </div>
                <CardTitle className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-emerald-700">Database</CardTitle>
             </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 flex-grow flex flex-col justify-center gap-4">
            <div className="text-center md:text-left">
               <div className="text-3xl md:text-4xl font-black text-foreground tabular-nums">{questions.length}</div>
               <p className="text-[8px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Total Challenges</p>
            </div>
            
            <div className="space-y-3">
              {uniqueSets.slice(-3).map(setNum => {
                const setQuestions = questions.filter(q => q.set === setNum);
                const isFull = setQuestions.length >= 15;
                return (
                  <div key={setNum} className="space-y-1">
                    <div className="flex justify-between text-[8px] font-black uppercase">
                      <span className="text-muted-foreground tracking-tighter">Set #{setNum}</span>
                      <span className={isFull ? 'text-emerald-600' : 'text-primary'}>{setQuestions.length}/15</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(setQuestions.length / 15) * 100}%` }}
                        className={`h-full transition-all duration-700 ${isFull ? 'bg-emerald-500' : 'bg-primary'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Draft Preview */}
      <AnimatePresence>
        {aiQuestions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4 pt-2"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-primary p-4 rounded-xl md:rounded-2xl text-white shadow-lg shadow-primary/10 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <RefreshCcw className="w-5 h-5 text-white animate-spin-slow" />
                </div>
                <div>
                  <h2 className="text-lg font-black leading-none tracking-tight uppercase">Drafting Set #{aiQuestions[0].set}</h2>
                  <p className="text-[8px] md:text-[9px] font-bold text-white/70 uppercase tracking-widest mt-1">{aiQuestions.length} Items generated</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setAiQuestions([])} className="flex-1 sm:flex-none text-xs font-black text-white hover:bg-white/10 px-3 h-9 rounded-lg uppercase tracking-wider">Discard</Button>
                <Button size="sm" onClick={saveToSheet} disabled={saving} className="flex-1 sm:flex-none bg-white text-primary hover:bg-white/90 text-xs font-black px-4 h-9 rounded-lg transition-all active:scale-95 shadow-md uppercase tracking-wider">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />} Deploy Batch
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiQuestions.map((q, i) => (
                <Card key={i} className="rounded-xl border-primary/5 shadow-sm bg-white p-4 border-l-4 border-l-primary hover:border-l-secondary transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-primary/5 text-primary border-none text-[8px] font-black uppercase px-1.5 py-0.5">{q.category}</Badge>
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Item {i+1}</span>
                  </div>
                  <p className="text-[11px] md:text-xs font-bold text-foreground mb-3 leading-relaxed">{q.question}</p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {Object.entries(q.options).map(([key, val]) => (
                      <div key={key} className={`p-2 rounded-lg text-[9px] md:text-xs font-bold border transition-all flex items-center ${key === q.correctAnswer ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-muted/30 border-transparent text-muted-foreground"}`}>
                        <span className={`w-3.5 h-3.5 rounded-md flex items-center justify-center font-black mr-2 flex-shrink-0 ${key === q.correctAnswer ? "bg-emerald-600 text-white" : "bg-white text-muted-foreground"}`}>{key}</span>
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
    </div>
  );
}
