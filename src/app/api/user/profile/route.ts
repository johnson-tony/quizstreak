import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Attempt from '@/models/Attempt';
import { handleApiError } from '@/lib/error-handler';

export async function GET(req: Request) {
  let session;
  try {
    session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Reset streak if missed yesterday
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    if (user.lastAttemptDate && user.lastAttemptDate.getTime() < yesterday.getTime()) {
      user.currentStreak = 0;
      await user.save();
    }

    // Get rank
    const rank = await User.countDocuments({ totalPoints: { $gt: user.totalPoints } }) + 1;

    // Get total solved
    const totalSolved = await Attempt.countDocuments({ userId: user._id, correct: true });

    // Accuracy
    const totalAttempts = await Attempt.countDocuments({ userId: user._id });
    const accuracy = totalAttempts > 0 ? (totalSolved / totalAttempts) * 100 : 0;

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
        totalPoints: user.totalPoints,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        badges: user.badges,
        joinedAt: user.joinedAt,
        rank,
        persona: user.persona,
        preferredTrack: user.preferredTrack
      },
      stats: {
        totalSolved,
        accuracy: Math.round(accuracy),
        totalAttempts,
      }
    });
  } catch (error) {
    return handleApiError(error, req, session?.user?.id);
  }
}

export async function POST(req: Request) {
  let session;
  try {
    session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { persona, preferredTrack } = await req.json();
    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (persona) user.persona = persona;
    if (preferredTrack) user.preferredTrack = preferredTrack;
    
    await user.save();

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return handleApiError(error, req, session?.user?.id);
  }
}
