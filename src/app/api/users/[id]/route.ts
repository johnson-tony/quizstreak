import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Attempt from '@/models/Attempt';
import { handleApiError } from '@/lib/error-handler';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const user = await User.findById(id).select('-email -googleId -status');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
        _id: user._id,
        name: user.name,
        image: user.image,
        totalPoints: user.totalPoints,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        badges: user.badges,
        joinedAt: user.joinedAt,
        rank,
      },
      stats: {
        totalSolved,
        accuracy: Math.round(accuracy),
        totalAttempts,
      }
    });
  } catch (error) {
    return handleApiError(error, req);
  }
}
