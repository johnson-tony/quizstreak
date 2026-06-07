"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AlertCircle, Trash2, RefreshCcw, ChevronDown, ChevronUp, Clock, Globe, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    if (!confirm("Are you sure you want to clear all logs?")) return;
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
      <div className="p-8 space-y-4">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">System Health</h1>
          <p className="text-muted-foreground font-medium">Monitor and debug application errors.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={fetchLogs} className="rounded-xl font-bold gap-2">
            <RefreshCcw className="w-4 h-4" /> Refresh
          </Button>
          <Button variant="destructive" size="sm" onClick={clearLogs} className="rounded-xl font-bold gap-2">
            <Trash2 className="w-4 h-4" /> Clear All
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {logs.map((log) => (
          <Card key={log._id} className="overflow-hidden border-primary/5 shadow-sm hover:shadow-md transition-all">
            <div 
              className="p-4 md:p-6 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-foreground leading-tight">{log.message}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(log.timestamp).toLocaleString()}</span>
                      <span className="flex items-center gap-1 font-black text-primary uppercase tracking-widest"><Globe className="w-3 h-3" /> {log.method} {log.path}</span>
                      {log.userId && <span className="flex items-center gap-1"><User className="w-3 h-3" /> User: {log.userId}</span>}
                    </div>
                  </div>
                </div>
                {expandedLog === log._id ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </div>
            </div>
            
            <AnimatePresence>
              {expandedLog === log._id && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden bg-muted/50 border-t border-primary/5"
                >
                  <div className="p-6 space-y-4">
                    {log.stack && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Stack Trace</p>
                        <pre className="p-4 bg-black text-white/80 text-[10px] rounded-xl overflow-x-auto font-mono">
                          {log.stack}
                        </pre>
                      </div>
                    )}
                    {log.metadata && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Metadata</p>
                        <pre className="p-4 bg-primary/5 text-primary text-[10px] rounded-xl overflow-x-auto font-mono">
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
          <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-primary/5">
            <p className="text-muted-foreground font-medium italic">No system errors detected. Everything is running smoothly!</p>
          </div>
        )}
      </div>
    </div>
  );
}
