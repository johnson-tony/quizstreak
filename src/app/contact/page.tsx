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
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-8 text-center space-y-6 border-primary/10 shadow-2xl shadow-primary/5 rounded-[2.5rem] animate-in zoom-in duration-500">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-foreground tracking-tight">Thank You!</h2>
              <p className="text-muted-foreground font-medium">
                Your message has been received. Our team will get back to you shortly via email.
              </p>
            </div>
            <Link 
              href="/dashboard"
              className={cn(buttonVariants(), "w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20")}
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
      
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-full max-w-xl space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-4">
              <Mail className="w-3.5 h-3.5" />
              Contact Support
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-[1.1]">
              How can we <span className="text-primary">help?</span>
            </h1>
            <p className="text-muted-foreground font-medium max-w-sm mx-auto">
              Send us a message and we&apos;ll get back to you as soon as possible.
            </p>
          </div>

          <Card className="p-1 border-primary/5 shadow-2xl shadow-primary/5 rounded-[2.5rem] overflow-hidden bg-white/50 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                    <User className="w-3 h-3" /> Full Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-12 bg-primary/5 border-none rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Email Address
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-12 bg-primary/5 border-none rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                  <Type className="w-3 h-3" /> Subject
                </label>
                <input
                  required
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full h-12 bg-primary/5 border-none rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="What is this regarding?"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" /> Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-primary/5 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                  placeholder="Tell us more about your request..."
                />
              </div>

              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 rounded-2xl text-lg font-black shadow-lg shadow-primary/20 transition-all active:scale-[0.98] group"
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Send Message
                    <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </Card>

          <p className="text-center text-xs font-bold text-muted-foreground">
            Typically responds within 1 hour.
          </p>
        </div>
      </main>
    </div>
  );
}
