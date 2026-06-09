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
    if (!confirm("Delete this message?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete message");

      toast.success("Message deleted");
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

      toast.success("Reply sent successfully!");
      setReplyText("");
      
      const updatedRes = await fetch(`/api/contact/${id}`);
      const updatedData = await updatedRes.json();
      if (updatedData.contact) {
        setMessage(updatedData.contact);
      }
    } catch (error) {
      toast.error("Failed to send reply");
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!message) return null;

  return (
    <div className="p-2 md:p-6 max-w-5xl mx-auto space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-3">
        <Button 
          variant="ghost" 
          size="sm" 
          asChild
          className="rounded-lg font-bold gap-1.5 text-muted-foreground hover:text-foreground h-8 px-2"
        >
          <Link href="/admin/messages">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="text-[10px] md:text-xs">Inbox</span>
          </Link>
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-lg font-bold gap-1.5 px-3 h-8 text-[9px] uppercase tracking-widest shadow-sm"
        >
          {isDeleting ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <>
              <Trash2 className="w-3 h-3" />
              Delete
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight uppercase">Message Details</h1>
            <Badge variant={message.status === 'replied' ? 'default' : 'secondary'} className="rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
              {message.status}
            </Badge>
          </div>
          <p className="text-muted-foreground font-medium text-[10px] md:text-xs uppercase tracking-wider">Inquiry from {message.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        <div className="lg:col-span-8 space-y-4 md:space-y-6">
          <Card className="p-4 md:p-6 border-primary/10 rounded-xl md:rounded-2xl bg-white shadow-sm space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-primary/5 pb-4">
              <div className="space-y-1">
                <div className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                  <User className="w-2.5 h-2.5" /> Sender
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-foreground">{message.name}</span>
                  <span className="text-[10px] md:text-xs font-medium text-muted-foreground">{message.email}</span>
                </div>
              </div>
              <div className="space-y-1 md:text-right">
                <div className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 md:justify-end">
                  <Calendar className="w-2.5 h-2.5" /> Received On
                </div>
                <div className="text-xs md:text-sm font-bold text-foreground">
                  {format(new Date(message.createdAt), 'MMM do, yyyy @ h:mm a')}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="text-[9px] font-black text-primary uppercase tracking-widest">Subject</div>
                <h4 className="text-base md:text-xl font-black text-foreground leading-tight">{message.subject}</h4>
              </div>

              <div className="space-y-2 p-4 bg-primary/5 rounded-xl border border-primary/10 relative group">
                <MessageSquare className="absolute right-3 top-3 w-4 h-4 text-primary/10 group-hover:text-primary/20 transition-colors" />
                <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Message Content</div>
                <p className="text-[11px] md:text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap">
                  {message.message}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <Button 
                  asChild
                  size="sm"
                  className="w-full md:w-auto px-6 h-9 rounded-lg text-[10px] md:text-xs font-black shadow-md shadow-primary/10 gap-2 uppercase tracking-widest"
                >
                  <a href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`}>
                    Reply
                    <Send className="w-3.5 h-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-4 md:space-y-6">
          <Card className="p-4 md:p-6 border-primary/10 rounded-xl md:rounded-2xl bg-white shadow-sm flex flex-col h-full min-h-[300px]">
            <div className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 mb-4">
              <Reply className="w-3 h-3" /> History
            </div>
            
            <div className="flex-grow space-y-3 overflow-y-auto pr-1 custom-scrollbar">
              {message.replies.length > 0 ? (
                message.replies.map((reply, i) => (
                  <div key={i} className="p-3 border border-primary/10 rounded-xl bg-white shadow-sm space-y-2 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-0.5 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                    <p className="text-[11px] md:text-xs font-medium text-foreground whitespace-pre-wrap leading-relaxed">{reply.message}</p>
                    <div className="pt-2 border-t border-primary/5 flex flex-col gap-0.5">
                      <div className="flex items-center gap-1 text-[8px] font-black text-primary uppercase tracking-wider">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Sent by {reply.adminEmail}
                      </div>
                      <div className="text-[7px] font-bold text-muted-foreground/60">
                        {format(new Date(reply.sentAt), 'MMM do, h:mm a')}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-primary/[0.02] rounded-xl border border-dashed border-primary/10">
                  <Mail className="w-6 h-6 text-primary/10 mb-2" />
                  <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">No replies yet</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
