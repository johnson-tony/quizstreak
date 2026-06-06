"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
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
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="text-center"
            >
              <motion.h1 
                variants={itemVariants}
                className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6"
              >
                Master One Challenge <br />
                <span className="text-blue-600">Every Single Day</span>
              </motion.h1>
              <motion.p 
                variants={itemVariants}
                className="max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed"
              >
                Build your JavaScript, SQL, AWS, Aptitude and Interview skills through 
                daily challenges, streaks and leaderboards.
              </motion.p>
              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row justify-center gap-4"
              >
                <Link 
                  href="/dashboard" 
                  className={buttonVariants({ 
                    size: "lg", 
                    className: "bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-8 h-14 text-lg font-semibold shadow-lg shadow-blue-200" 
                  })}
                >
                  Start Today's Challenge
                </Link>
                <Link 
                  href="/dashboard" 
                  className={buttonVariants({ 
                    variant: "outline", 
                    size: "lg", 
                    className: "bg-white border-gray-200 text-gray-700 rounded-2xl px-8 h-14 text-lg font-semibold hover:bg-gray-50" 
                  })}
                >
                  Continue with Google
                </Link>
              </motion.div>
            </motion.div>

            {/* Mockup / Image Placeholder */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-20 relative max-w-5xl mx-auto"
            >
              <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[32px] shadow-2xl overflow-hidden aspect-[16/9] flex items-center justify-center">
                <div className="text-center p-8">
                  <Code2 className="w-24 h-24 text-blue-100 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">Interactive Challenge Interface</p>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -z-10 -top-10 -left-10 w-40 h-40 bg-blue-200/20 blur-3xl rounded-full" />
              <div className="absolute -z-10 -bottom-10 -right-10 w-60 h-60 bg-blue-300/20 blur-3xl rounded-full" />
            </motion.div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Total Users", value: "10K+", icon: Users },
                { label: "Challenges Solved", value: "250K+", icon: CheckCircle2 },
                { label: "Active Streaks", value: "5K+", icon: TrendingUp },
                { label: "Daily Participants", value: "2K+", icon: Trophy },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-4">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-24 bg-[#F7F8FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Skill Categories</h2>
              <p className="text-gray-600">Focused challenges to level up your engineering career.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "JavaScript", icon: Code2, desc: "Master ES6+, React patterns, and async programming." },
                { title: "SQL", icon: Database, desc: "Complex queries, indexing, and database optimization." },
                { title: "AWS", icon: Cloud, desc: "Cloud architecture, serverless, and infrastructure." },
                { title: "Aptitude", icon: Brain, desc: "Logical reasoning and quantitative problem solving." },
                { title: "Debugging", icon: Bug, desc: "Identify and fix common bugs in real-world scenarios." },
                { title: "Interview Prep", icon: MessageSquare, desc: "Behavioral and technical questions from top companies." },
              ].map((cat, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -8 }}
                  className="p-8 bg-white/70 backdrop-blur-md border border-white/80 rounded-[24px] shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                    <cat.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{cat.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{cat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            </div>
            <div className="relative">
              {/* Connector Line */}
              <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-blue-100 -translate-y-1/2" />
              
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {[
                  { step: "01", title: "Login", desc: "One-click Google login to start." },
                  { step: "02", title: "Solve", desc: "Face one curated challenge daily." },
                  { step: "03", title: "Earn", desc: "Get points for every correct answer." },
                  { step: "04", title: "Streak", desc: "Build consistency and earn bonuses." },
                  { step: "05", title: "Climb", desc: "Compete on global leaderboards." },
                ].map((step, i) => (
                  <div key={i} className="relative z-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg mx-auto mb-6 shadow-lg shadow-blue-200">
                      {step.step}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-500 px-4">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-blue-600 rounded-[32px] p-12 text-center text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32 rounded-full" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 blur-3xl -ml-32 -mb-32 rounded-full" />
              
              <h2 className="text-4xl font-bold mb-6 relative z-10">Ready to start your streak?</h2>
              <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto relative z-10">
                Join thousands of engineers sharpening their skills one day at a time. 
                Free forever. No spam.
              </p>
              <Link 
                href="/dashboard" 
                className={buttonVariants({ 
                  size: "lg", 
                  className: "bg-white text-blue-600 hover:bg-blue-50 rounded-2xl px-10 h-14 text-lg font-bold relative z-10 transition-transform active:scale-95 flex items-center justify-center" 
                })}
              >
                Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-2xl font-bold text-blue-600">QuizStreak</div>
            <div className="flex gap-8 text-sm font-medium text-gray-500">
              <Link href="#" className="hover:text-blue-600 transition-colors">About</Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">Terms</Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">Contact</Link>
            </div>
            <div className="text-sm text-gray-400">
              © 2026 QuizStreak. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
