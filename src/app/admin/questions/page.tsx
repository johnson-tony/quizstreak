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
  Trash2, 
  Save, 
  Loader2, 
  Wand2,
  RefreshCcw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
      toast.error("Failed to load questions");
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
      
      // Suggest the next set number based on the highest set in the current list
      const highestSet = questions.length > 0 ? Math.max(...questions.map(q => parseInt(q.set) || 0)) : 0;
      const nextSet = (highestSet + 1).toString();
      
      const formatted = data.map((q: any, i: number) => ({
        ...q,
        day: `Q${(questions.length + i + 1).toString().padStart(3, '0')}`,
        set: nextSet
      }));
      
      setAiQuestions(formatted);
      toast.success(`Generated ${count} questions for Set ${nextSet}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate questions");
    } finally {
      setGenerating(false);
    }
  };

  const saveToSheet = async () => {
    // Duplicate Checker: Check if these questions already exist in the recent curriculum
    const duplicates = aiQuestions.filter(newQ => 
      questions.some(oldQ => oldQ.question.toLowerCase().trim() === newQ.question.toLowerCase().trim())
    );

    if (duplicates.length > 0) {
      if (!confirm(`${duplicates.length} duplicate questions detected. Save anyway?`)) return;
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
      
      toast.success("Questions appended to Google Sheet!");
      setAiQuestions([]);
      fetchQuestions();
    } catch (error: any) {
      toast.error(error.message || "Failed to save questions");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rowIndex: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    
    try {
      const res = await fetch("/api/admin/questions/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rowIndex }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      toast.success("Question removed from sheet");
      fetchQuestions();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete question");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            <Sparkles className="text-primary w-8 h-8" /> Curriculum Manager
          </h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">Automate your content strategy with Gemini AI.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Generation Panel */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-primary/5 shadow-sm bg-white overflow-hidden sticky top-24">
            <CardHeader className="bg-primary/[0.02] border-b border-primary/5">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-black uppercase tracking-widest">AI Magic Tool</CardTitle>
              </div>
              <CardDescription className="text-xs">Select your parameters and let AI build the challenges.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-4 bg-muted/30 border border-primary/5 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                >
                  <option>JavaScript</option>
                  <option>SQL</option>
                  <option>AWS</option>
                  <option>Aptitude</option>
                  <option>Debugging</option>
                  <option>Interviews</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Difficulty</label>
                  <select 
                    value={difficulty} 
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full h-11 px-4 bg-muted/30 border border-primary/5 rounded-xl text-sm font-medium appearance-none cursor-pointer outline-none focus:ring-1 focus:ring-primary/20"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Quantity</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="20" 
                    value={count} 
                    onChange={(e) => setCount(parseInt(e.target.value))}
                    className="w-full h-11 px-4 bg-muted/30 border border-primary/5 rounded-xl text-sm font-medium outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>

              <Button 
                onClick={generateAI} 
                disabled={generating}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              >
                {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Questions</>}
              </Button>
            </CardContent>
          </Card>

          {/* Current Status Box */}
          <Card className="rounded-2xl border-emerald-500/10 shadow-sm bg-emerald-500/[0.02] border-dashed">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Database</p>
                <p className="text-sm font-bold text-foreground">{questions.length} Questions in Sheet</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Preview & Review */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {aiQuestions.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                    Review Generated Questions
                    <Badge className="bg-primary/10 text-primary border-none">{aiQuestions.length}</Badge>
                  </h2>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setAiQuestions([])} className="text-xs font-bold text-muted-foreground hover:text-destructive">CANCEL</Button>
                    <Button size="sm" onClick={saveToSheet} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 rounded-lg shadow-md shadow-emerald-500/20">
                      {saving ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />} SAVE TO SHEET
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {aiQuestions.map((q, i) => (
                    <Card key={i} className="rounded-2xl border-primary/10 shadow-md bg-white overflow-hidden border-l-4 border-l-primary">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] font-black">{q.category}</Badge>
                          <span className="text-[10px] font-black text-muted-foreground">PREVIEW Q{i+1}</span>
                        </div>
                        <p className="text-sm font-bold text-foreground leading-relaxed mb-4">{q.question}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                          {Object.entries(q.options).map(([key, val]) => (
                            <div key={key} className={`p-2 rounded-lg border text-xs flex items-center gap-2 ${key === q.correctAnswer ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-muted/30 border-transparent"}`}>
                              <span className={`w-5 h-5 rounded flex items-center justify-center font-black ${key === q.correctAnswer ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}>{key}</span>
                              {val as string}
                            </div>
                          ))}
                        </div>

                        <div className="bg-muted/50 rounded-xl p-3 text-xs font-medium text-muted-foreground leading-relaxed border border-primary/5">
                          <span className="text-primary font-black uppercase text-[9px] mr-2">Explanation:</span> {q.explanation}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-foreground">Recent Curriculum</h2>
                  <Button variant="ghost" size="sm" onClick={fetchQuestions} className="text-primary font-bold text-xs">
                    <RefreshCcw className="w-3 h-3 mr-1.5" /> REFRESH
                  </Button>
                </div>

                <div className="grid gap-3">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
                  ) : (
                    questions.slice(-10).reverse().map((q, i) => (
                      <Card key={i} className="rounded-xl border-primary/5 shadow-sm bg-white/50 backdrop-blur-sm opacity-60">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="text-[8px] h-4 bg-muted text-muted-foreground border-none font-bold uppercase tracking-widest">{q.category}</Badge>
                              <span className="text-[10px] font-black text-primary/40 uppercase">Day {q.day}</span>
                            </div>
                            <p className="text-xs font-bold text-foreground truncate">{q.question}</p>
                          </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-[10px] font-black text-muted-foreground uppercase">CORRECT</p>
                                <p className="text-sm font-black text-primary">{q.correctAnswer}</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDelete(q.rowIndex)}
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg h-8 w-8"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                        </CardContent>
                      </Card>
                    ))
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
