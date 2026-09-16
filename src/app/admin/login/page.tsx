"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      router.replace(role === "admin" ? "/admin/dashboard" : "/dashboard");
    }
  }, [status, session, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid admin credentials");
      } else {
        toast.success("Welcome back, Administrator");
        router.replace("/admin/dashboard");
      }
    } catch (error) {
      toast.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/5 blur-[100px] rounded-full" />
      </div>

      <Card className="w-full max-w-sm glass-card rounded-2xl border-primary/10 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent" />

        <CardHeader className="pt-6 pb-4 text-center">
          <div className="mx-auto w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-xl font-black text-foreground tracking-tight uppercase">Admin Portal</CardTitle>
        </CardHeader>

        <CardContent className="pb-8 px-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[9px] font-black uppercase tracking-widest text-primary px-1">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input id="email" type="email" placeholder="admin@quizstreak.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-11 pl-9 pr-4 bg-muted/30 border border-primary/5 rounded-xl text-xs font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[9px] font-black uppercase tracking-widest text-primary px-1">Secure Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-11 pl-9 pr-12 bg-muted/30 border border-primary/5 rounded-xl text-xs font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors outline-none">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md shadow-primary/10 transition-all active:scale-[0.98] mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Access"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
