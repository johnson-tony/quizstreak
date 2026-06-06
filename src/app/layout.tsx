import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/layout/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuizStreak | Master One Challenge Every Day",
  description: "Build your JavaScript, SQL, AWS, Aptitude and Interview skills through daily challenges, streaks and leaderboards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#F7F8FA] text-[#111827] min-h-screen relative`}>
        {/* Subtle radial glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
          <div className="absolute top-[40%] -right-[5%] w-[30%] h-[30%] bg-blue-400/5 blur-[100px] rounded-full" />
        </div>
        
        <Providers>
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>
        </Providers>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
