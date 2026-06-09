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
  Loader2
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[9px] bg-primary/5 w-fit px-2.5 py-0.5 rounded-full border border-primary/10">
            <Mail className="w-2.5 h-2.5" />
            Inbox
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Inquiries</h1>
          <p className="text-muted-foreground font-medium text-xs md:text-sm">Manage and respond to user feedback and support requests.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-grow md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 h-10 w-full md:w-60 bg-white border border-primary/10 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredMessages.map((msg) => (
          <Card key={msg._id} className="group p-0.5 border-primary/5 hover:border-primary/20 transition-all duration-300 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-lg hover:shadow-primary/5">
            <div className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-grow space-y-0.5 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-0.5">
                  <span className="text-[11px] font-black text-foreground truncate">{msg.name}</span>
                  <span className="text-[10px] font-medium text-muted-foreground truncate opacity-70">{msg.email}</span>
                  <Badge variant={msg.status === 'replied' ? 'default' : 'secondary'} className="rounded-full text-[8px] font-black uppercase px-1.5 py-0 h-4">
                    {msg.status}
                  </Badge>
                </div>
                <h3 className="text-sm font-bold text-foreground line-clamp-1">{msg.subject}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1 italic opacity-80">"{msg.message}"</p>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-primary/5">
                <div className="flex flex-col items-start md:items-end gap-0.5">
                  <div className="flex items-center gap-1 text-[9px] font-black text-muted-foreground uppercase tracking-wider">
                    <Clock className="w-2.5 h-2.5" />
                    {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                  </div>
                  {msg.status === 'replied' && (
                    <div className="flex items-center gap-1 text-[9px] font-black text-primary uppercase tracking-wider">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Replied
                    </div>
                  )}
                </div>

                <Link
                  href={`/admin/messages/${msg._id}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl h-9 px-4 font-black gap-1.5 border-primary/10 hover:bg-primary hover:text-white transition-all text-[10px]")}
                >
                  View & Reply
                  <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </Card>
        ))}

        {filteredMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center border border-primary/10">
              <Mail className="w-10 h-10 text-primary/20" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-foreground">No messages found</h3>
              <p className="text-muted-foreground font-medium">When users contact you, their messages will appear here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
