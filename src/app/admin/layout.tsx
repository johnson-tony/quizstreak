"use client";

import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  X,
  ShieldCheck,
  Sparkles,
  BookOpen,
  AlertCircle,
  Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Don't show sidebar/header on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (status === "loading") return null;

  if (status === "unauthenticated" || (session?.user as any)?.role !== "admin") {
    redirect("/admin/login");
  }

  const navItems = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Curriculum", href: "/admin/questions", icon: BookOpen },
    { name: "Messages", href: "/admin/messages", icon: Mail },
    { name: "Subscription", href: "/admin/settings", icon: Settings },
    { name: "System Health", href: "/admin/errors", icon: AlertCircle },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-primary/5 bg-white/80 backdrop-blur-xl sticky top-0 h-screen">
        <div className="py-3 px-6 border-b border-primary/5">
          <Link href="/" className="flex items-center gap-3">
            <img src="/quickstreak.svg" alt="Logo" className="w-8 h-8" />
            <span className="text-xl font-black text-primary tracking-tight">Console</span>
          </Link>
        </div>
        
        <nav className="flex-grow p-4 flex flex-col gap-2 mt-4">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-3 mb-2">Management</p>
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

        <div className="p-4 border-t border-primary/5">
          <div className="bg-primary/5 rounded-2xl p-4 mb-4">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">Active Admin</p>
            <p className="text-xs font-bold text-foreground truncate">{session?.user?.email}</p>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full justify-start gap-3 h-12 text-destructive hover:bg-destructive/5 rounded-xl font-bold transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Mobile Navbar */}
        <header className="lg:hidden border-b border-primary/5 bg-white/80 backdrop-blur-xl sticky top-0 z-50 px-3 h-12 flex items-center justify-between safe-top">
          <Link href="/" className="flex items-center gap-1.5">
            <img src="/quickstreak.svg" alt="Logo" className="w-6 h-6" />
            <div className="text-base font-black text-primary tracking-tight uppercase">Admin</div>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="w-8 h-8 rounded-lg text-primary">
            <Menu className="w-5 h-5" />
          </Button>
        </header>

        <main className="flex-grow pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[240px] bg-white z-[70] lg:hidden shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b border-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/quickstreak.svg" alt="Logo" className="w-6 h-6" />
                  <span className="text-lg font-black text-primary uppercase">Admin</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="w-8 h-8 rounded-full">
                  <X className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>

              <nav className="flex-grow p-3 space-y-1 mt-2">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      pathname === item.href ? "bg-primary text-white shadow-lg shadow-primary/10" : "text-muted-foreground hover:bg-primary/5"
                    }`}>
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </div>
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-primary/5">
                <Button 
                  variant="outline" 
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full h-10 border-destructive/10 text-destructive rounded-xl font-bold gap-2 text-xs uppercase"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
