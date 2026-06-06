import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  const session = await auth();
  
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const users = await User.find({})
    .sort({ totalPoints: -1 })
    .select('name email image totalPoints currentStreak longestStreak joinedAt lastAttemptDate');

  return NextResponse.json(users);
}
