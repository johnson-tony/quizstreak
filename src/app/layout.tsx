import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/layout/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuizStreak | Master One Challenge Every Day",
  description: "Build your JavaScript, SQL, AWS, Aptitude and Interview skills through daily challenges, streaks and leaderboards.",
  icons: {
    icon: "/quickstreak.svg",
    apple: "/quickstreak.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/quickstreak.svg" as="image" />
      </head>
      <body className={`${inter.className} bg-background text-foreground min-h-screen relative safe-top safe-bottom overflow-x-hidden`}>
        {/* Modern decorative backgrounds - reduced excessive glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-primary/3 blur-[100px] rounded-full opacity-60" />
          <div className="absolute bottom-[5%] right-[-5%] w-[25%] h-[25%] bg-secondary/3 blur-[80px] rounded-full opacity-60" />
        </div>
        
        <Providers>
          <div className="relative flex flex-col min-h-screen">
            {children}
          </div>
        </Providers>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
