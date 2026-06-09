"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { 
  Mail, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Search,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'replied' | 'ignored';
  replies: {
    message: string;
    sentAt: string;
    adminEmail: string;
  }[];
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/contact");
      const data = await res.json();
      if (data.contacts) {
        setMessages(data.contacts);
      }
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6 space-y-4 md:space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm" className="mb-0.5 -ml-2 text-muted-foreground hover:text-primary h-7 text-[9px] md:text-xs">
              <ArrowLeft className="w-3 h-3 mr-1.5" /> Back
            </Button>
          </Link>
          <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight uppercase">Inquiries</h1>
          <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">User Support requests</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-grow md:flex-none">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 h-9 w-full md:w-56 bg-white border border-primary/10 rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 md:gap-3">
        {filteredMessages.map((msg) => (
          <Card key={msg._id} className="group p-0.5 border-primary/5 hover:border-primary/20 transition-all rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="p-3 md:p-4 flex flex-col md:flex-row items-start md:items-center gap-3">
              <div className="flex-grow space-y-0.5 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-0.5">
                  <span className="text-[10px] md:text-[11px] font-black text-foreground truncate">{msg.name}</span>
                  <Badge variant={msg.status === 'replied' ? 'default' : 'secondary'} className="rounded-full text-[7px] font-black uppercase px-1.5 py-0 h-3.5">
                    {msg.status}
                  </Badge>
                </div>
                <h3 className="text-xs md:text-sm font-bold text-foreground line-clamp-1">{msg.subject}</h3>
                <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-1 italic opacity-70">"{msg.message}"</p>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-primary/5">
                <div className="flex flex-col items-start md:items-end gap-0.5">
                  <div className="flex items-center gap-1 text-[8px] md:text-[9px] font-black text-muted-foreground uppercase">
                    <Clock className="w-2.5 h-2.5" />
                    {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                  </div>
                </div>

                <Link
                  href={`/admin/messages/${msg._id}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-lg h-8 px-3 font-black gap-1 border-primary/10 hover:bg-primary hover:text-white transition-all text-[9px] uppercase tracking-wider")}
                >
                  Reply
                  <ChevronRight className="w-2.5 h-2.5" />
                </Link>
              </div>
            </div>
          </Card>
        ))}

        {filteredMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
             <Mail className="w-8 h-8 text-muted-foreground/20" />
             <p className="text-sm font-bold text-foreground uppercase tracking-widest">Inbox empty</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
