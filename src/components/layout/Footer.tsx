import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white/50 border-t border-primary/5 py-4 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/quickstreak.svg" alt="QuizStreak Logo" className="w-8 h-8" />
            <div className="text-lg font-bold text-primary tracking-tight">QuizStreak</div>
          </Link>
          <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </div>
          <div className="text-[10px] text-muted-foreground/60 font-medium">
            © 2026 QuizStreak
          </div>
        </div>
      </div>
    </footer>
  );
}
