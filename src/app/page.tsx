"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { buttonVariants, Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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

  // Remove automatic redirect to allow seeing landing page
  // The Start Challenge button will handle the navigation

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
        <section className="relative pt-8 pb-16 md:pt-12 md:pb-12 overflow-hidden px-4">
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="text-center"
            >
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black mb-4 md:mb-6"
              >
                <Trophy className="w-3 h-3" />
                <span>2026 Season Now Live</span>
              </motion.div>
              
              <motion.h1 
                variants={itemVariants}
                className="text-[28px] sm:text-4xl md:text-6xl font-black text-foreground tracking-tight mb-4 leading-[1.2] md:leading-[1.1]"
              >
                Master One Challenge <br />
                <span className="text-primary italic">Every Single Day</span>
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="max-w-lg mx-auto text-xs sm:text-sm md:text-base text-muted-foreground mb-6 md:mb-8 leading-relaxed px-4"
              >
                Master the skills that matter. Daily professional challenges in Software Engineering, 
                Data Science, Cloud Architecture, and Analytical Aptitude.
              </motion.p>
              
              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row justify-center gap-3"
              >
                <Link 
                  href={status === "authenticated" ? "/dashboard" : "/login"} 
                  className={buttonVariants({ 
                    size: "lg", 
                    className: "bg-primary hover:bg-primary/90 text-white rounded-xl px-8 h-11 md:h-12 text-sm font-bold shadow-lg shadow-primary/10" 
                  })}
                >
                  {status === "authenticated" ? "Go to Dashboard" : "Start Your Streak"}
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
