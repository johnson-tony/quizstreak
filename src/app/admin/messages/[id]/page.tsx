"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Reply, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  User,
  Calendar,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
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

export default function MessageDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [message, setMessage] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const res = await fetch(`/api/contact/${id}`);
        const data = await res.json();
        if (data.contact) {
          setMessage(data.contact);
        } else {
          toast.error("Message not found");
          router.push("/admin/messages");
        }
      } catch (error) {
        toast.error("Failed to load message");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMessage();
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this message? This action cannot be undone.")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete message");

      toast.success("Message deleted successfully");
      router.push("/admin/messages");
    } catch (error) {
      toast.error("Failed to delete message");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReply = async () => {
    if (!message || !replyText.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/contact/${message._id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText }),
      });

      if (!res.ok) throw new Error("Failed to send reply");

      toast.success("Reply sent successfully via email!");
      setReplyText("");
      
      // Refresh message data to show new reply
      const updatedRes = await fetch(`/api/contact/${id}`);
      const updatedData = await updatedRes.json();
      if (updatedData.contact) {
        setMessage(updatedData.contact);
      }
    } catch (error) {
      toast.error("Failed to send reply. Check your email configuration.");
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!message) return null;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          asChild
          className="rounded-xl font-bold gap-2 text-muted-foreground hover:text-foreground"
        >
          <Link href="/admin/messages">
            <ArrowLeft className="w-4 h-4" />
            Back to Inbox
          </Link>
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-xl font-bold gap-2 px-4 h-9 text-[10px] uppercase tracking-widest shadow-lg shadow-destructive/20"
        >
          {isDeleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <Trash2 className="w-3.5 h-3.5" />
              Delete Message
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Message Details</h1>
            <Badge variant={message.status === 'replied' ? 'default' : 'secondary'} className="rounded-full text-[10px] font-black uppercase tracking-widest px-3 py-1">
              {message.status}
            </Badge>
          </div>
          <p className="text-muted-foreground font-medium text-xs md:text-sm">Viewing inquiry from {message.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 md:p-8 border-primary/10 rounded-[2rem] bg-white/50 backdrop-blur-sm shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-primary/5 pb-6">
              <div className="space-y-1.5">
                <div className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                  <User className="w-3 h-3" /> Sender
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-black text-foreground">{message.name}</span>
                  <span className="text-sm font-medium text-muted-foreground">{message.email}</span>
                </div>
              </div>
              <div className="space-y-1.5 md:text-right">
                <div className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 md:justify-end">
                  <Calendar className="w-3 h-3" /> Received On
                </div>
                <div className="text-sm font-bold text-foreground">
                  {format(new Date(message.createdAt), 'MMMM do, yyyy @ h:mm a')}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-[10px] font-black text-primary uppercase tracking-widest">Subject</div>
                <h4 className="text-xl md:text-2xl font-black text-foreground leading-tight">{message.subject}</h4>
              </div>

              <div className="space-y-4 p-6 md:p-8 bg-primary/5 rounded-[2rem] border border-primary/10 relative group">
                <MessageSquare className="absolute right-6 top-6 w-6 h-6 text-primary/10 group-hover:text-primary/20 transition-colors" />
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Message Content</div>
                <p className="text-sm md:text-lg font-medium text-foreground leading-relaxed whitespace-pre-wrap">
                  {message.message}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 md:p-8 border-primary/10 rounded-[2rem] bg-white/50 backdrop-blur-sm shadow-sm space-y-4">
            <div className="text-[10px] font-black text-primary uppercase tracking-widest">Send a Reply</div>
            <div className="space-y-4">
              <textarea 
                className="w-full h-40 md:h-56 bg-primary/5 border-none rounded-2xl p-6 text-sm md:text-base font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none placeholder:text-muted-foreground/40"
                placeholder="Type your response here... Your reply will be sent directly to the user's email address."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleReply}
                  disabled={isSending || !replyText.trim()}
                  size="lg"
                  className="w-full md:w-auto px-10 h-14 rounded-2xl text-base font-black shadow-lg shadow-primary/20 gap-3"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Send Email Reply
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 md:p-8 border-primary/10 rounded-[2rem] bg-white/50 backdrop-blur-sm shadow-sm flex flex-col h-full min-h-[400px]">
            <div className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 mb-6">
              <Reply className="w-3.5 h-3.5" /> Correspondence History
            </div>
            
            <div className="flex-grow space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {message.replies.length > 0 ? (
                message.replies.map((reply, i) => (
                  <div key={i} className="p-5 border border-primary/10 rounded-2xl bg-white shadow-sm space-y-3 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                    <p className="text-sm font-medium text-foreground whitespace-pre-wrap leading-relaxed">{reply.message}</p>
                    <div className="pt-3 border-t border-primary/5 flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase tracking-wider">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Sent by {reply.adminEmail}
                      </div>
                      <div className="text-[8px] font-bold text-muted-foreground/60">
                        {format(new Date(reply.sentAt), 'MMMM do, h:mm a')}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-primary/[0.02] rounded-2xl border border-dashed border-primary/10">
                  <Mail className="w-10 h-10 text-primary/10 mb-4" />
                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">No previous replies sent</p>
                  <p className="text-xs font-medium text-muted-foreground/60 mt-1 italic">Start the conversation by sending a reply.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
