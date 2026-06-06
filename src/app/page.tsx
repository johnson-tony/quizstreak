"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { buttonVariants, Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

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
                Master the skills that matter. Daily professional challenges in Software Engineering, 
                Data Science, Cloud Architecture, and Analytical Aptitude.
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
              </motion.div>
            </motion.div>
          </div>
        </section>

      </main>

      {/* Compact Footer */}
      <footer className="bg-white/50 border-t border-primary/5 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <img src="/quickstreak.svg" alt="QuizStreak Logo" className="w-8 h-8" />
              <div className="text-lg font-bold text-primary tracking-tight">QuizStreak</div>
            </Link>
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
