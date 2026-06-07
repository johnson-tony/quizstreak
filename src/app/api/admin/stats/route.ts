import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Attempt from '@/models/Attempt';

export async function GET(req: Request) {
  const session = await auth(req);
  
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const [totalUsers, totalAttempts, attempts] = await Promise.all([
    User.countDocuments(),
    Attempt.countDocuments(),
    Attempt.find({}, 'correct'),
  ]);

  const correctAttempts = attempts.filter(a => a.correct).length;
  const successRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  // Get growth stats (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const newUsersLastWeek = await User.countDocuments({ joinedAt: { $gte: sevenDaysAgo } });

  return NextResponse.json({
    totalUsers,
    totalAttempts,
    successRate,
    newUsersLastWeek,
    activeToday: await User.countDocuments({ lastAttemptDate: { $gte: new Date().setUTCHours(0,0,0,0) } }),
  });
}
