"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Library, 
  Search, 
  Filter, 
  Trash2, 
  RefreshCcw, 
  ArrowLeft,
  ChevronRight,
  Database,
  FilterIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSetFilter, setSelectedSetFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

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
      toast.error("Failed to load question bank");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rowIndex: number) => {
    if (!confirm("Remove this question from your permanent library?")) return;
    
    try {
      const res = await fetch("/api/admin/questions/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rowIndex }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      toast.success("Question deleted");
      fetchQuestions();
    } catch (error: any) {
      toast.error("Delete failed");
    }
  };

  const uniqueSets = Array.from(new Set(questions.map(q => q.set))).sort((a,b) => parseInt(a)-parseInt(b));
  
  const filteredQuestions = questions.filter(q => {
    const matchesSet = selectedSetFilter === "all" || q.set === selectedSetFilter;
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          q.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSet && matchesSearch;
  });

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Link href="/admin/questions">
            <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground hover:text-primary">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Architect
            </Button>
          </Link>
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            <Library className="text-primary w-8 h-8" /> Question Bank
          </h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">Browse, filter, and manage your entire curriculum library.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-primary/5 shadow-sm">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 pl-10 pr-4 bg-muted/30 border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-primary/20 transition-all outline-none min-w-[240px]"
              />
           </div>
           
           <div className="h-6 w-[1px] bg-primary/10 hidden sm:block" />

           <div className="relative">
             <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary" />
             <select 
               value={selectedSetFilter}
               onChange={(e) => setSelectedSetFilter(e.target.value)}
               className="h-10 pl-9 pr-8 bg-primary/5 border-transparent rounded-xl text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer outline-none hover:bg-primary/10 transition-colors"
             >
               <option value="all">All Content Sets</option>
               {uniqueSets.map(s => <option key={s} value={s}>Set #{s}</option>)}
             </select>
           </div>

           <Button variant="ghost" size="icon" onClick={fetchQuestions} className="h-10 w-10 rounded-xl text-primary hover:bg-primary/5">
             <RefreshCcw className="w-4 h-4" />
           </Button>
        </div>
      </div>

      {/* Grid of Questions - Neon/Modern style cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-[2rem]" />)
        ) : filteredQuestions.length > 0 ? (
          filteredQuestions.slice().reverse().map((q, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={q.rowIndex}
            >
              <Card className="rounded-[2rem] border-primary/5 shadow-lg bg-white overflow-hidden h-full flex flex-col group hover:shadow-primary/5 transition-all hover:-translate-y-1">
                <div className="p-6 flex-grow space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                      <Badge className="bg-primary/5 text-primary border-none text-[9px] font-black uppercase px-2 py-0.5">{q.category}</Badge>
                      <Badge variant="outline" className="text-[8px] font-bold border-primary/10 text-muted-foreground uppercase">{q.difficulty}</Badge>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-black text-[10px] text-muted-foreground">
                      #{q.set}
                    </div>
                  </div>
                  
                  <p className="text-sm font-bold text-foreground leading-relaxed line-clamp-3 group-hover:text-primary transition-colors">
                    {q.question}
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    {Object.entries(q.options).map(([key, val]) => (
                      <div key={key} className={`p-1.5 rounded-lg text-[9px] font-bold border ${key === q.correctAnswer ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-muted/10 border-transparent text-muted-foreground"}`}>
                        <span className="mr-1">{key}:</span> {val as string}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-6 py-4 bg-muted/30 border-t border-primary/5 flex items-center justify-between mt-auto">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                     <span className="text-[10px] font-black text-muted-foreground uppercase">Correct: {q.correctAnswer}</span>
                   </div>
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(q.rowIndex)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl h-9 w-9 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-32 text-center bg-white/50 rounded-[3rem] border-2 border-dashed border-primary/5">
             <Database className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
             <p className="text-lg font-bold text-foreground">Library is empty</p>
             <p className="text-sm text-muted-foreground">Try adjusting your filters or generating new content.</p>
          </div>
        )}
      </div>
    </div>
  );
}
