"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Send, CheckCircle2, Loader2, User, Type, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ContactPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user?.name || "",
        email: session.user?.email || ""
      }));
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (status === "unauthenticated") {
      // Store form data in session storage to recover after login if needed
      // but the user asked to redirect to login page
      toast.info("Please sign in to submit your message");
      router.push("/login?callbackUrl=/contact");
      return;
    }

    setIsSubmitting(true);
    console.log("Submitting form data:", formData);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) throw new Error(data.error || "Failed to send message");

      setSubmitted(true);
      toast.success("Message sent successfully!");
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-3 sm:p-4">
          <Card className="w-full max-w-sm p-6 text-center space-y-4 border-primary/5 shadow-xl bg-white rounded-2xl md:rounded-[2rem] animate-in zoom-in duration-500">
            <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight uppercase">Message Received</h2>
              <p className="text-[10px] md:text-xs text-muted-foreground font-medium">
                Thank you! Our experts will review your request and get back to you shortly via email.
              </p>
            </div>
            <Link 
              href="/dashboard"
              className={cn(buttonVariants(), "w-full h-10 md:h-12 rounded-xl text-xs md:text-sm font-black shadow-lg shadow-primary/10 uppercase tracking-widest")}
            >
              Return to Dashboard
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-grow flex flex-col items-center justify-center px-2 sm:px-4 py-4 md:py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-full max-w-lg space-y-4 md:space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-widest">
              <Mail className="w-3 h-3" />
              Support
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-foreground tracking-tight leading-none uppercase">
              How can we <span className="text-primary italic">help?</span>
            </h1>
            <p className="text-[10px] md:text-xs text-muted-foreground font-medium max-w-[240px] md:max-w-sm mx-auto">
              Direct connection to our engineering and support team.
            </p>
          </div>

          <Card className="p-0.5 border-primary/5 shadow-xl bg-white/50 backdrop-blur-sm rounded-2xl md:rounded-[2rem] overflow-hidden">
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1 flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Full Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 md:h-11 bg-primary/5 border-none rounded-xl px-3 text-[11px] md:text-xs font-bold focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1 flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> Email Address
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-10 md:h-11 bg-primary/5 border-none rounded-xl px-3 text-[11px] md:text-xs font-bold focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1 flex items-center gap-1.5">
                  <Type className="w-3 h-3" /> Subject
                </label>
                <input
                  required
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full h-10 md:h-11 bg-primary/5 border-none rounded-xl px-3 text-[11px] md:text-xs font-bold focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                  placeholder="What is this regarding?"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3" /> Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-primary/5 border-none rounded-xl p-3 text-[11px] md:text-xs font-bold focus:ring-1 focus:ring-primary/20 transition-all outline-none resize-none"
                  placeholder="Tell us more about your request..."
                />
              </div>

              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 md:h-13 rounded-xl md:rounded-2xl text-xs md:text-sm font-black shadow-lg shadow-primary/10 transition-all active:scale-[0.98] group uppercase tracking-widest"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Send Message
                    <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </Card>

          <p className="text-center text-[9px] font-black text-muted-foreground uppercase tracking-widest">
            Typically responds within 1 hour.
          </p>

          {session && (
            <div className="pt-2 text-center">
              <Link href="/dashboard" className="text-[10px] md:text-xs font-bold text-primary hover:underline">
                ← Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
