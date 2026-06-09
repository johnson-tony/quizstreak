'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-foreground">Something went wrong!</h1>
          <p className="text-muted-foreground font-medium">
            We encountered an unexpected error. Don't worry, our team has been notified.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => reset()}
            className="rounded-xl font-bold gap-2"
          >
            <RefreshCcw className="w-4 h-4" /> Try again
          </Button>
          <Link href="/">
            <Button variant="outline" className="rounded-xl font-bold gap-2 w-full">
              <Home className="w-4 h-4" /> Go Home
            </Button>
          </Link>
        </div>
        
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">
          Error ID: {error.digest || 'unknown'}
        </p>
      </div>
    </div>
  );
}
