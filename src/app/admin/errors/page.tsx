"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AlertCircle, Trash2, RefreshCcw, ChevronDown, ChevronUp, Clock, Globe, User, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ErrorLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/error-logs");
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      toast.error("Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    if (!confirm("Clear all logs?")) return;
    try {
      await fetch("/api/admin/error-logs", { method: "DELETE" });
      setLogs([]);
      toast.success("Logs cleared");
    } catch (error) {
      toast.error("Failed to clear logs");
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm" className="mb-0.5 -ml-2 text-muted-foreground hover:text-primary h-7 text-[9px] md:text-xs">
              <ArrowLeft className="w-3 h-3 mr-1.5" /> Back
            </Button>
          </Link>
          <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight uppercase">System Health</h1>
          <p className="text-xs md:text-xs text-muted-foreground font-medium uppercase tracking-wider">Error Monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchLogs} className="rounded-lg font-bold gap-1.5 h-8 text-xs uppercase">
            <RefreshCcw className="w-3 h-3" /> Refresh
          </Button>
          <Button variant="destructive" size="sm" onClick={clearLogs} className="rounded-lg font-bold gap-1.5 h-8 text-xs uppercase">
            <Trash2 className="w-3 h-3" /> Clear
          </Button>
        </div>
      </div>

      <div className="grid gap-2 md:gap-3">
        {logs.map((log) => (
          <Card key={log._id} className="overflow-hidden border-primary/5 shadow-sm hover:shadow-md transition-all">
            <div 
              className="p-3 md:p-4 cursor-pointer hover:bg-muted/10 transition-colors"
              onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-xs md:text-sm font-bold text-foreground leading-tight line-clamp-1">{log.message}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[9px] md:text-xs text-muted-foreground font-medium uppercase">
                      <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="flex items-center gap-1 font-black text-primary"><Globe className="w-2.5 h-2.5" /> {log.method} {log.path}</span>
                    </div>
                  </div>
                </div>
                {expandedLog === log._id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </div>
            
            <AnimatePresence>
              {expandedLog === log._id && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden bg-muted/30 border-t border-primary/5"
                >
                  <div className="p-4 space-y-3">
                    {log.stack && (
                      <div className="space-y-1.5">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Stack Trace</p>
                        <pre className="p-3 bg-black text-white/70 text-[9px] rounded-lg overflow-x-auto font-mono leading-relaxed">
                          {log.stack}
                        </pre>
                      </div>
                    )}
                    {log.metadata && (
                      <div className="space-y-1.5">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Metadata</p>
                        <pre className="p-3 bg-primary/5 text-primary text-[9px] rounded-lg overflow-x-auto font-mono">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}

        {logs.length === 0 && (
          <div className="text-center py-16 bg-muted/10 rounded-2xl border-2 border-dashed border-primary/5">
            <p className="text-[11px] md:text-sm text-muted-foreground font-bold uppercase tracking-widest">No errors detected</p>
          </div>
        )}
      </div>
    </div>
  );
}
