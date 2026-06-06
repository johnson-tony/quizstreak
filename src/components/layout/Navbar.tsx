"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
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
import { LayoutDashboard, LogOut, Trophy, User, Menu } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <nav className="border-b border-primary/5 bg-white/80 backdrop-blur-xl sticky top-0 z-50 safe-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <img src="/quickstreak.svg" alt="QuizStreak Logo" className="w-8 h-8" />
              <span className="text-xl font-bold text-primary tracking-tight">
                QuizStreak
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              {session && (
                <Link
                  href="/dashboard"
                  className={`text-sm font-semibold transition-colors ${
                    pathname === "/dashboard" ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  Dashboard
                </Link>
              )}
              <Link
                href="/leaderboard"
                className={`text-sm font-semibold transition-colors ${
                  pathname === "/leaderboard" ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                Leaderboard
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-primary/5 hover:ring-primary/20 transition-all p-0" />}>
                  <Avatar className="h-full w-full">
                    <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{session.user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2 glass-card rounded-xl border-primary/10" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal py-2.5">
                      <div className="flex flex-col space-y-1">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider">Account</p>
                        <p className="text-sm font-bold text-foreground leading-none truncate">{session.user?.name}</p>
                        <p className="text-[10px] text-muted-foreground leading-none truncate">{session.user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-primary/5" />
                  <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer font-semibold py-2">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => signIn("google")} className="bg-primary hover:bg-primary/90 text-white rounded-lg px-4 h-9 text-xs font-bold shadow-sm shadow-primary/20">
                Login
              </Button>
            )}
            
            {/* Mobile Menu Icon Placeholder (for future logic if needed) */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
