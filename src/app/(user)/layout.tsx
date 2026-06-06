"use client";

import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Trophy, 
  Zap, 
  LogOut, 
  Menu,
  X,
  Sparkles,
  BookOpen,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    redirect("/");
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Leaderboard", href: "/rankings", icon: Trophy },
    { name: "Daily Task", href: "/challenge", icon: Zap },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-primary/5 bg-white/80 backdrop-blur-xl sticky top-0 h-screen">
        <div className="p-6 border-b border-primary/5">
          <Link href="/" className="flex items-center gap-3">
            <img src="/quickstreak.svg" alt="Logo" className="w-8 h-8" />
            <span className="text-xl font-black text-primary tracking-tight font-heading">QuizStreak</span>
          </Link>
        </div>
        
        <nav className="flex-grow p-4 flex flex-col gap-2 mt-4">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-3 mb-2">Navigation</p>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                pathname === item.href 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
              }`}>
                <item.icon className="w-4 h-4" />
                {item.name}
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 space-y-3 border-t border-primary/5">
          <div className="bg-primary/5 rounded-2xl p-4 flex items-center justify-between group hover:bg-primary/10 transition-colors">
            <div className="min-w-0">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">Total Score</p>
              <p className="text-sm font-black text-foreground truncate">{(session?.user as any)?.totalPoints || 0} PTS</p>
            </div>
            <Trophy className="w-4 h-4 text-primary fill-primary opacity-20 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="bg-orange-500/5 rounded-2xl p-4 flex items-center justify-between group hover:bg-orange-500/10 transition-colors">
            <div>
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest leading-none mb-1">Daily Streak</p>
              <p className="text-sm font-black text-foreground">Set #{(session?.user as any)?.currentSet || 1}</p>
            </div>
            <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Header (Desktop & Mobile) */}
        <header className="border-b border-primary/5 bg-white/80 backdrop-blur-xl sticky top-0 z-50 px-4 md:px-8 h-16 flex items-center justify-between safe-top">
          {/* Logo only on Mobile Header */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <img src="/quickstreak.svg" alt="Logo" className="w-7 h-7" />
              <div className="text-lg font-black text-primary tracking-tight">QuizStreak</div>
            </Link>
          </div>
          
          {/* Desktop Spacer (Header is empty on left/center for desktop) */}
          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-primary/5 hover:ring-primary/20 transition-all p-0" />}>
                <Avatar className="h-full w-full">
                  <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                  <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{session?.user?.name?.[0]}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2 glass-card rounded-xl border-primary/10" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal py-2.5">
                    <div className="flex flex-col space-y-1">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Account</p>
                      <p className="text-sm font-bold text-foreground leading-none truncate">{session?.user?.name}</p>
                      <p className="text-[10px] text-muted-foreground leading-none truncate">{session?.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-primary/5" />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer font-bold py-2">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Icon */}
            <div className="lg:hidden">
              <button 
                onClick={() => {
                  console.log("Opening mobile menu...");
                  setIsMobileMenuOpen(true);
                }} 
                className="flex items-center justify-center w-10 h-10 rounded-xl text-primary hover:bg-primary/5 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-grow pb-10">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence mode="wait">
        {isMobileMenuOpen && (
          <motion.div 
            key="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
          />
        )}
        {isMobileMenuOpen && (
          <motion.aside 
            key="mobile-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-[110] lg:hidden shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-primary/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/quickstreak.svg" alt="Logo" className="w-8 h-8" />
                <span className="text-xl font-black text-primary font-heading tracking-tight">QuizStreak</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <nav className="flex-grow p-4 space-y-2 mt-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-black transition-all ${
                    pathname === item.href ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-primary/5"
                  }`}>
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </div>
                </Link>
              ))}
            </nav>

            <div className="p-6 border-t border-primary/5">
              <Button 
                variant="outline" 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full h-14 border-destructive/10 text-destructive rounded-2xl font-black gap-3"
              >
                <LogOut className="w-5 h-5" /> Logout
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
