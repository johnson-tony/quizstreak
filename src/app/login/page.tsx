"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      router.replace(role === "admin" ? "/admin/dashboard" : "/dashboard");
    }
  }, [status, session, router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      toast.error("Google login failed. Please try again.");
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-secondary/5 blur-[100px] rounded-full" />
      </div>

      <Card className="w-full max-w-md glass-card rounded-[2.5rem] border-primary/10 shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-500">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-accent" />

        <CardHeader className="pt-12 pb-8 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-inner ring-1 ring-primary/10">
            <img src="/quickstreak.svg" alt="Logo" className="w-10 h-10" />
          </div>
          <CardTitle className="text-3xl font-black text-foreground tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-sm font-medium text-muted-foreground mt-2 max-w-[240px] mx-auto">
            Log in to continue your streak and conquer today&apos;s challenges.
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-12 px-8">
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-14 bg-white hover:bg-muted/50 text-foreground border border-primary/10 rounded-2xl font-black shadow-xl shadow-primary/5 transition-all active:scale-[0.98] flex items-center justify-center gap-4 group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <>
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c1.67-1.54 2.63-3.81 2.63-6.09z" style={{ fill: "#4285F4" }} />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" style={{ fill: "#34A853" }} />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.16H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.84l3.66-2.75z" style={{ fill: "#FBBC05" }} />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.16l3.66 2.75c.87-2.6 3.3-4.53 6.16-4.53z" style={{ fill: "#EA4335" }} />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </Button>

          <div className="mt-10 pt-8 border-t border-primary/5 text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3 text-primary" /> Verified Secure Access
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
