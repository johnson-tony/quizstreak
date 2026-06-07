import { NextResponse } from 'next/server';
import ErrorLog from '@/models/ErrorLog';
import dbConnect from '@/lib/db';

export async function handleApiError(error: any, req: Request, userId?: string) {
  console.error('[API Error]:', error);

  try {
    await dbConnect();
    await ErrorLog.create({
      message: error.message || 'Unknown Error',
      stack: error.stack,
      path: new URL(req.url).pathname,
      method: req.method,
      userId: userId,
      timestamp: new Date(),
      metadata: {
        cause: error.cause,
        code: error.code,
      }
    });
  } catch (logError) {
    console.error('Failed to log error to database:', logError);
  }

  // Sanitize error for client
  const status = error.status || 500;
  let message = 'An unexpected error occurred. Please try again later.';
  
  if (error.code === 'EREFUSED' || error.name === 'MongooseServerSelectionError') {
    message = 'Our database is currently unavailable. We are working on it.';
  }

  return NextResponse.json({ error: message }, { status });
}
