import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
            <div className="relative w-24 h-24 rounded-[2rem] bg-white shadow-2xl flex items-center justify-center border border-primary/5">
              <FileQuestion className="w-12 h-12 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl font-black tracking-tight text-foreground">Page Not Found</h1>
          <p className="text-muted-foreground font-medium text-lg">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/">
            <Button className="rounded-2xl font-black h-14 px-8 shadow-xl shadow-primary/20 gap-2 w-full sm:w-auto">
              <Home className="w-5 h-5" /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
