import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req: Request) {
  const session = await auth();
  
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  // Main directory excludes deleted users; a separate trash view lists them via status=deleted
  const filter: Record<string, any> = status
    ? { status }
    : { status: { $ne: 'deleted' } };

  const users = await User.find(filter)
    .sort({ totalPoints: -1 })
    .select('name email image totalPoints currentStreak longestStreak joinedAt lastAttemptDate status');

  return NextResponse.json(users);
}
