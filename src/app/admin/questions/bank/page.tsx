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
    if (!confirm("Remove this question?")) return;
    
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
    <div className="p-2 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <Link href="/admin/questions">
            <Button variant="ghost" size="sm" className="mb-0.5 -ml-2 text-muted-foreground hover:text-primary h-7 text-[9px] md:text-xs">
              <ArrowLeft className="w-3 h-3 mr-1.5" /> Back
            </Button>
          </Link>
          <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight flex items-center gap-2 uppercase">
            <Library className="text-primary w-5 h-5 md:w-6 md:h-6" /> Question Bank
          </h1>
          <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">Manage curriculum library</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-primary/5 shadow-sm">
           <div className="relative flex-grow min-w-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-8 pr-3 bg-muted/30 border-transparent rounded-lg text-xs font-medium focus:bg-white focus:border-primary/20 transition-all outline-none w-full sm:w-48"
              />
           </div>
           
           <div className="flex items-center gap-1.5">
             <div className="relative">
               <select 
                 value={selectedSetFilter}
                 onChange={(e) => setSelectedSetFilter(e.target.value)}
                 className="h-8 pl-2 pr-6 bg-primary/5 border-transparent rounded-lg text-[9px] font-black uppercase tracking-widest appearance-none cursor-pointer outline-none hover:bg-primary/10 transition-colors w-24"
               >
                 <option value="all">All Sets</option>
                 {uniqueSets.map(s => <option key={s} value={s}>Set #{s}</option>)}
               </select>
             </div>

             <Button variant="ghost" size="icon" onClick={fetchQuestions} className="h-8 w-8 rounded-lg text-primary hover:bg-primary/5 shrink-0">
               <RefreshCcw className="w-3.5 h-3.5" />
             </Button>
           </div>
        </div>
      </div>

      {/* Grid of Questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
        ) : filteredQuestions.length > 0 ? (
          filteredQuestions.slice().reverse().map((q, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              key={q.rowIndex}
            >
              <Card className="rounded-xl border-primary/5 shadow-md bg-white overflow-hidden h-full flex flex-col group hover:shadow-lg transition-all">
                <div className="p-4 flex-grow space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-1">
                      <Badge className="bg-primary/5 text-primary border-none text-[8px] font-black uppercase px-1.5 py-0.5">{q.category}</Badge>
                      <Badge variant="outline" className="text-[7px] font-bold border-primary/10 text-muted-foreground uppercase">{q.difficulty}</Badge>
                    </div>
                    <div className="px-1.5 py-0.5 rounded-md bg-muted text-[8px] font-black text-muted-foreground">
                      SET {q.set}
                    </div>
                  </div>
                  
                  <p className="text-[11px] md:text-xs font-bold text-foreground leading-relaxed line-clamp-3">
                    {q.question}
                  </p>

                  <div className="grid grid-cols-2 gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    {Object.entries(q.options).map(([key, val]) => (
                      <div key={key} className={`p-1 rounded-md text-[8px] border ${key === q.correctAnswer ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-muted/10 border-transparent text-muted-foreground"}`}>
                        <span className="font-black mr-0.5">{key}:</span> {val as string}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-4 py-2 bg-muted/30 border-t border-primary/5 flex items-center justify-between mt-auto">
                   <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                     <span className="text-[8px] font-black text-muted-foreground uppercase">Ans: {q.correctAnswer}</span>
                   </div>
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(q.rowIndex)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg h-7 w-7 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white/50 rounded-2xl border-2 border-dashed border-primary/5">
             <Database className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
             <p className="text-sm font-bold text-foreground uppercase tracking-widest">Library empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
