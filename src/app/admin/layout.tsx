"use client";

import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  ChevronLeft,
  ShieldCheck
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Don't show sidebar/header on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (status === "loading") return null;

  if (status === "unauthenticated" || (session?.user as any)?.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Admin Header */}
      <header className="border-b border-primary/5 bg-white/80 backdrop-blur-xl sticky top-0 z-50 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/quickstreak.svg" alt="Logo" className="w-8 h-8" />
              <div className="text-xl font-black text-primary tracking-tight">Admin Console</div>
            </Link>
            <div className="h-6 w-[1px] bg-primary/10 hidden md:block" />
            <div className="hidden md:flex items-center gap-6 px-2">
              <Link 
                href="/admin/dashboard" 
                className={`text-sm font-bold flex items-center gap-2 transition-colors ${pathname === '/admin/dashboard' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
              >
                <LayoutDashboard className="w-4 h-4" /> Overview
              </Link>
              <Link 
                href="/admin/users" 
                className={`text-sm font-bold flex items-center gap-2 transition-colors ${pathname.startsWith('/admin/users') ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
              >
                <Users className="w-4 h-4" /> Users
              </Link>
              <Link 
                href="/admin/questions" 
                className={`text-sm font-bold flex items-center gap-2 transition-colors ${pathname === '/admin/questions' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
              >
                <Settings className="w-4 h-4" /> Curriculum
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <p className="text-xs font-black text-foreground uppercase tracking-widest leading-none">System Admin</p>
              <p className="text-[10px] text-primary/60 font-bold">{session?.user?.email}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => signOut({ callbackUrl: "/" })}
              className="h-10 w-10 text-destructive hover:bg-destructive/5 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full">
        {children}
      </main>
    </div>
  );
}
