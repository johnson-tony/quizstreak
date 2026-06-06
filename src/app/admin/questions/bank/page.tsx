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
    <div className="p-3 sm:p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div className="space-y-0.5">
          <Link href="/admin/questions">
            <Button variant="ghost" size="sm" className="mb-1 md:mb-2 -ml-2 text-muted-foreground hover:text-primary h-8 text-[10px] md:text-xs transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 mr-2" /> Back to Architect
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight flex items-center gap-2 md:gap-3">
            <Library className="text-primary w-6 h-6 md:w-8 md:h-8" /> Question Bank
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">Browse and manage your entire curriculum library.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 bg-white p-2 rounded-xl md:rounded-2xl border border-primary/5 shadow-sm">
           <div className="relative flex-grow min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 md:h-10 pl-9 pr-4 bg-muted/30 border-transparent rounded-lg md:rounded-xl text-xs md:text-sm font-medium focus:bg-white focus:border-primary/20 transition-all outline-none w-full sm:min-w-[200px]"
              />
           </div>
           
           <div className="h-6 w-[1px] bg-primary/10 hidden sm:block" />

           <div className="flex items-center gap-2">
             <div className="relative flex-grow">
               <FilterIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-primary" />
               <select 
                 value={selectedSetFilter}
                 onChange={(e) => setSelectedSetFilter(e.target.value)}
                 className="h-9 md:h-10 pl-7 pr-7 bg-primary/5 border-transparent rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer outline-none hover:bg-primary/10 transition-colors w-full"
               >
                 <option value="all">All Sets</option>
                 {uniqueSets.map(s => <option key={s} value={s}>Set #{s}</option>)}
               </select>
             </div>

             <Button variant="ghost" size="icon" onClick={fetchQuestions} className="h-9 w-9 md:h-10 md:w-10 rounded-lg md:rounded-xl text-primary hover:bg-primary/5 shrink-0">
               <RefreshCcw className="w-3.5 h-3.5 md:w-4 md:h-4" />
             </Button>
           </div>
        </div>
      </div>

      {/* Grid of Questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 md:h-48 rounded-2xl md:rounded-[2rem]" />)
        ) : filteredQuestions.length > 0 ? (
          filteredQuestions.slice().reverse().map((q, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              key={q.rowIndex}
            >
              <Card className="rounded-2xl md:rounded-[2rem] border-primary/5 shadow-lg bg-white overflow-hidden h-full flex flex-col group hover:shadow-primary/5 transition-all hover:-translate-y-1">
                <div className="p-5 md:p-6 flex-grow space-y-3 md:space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-1.5 md:gap-2">
                      <Badge className="bg-primary/5 text-primary border-none text-[8px] md:text-[9px] font-black uppercase px-2 py-0.5">{q.category}</Badge>
                      <Badge variant="outline" className="text-[7px] md:text-[8px] font-bold border-primary/10 text-muted-foreground uppercase">{q.difficulty}</Badge>
                    </div>
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-muted flex items-center justify-center font-black text-[9px] md:text-[10px] text-muted-foreground">
                      #{q.set}
                    </div>
                  </div>
                  
                  <p className="text-xs md:text-sm font-bold text-foreground leading-relaxed line-clamp-3 group-hover:text-primary transition-colors">
                    {q.question}
                  </p>

                  <div className="grid grid-cols-2 gap-1 md:gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    {Object.entries(q.options).map(([key, val]) => (
                      <div key={key} className={`p-1 md:p-1.5 rounded-lg text-[8px] md:text-[9px] font-bold border ${key === q.correctAnswer ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-muted/10 border-transparent text-muted-foreground"}`}>
                        <span className="mr-1">{key}:</span> {val as string}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-5 md:px-6 py-3 md:py-4 bg-muted/30 border-t border-primary/5 flex items-center justify-between mt-auto">
                   <div className="flex items-center gap-1.5 md:gap-2">
                     <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                     <span className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase">Correct: {q.correctAnswer}</span>
                   </div>
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(q.rowIndex)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg md:rounded-xl h-8 w-8 md:h-9 md:w-9 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-24 md:py-32 text-center bg-white/50 rounded-2xl md:rounded-[3rem] border-2 border-dashed border-primary/5">
             <Database className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground/20 mx-auto mb-4" />
             <p className="text-base md:text-lg font-bold text-foreground">Library is empty</p>
             <p className="text-xs md:text-sm text-muted-foreground px-4">Try adjusting your filters or generating new content.</p>
          </div>
        )}
      </div>
    </div>
  );
}
