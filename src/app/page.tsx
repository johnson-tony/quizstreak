"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { buttonVariants, Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import { signIn, useSession } from "next-auth/react";
import { 
  CheckCircle2, 
  TrendingUp, 
  Trophy, 
  Users, 
  Code2, 
  Database, 
  Cloud, 
  Brain, 
  Bug, 
  MessageSquare,
  ArrowRight
} from "lucide-react";

export default function LandingPage() {
  const { status } = useSession();
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-12 pb-20 overflow-hidden px-4">
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="text-center"
            >
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold mb-6"
              >
                <Trophy className="w-3 h-3" />
                <span>2026 Season Now Live</span>
              </motion.div>
              
              <motion.h1 
                variants={itemVariants}
                className="text-4xl md:text-6xl font-black text-foreground tracking-tight mb-4 leading-[1.1]"
              >
                Master One Challenge <br />
                <span className="text-primary italic">Every Single Day</span>
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="max-w-xl mx-auto text-base text-muted-foreground mb-8 leading-relaxed px-2"
              >
                Build your engineering career through focused daily challenges. 
                JavaScript, SQL, AWS, and more.
              </motion.p>
              
              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row justify-center gap-3"
              >
                <Link 
                  href="/dashboard" 
                  className={buttonVariants({ 
                    size: "lg", 
                    className: "bg-primary hover:bg-primary/90 text-white rounded-xl px-8 h-12 text-sm font-bold shadow-lg shadow-primary/10" 
                  })}
                >
                  {status === "authenticated" ? "Go to Dashboard" : "Start Challenge"}
                </Link>
                {status === "unauthenticated" && (
                  <Button 
                    onClick={() => signIn("google")}
                    variant="outline" 
                    size="lg" 
                    className="bg-white/50 border-primary/10 text-foreground rounded-xl px-8 h-12 text-sm font-bold hover:bg-white transition-all"
                  >
                    Continue with Google
                  </Button>
                )}
              </motion.div>
            </motion.div>

            {/* Mockup - More compact and premium */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-16 relative max-w-4xl mx-auto"
            >
              <div className="bg-white/80 backdrop-blur-xl border border-primary/10 rounded-2xl shadow-2xl overflow-hidden aspect-[16/10] flex items-center justify-center p-4">
                <div className="w-full h-full bg-primary/[0.02] rounded-xl border border-primary/5 flex items-center justify-center relative group">
                  <div className="absolute inset-0 bg-radial-gradient(circle,rgba(122,31,77,0.03),transparent)" />
                  <Code2 className="w-16 h-16 text-primary/10 group-hover:text-primary/20 transition-colors duration-700" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories Section - Compact Grid */}
        <section className="py-16 bg-white/30 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-4">
              <div className="max-w-md">
                <h2 className="text-2xl font-black text-foreground mb-2">Skill Categories</h2>
                <p className="text-sm text-muted-foreground">Expertly curated challenges for modern engineering teams.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {[
                { title: "JavaScript", icon: Code2, desc: "ES6+, Patterns, Async" },
                { title: "SQL", icon: Database, desc: "Queries, Indexes, Optimization" },
                { title: "AWS", icon: Cloud, desc: "Serverless, Cloud Arch" },
                { title: "Aptitude", icon: Brain, desc: "Logic & Problem Solving" },
                { title: "Debugging", icon: Bug, desc: "Real-world fix scenarios" },
                { title: "Interviews", icon: MessageSquare, desc: "Top company prep" },
              ].map((cat, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -4, borderColor: "rgba(122,31,77,0.2)" }}
                  className="p-4 md:p-6 bg-white/50 backdrop-blur-sm border border-primary/5 rounded-xl shadow-sm transition-all cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/5 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <cat.icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{cat.title}</h3>
                  <p className="text-xs text-muted-foreground leading-tight">{cat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Premium & Focused */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-primary rounded-2xl p-8 md:p-12 text-center text-white shadow-xl shadow-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl -mr-24 -mt-24 rounded-full" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 blur-3xl -ml-24 -mb-24 rounded-full" />
              
              <h2 className="text-3xl font-black mb-4 relative z-10">Start your streak today</h2>
              <p className="text-primary-foreground/70 text-sm mb-8 max-w-sm mx-auto relative z-10 leading-relaxed">
                Join 10K+ engineers sharpening their skills one day at a time. 
              </p>
              
              <Link 
                href="/dashboard" 
                className={buttonVariants({ 
                  size: "lg", 
                  className: "bg-white text-primary hover:bg-white/90 rounded-xl px-8 h-12 text-sm font-bold relative z-10 transition-transform active:scale-95 inline-flex items-center" 
                })}
              >
                Join Now <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Compact Footer */}
      <footer className="bg-white/50 border-t border-primary/5 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-lg font-bold text-primary">QuizStreak</div>
            <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
            </div>
            <div className="text-[10px] text-muted-foreground/60 font-medium">
              © 2026 QuizStreak
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
