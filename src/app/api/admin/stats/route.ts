import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Attempt from '@/models/Attempt';
import { getAllQuestions } from '@/lib/google-sheets';
import { handleApiError } from '@/lib/error-handler';

export async function GET(req: Request) {
  let session;
  try {
    session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const [totalUsers, totalAttempts, attempts, questions] = await Promise.all([
      User.countDocuments(),
      Attempt.countDocuments(),
      Attempt.find({}, 'correct'),
      getAllQuestions(),
    ]);

    const correctAttempts = attempts.filter(a => a.correct).length;
    const successRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    // Get growth stats (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const newUsersLastWeek = await User.countDocuments({ joinedAt: { $gte: sevenDaysAgo } });

    // Category breakdown
    const categoryCounts = questions.reduce((acc: any, q: any) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      totalUsers,
      totalAttempts,
      successRate,
      newUsersLastWeek,
      totalQuestions: questions.length,
      categoryCounts,
      activeToday: await User.countDocuments({ lastAttemptDate: { $gte: new Date().setUTCHours(0,0,0,0) } }),
    });
  } catch (error) {
    return handleApiError(error, req, session?.user?.id);
  }
}
