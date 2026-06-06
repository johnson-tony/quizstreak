"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Sparkles, 
  Trash2, 
  Save, 
  Loader2, 
  Wand2,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Filter,
  CheckCircle,
  XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Generation Settings
  const [category, setCategory] = useState("JavaScript");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("Medium");
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);

  // Filtering
  const [selectedSetFilter, setSelectedSetFilter] = useState<string>("all");

  useEffect(() => {
    fetchQuestions();
  }, []);

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
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, count, difficulty }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      // Auto-calculate next Set number
      const highestSet = questions.length > 0 ? Math.max(...questions.map(q => parseInt(q.set) || 0)) : 0;
      const nextSet = (highestSet + 1).toString();
      
      const formatted = data.map((q: any, i: number) => ({
        ...q,
        day: `Q${(questions.length + i + 1).toString().padStart(3, '0')}`,
        set: nextSet
      }));
      
      setAiQuestions(formatted);
      toast.success(`Gemini created ${count} questions for Set ${nextSet}`);
    } catch (error: any) {
      toast.error(error.message || "AI Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const saveToSheet = async () => {
    // 1. Duplicate Check
    const duplicates = aiQuestions.filter(newQ => 
      questions.some(oldQ => oldQ.question.toLowerCase().trim() === newQ.question.toLowerCase().trim())
    );
    if (duplicates.length > 0) {
      if (!confirm(`${duplicates.length} duplicate questions detected. Save anyway?`)) return;
    }

    // 2. Set Limit Check (15 questions per set)
    const setToSave = aiQuestions[0]?.set;
    const existingInSet = questions.filter(q => q.set === setToSave).length;
    const totalAfterSave = existingInSet + aiQuestions.length;

    if (totalAfterSave > 15) {
      toast.error(`Cannot save. Set ${setToSave} would have ${totalAfterSave} questions (Limit: 15).`);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: aiQuestions }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      toast.success("Spreadsheet updated successfully!");
      setAiQuestions([]);
      fetchQuestions();
    } catch (error: any) {
      toast.error(error.message || "Failed to save questions");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rowIndex: number) => {
    if (!confirm("Are you sure? This row will be cleared from Google Sheets.")) return;
    
    try {
      const res = await fetch("/api/admin/questions/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rowIndex }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      toast.success("Question cleared");
      fetchQuestions();
    } catch (error: any) {
      toast.error("Delete failed");
    }
  };

  // Logic for filtering by set
  const uniqueSets = Array.from(new Set(questions.map(q => q.set))).sort((a,b) => parseInt(a)-parseInt(b));
  const filteredQuestions = selectedSetFilter === "all" 
    ? questions 
    : questions.filter(q => q.set === selectedSetFilter);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground hover:text-primary">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Console
            </Button>
          </Link>
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            <Sparkles className="text-primary w-8 h-8" /> Curriculum Manager
          </h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">Design daily sets and manage AI-powered content.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="rounded-[2rem] border-primary/5 shadow-xl bg-white overflow-hidden sticky top-24 border-t-4 border-t-primary">
            <CardHeader className="bg-primary/[0.01] border-b border-primary/5 pb-4">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" />
                <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">Content Architect</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Target Skill</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-4 bg-muted/30 border border-primary/5 rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                >
                  {["JavaScript", "SQL", "AWS", "Aptitude", "Debugging", "Interviews"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Complexity</label>
                  <select 
                    value={difficulty} 
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full h-11 px-4 bg-muted/30 border border-primary/5 rounded-xl text-sm font-bold appearance-none cursor-pointer outline-none focus:ring-1 focus:ring-primary/20"
                  >
                    {["Easy", "Medium", "Hard"].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Questions</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="15" 
                    value={count} 
                    onChange={(e) => setCount(parseInt(e.target.value))}
                    className="w-full h-11 px-4 bg-muted/30 border border-primary/5 rounded-xl text-sm font-bold outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>

              <Button 
                onClick={generateAI} 
                disabled={generating}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-2"
              >
                {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" /> Build Challenge</>}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-primary/5 shadow-sm bg-muted/10">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Set Health Check</h3>
                {uniqueSets.slice(-3).map(setNum => {
                  const setQuestions = questions.filter(q => q.set === setNum);
                  const isFull = setQuestions.length >= 15;
                  return (
                    <div key={setNum} className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Set #{setNum}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${isFull ? 'bg-emerald-500' : 'bg-primary'}`} 
                            style={{ width: `${(setQuestions.length / 15) * 100}%` }} 
                          />
                        </div>
                        <span className={`text-[10px] font-black ${isFull ? 'text-emerald-600' : 'text-primary'}`}>{setQuestions.length}/15</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {aiQuestions.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between bg-primary/5 p-4 rounded-2xl border border-primary/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      <Plus className="text-primary w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-foreground leading-none">Drafting Set #{aiQuestions[0].set}</h2>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Reviewing {aiQuestions.length} AI generated items</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setAiQuestions([])} className="text-xs font-black text-muted-foreground hover:bg-white">DISCARD</Button>
                    <Button size="sm" onClick={saveToSheet} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 rounded-xl h-10">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} DEPLOY TO SHEET
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {aiQuestions.map((q, i) => (
                    <Card key={i} className="rounded-2xl border-primary/5 shadow-md bg-white p-5 border-l-4 border-l-primary">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] font-black">{q.category}</Badge>
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Draft Item {i+1}</span>
                      </div>
                      <p className="text-sm font-bold text-foreground mb-4">{q.question}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(q.options).map(([key, val]) => (
                          <div key={key} className={`p-2 rounded-lg text-[10px] font-bold ${key === q.correctAnswer ? "bg-emerald-50 text-emerald-700" : "bg-muted/30 text-muted-foreground"}`}>
                            {key}: {val as string}
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                    Live Curriculum
                    <span className="text-[10px] font-black text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded tracking-widest">{filteredQuestions.length} total</span>
                  </h2>
                  
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                      <select 
                        value={selectedSetFilter}
                        onChange={(e) => setSelectedSetFilter(e.target.value)}
                        className="h-9 pl-8 pr-8 bg-white border border-primary/5 rounded-xl text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/20"
                      >
                        <option value="all">All Sets</option>
                        {uniqueSets.map(s => <option key={s} value={s}>Set #{s}</option>)}
                      </select>
                    </div>
                    <Button variant="ghost" size="sm" onClick={fetchQuestions} className="text-primary font-bold text-xs h-9 hover:bg-primary/5 px-2">
                      <RefreshCcw className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
                  ) : filteredQuestions.length > 0 ? (
                    filteredQuestions.slice().reverse().map((q, i) => (
                      <Card key={i} className="rounded-2xl border-primary/5 shadow-sm bg-white hover:shadow-md transition-all group">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                          <div className="min-w-0 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex-shrink-0 flex items-center justify-center font-black text-xs">
                              {q.set}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className="text-[8px] h-4 bg-muted text-muted-foreground border-none font-bold uppercase tracking-widest">{q.category}</Badge>
                                <span className="text-[9px] font-black text-primary/40 uppercase">ID: {q.day}</span>
                              </div>
                              <p className="text-xs font-bold text-foreground truncate">{q.question}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right flex-shrink-0 hidden sm:block">
                              <p className="text-[9px] font-black text-muted-foreground uppercase leading-none mb-1">ANS</p>
                              <p className="text-xs font-black text-emerald-600">{q.correctAnswer}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(q.rowIndex)}
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl h-9 w-9"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-primary/5">
                      <AlertCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm font-bold text-muted-foreground">No questions found for this set.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
