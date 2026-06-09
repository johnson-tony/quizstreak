"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle2, 
  Reply, 
  ChevronRight,
  Search,
  Filter,
  Loader2,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

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
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
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

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/contact/${selectedMessage._id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText }),
      });

      if (!res.ok) throw new Error("Failed to send reply");

      toast.success("Reply sent successfully via email!");
      setReplyText("");
      setSelectedMessage(null);
      fetchMessages(); // Refresh list
    } catch (error) {
      toast.error("Failed to send reply. Check your email configuration.");
    } finally {
      setIsSending(false);
    }
  };

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
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] bg-primary/5 w-fit px-3 py-1 rounded-full border border-primary/10">
            <Mail className="w-3 h-3" />
            Inbox
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Inquiries</h1>
          <p className="text-muted-foreground font-medium">Manage and respond to user feedback and support requests.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 h-11 w-64 bg-white border border-primary/10 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredMessages.map((msg) => (
          <Card key={msg._id} className="group p-1 border-primary/5 hover:border-primary/20 transition-all duration-300 rounded-[2rem] overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-primary/5">
            <div className="p-5 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-grow space-y-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-black text-foreground">{msg.name}</span>
                  <span className="text-xs font-medium text-muted-foreground">{msg.email}</span>
                  <Badge variant={msg.status === 'replied' ? 'default' : 'secondary'} className="rounded-full text-[10px] font-black uppercase px-2 py-0">
                    {msg.status}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-foreground line-clamp-1">{msg.subject}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1 italic">"{msg.message}"</p>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-primary/5">
                <div className="hidden lg:flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                    <Clock className="w-3 h-3" />
                    {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                  </div>
                  {msg.status === 'replied' && (
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3" />
                      Replied
                    </div>
                  )}
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => setSelectedMessage(msg)}
                      variant="outline" 
                      className="rounded-2xl h-12 px-6 font-black gap-2 border-primary/10 hover:bg-primary hover:text-white transition-all group/btn"
                    >
                      View & Reply
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl rounded-[2.5rem] border-primary/10 p-0 overflow-hidden bg-white">
                    <DialogHeader className="p-8 pb-4 border-b border-primary/5 bg-primary/5">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <DialogTitle className="text-2xl font-black text-foreground">Message Details</DialogTitle>
                          <p className="text-sm font-medium text-muted-foreground">From {msg.name} ({msg.email})</p>
                        </div>
                        <Badge variant={msg.status === 'replied' ? 'default' : 'secondary'} className="rounded-full text-[10px] font-black uppercase tracking-widest px-3 py-1">
                          {msg.status}
                        </Badge>
                      </div>
                    </DialogHeader>
                    
                    <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                      <div className="space-y-3">
                        <div className="text-[10px] font-black text-primary uppercase tracking-widest">Subject</div>
                        <h4 className="text-xl font-black text-foreground">{msg.subject}</h4>
                      </div>

                      <div className="space-y-3 p-6 bg-primary/5 rounded-3xl border border-primary/10 relative">
                        <MessageSquare className="absolute right-6 top-6 w-5 h-5 text-primary/20" />
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Message Content</div>
                        <p className="text-base font-medium text-foreground leading-relaxed whitespace-pre-wrap">
                          {msg.message}
                        </p>
                        <div className="pt-4 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest border-t border-primary/5">
                          Received {format(new Date(msg.createdAt), 'MMMM do, yyyy @ h:mm a')}
                        </div>
                      </div>

                      {msg.replies.length > 0 && (
                        <div className="space-y-4">
                          <div className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                            <Reply className="w-3 h-3" /> Previous Replies
                          </div>
                          {msg.replies.map((reply, i) => (
                            <div key={i} className="p-5 border border-primary/10 rounded-2xl bg-white space-y-2">
                              <p className="text-sm font-medium text-foreground whitespace-pre-wrap">{reply.message}</p>
                              <div className="text-[10px] font-bold text-muted-foreground/60 flex items-center justify-between">
                                <span>By {reply.adminEmail}</span>
                                <span>{format(new Date(reply.sentAt), 'MMM d, h:mm a')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-3 pt-4">
                        <div className="text-[10px] font-black text-primary uppercase tracking-widest">Your Reply</div>
                        <textarea 
                          className="w-full h-32 bg-primary/5 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                          placeholder="Type your response here... It will be sent as an email."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                      </div>
                    </div>

                    <DialogFooter className="p-8 pt-4 border-t border-primary/5 bg-primary/5">
                      <Button 
                        onClick={handleReply}
                        disabled={isSending || !replyText.trim()}
                        className="w-full h-14 rounded-2xl text-lg font-black shadow-lg shadow-primary/20 gap-3"
                      >
                        {isSending ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <>
                            Send Reply via Email
                            <Send className="w-5 h-5" />
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
