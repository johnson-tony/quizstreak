import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Attempt from '@/models/Attempt';
import { handleApiError } from '@/lib/error-handler';
import { getAllQuestions } from '@/lib/google-sheets';

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
    const allAttempts = await Attempt.find({ userId: user._id });
    const totalSolved = allAttempts.filter(a => a.correct).length;
    const totalAttempts = allAttempts.length;
    const accuracy = totalAttempts > 0 ? (totalSolved / totalAttempts) * 100 : 0;

    // Category-wise stats
    const allQuestions = await getAllQuestions();
    const categoryStats: Record<string, { solved: number, points: number, total: number }> = {};

    allAttempts.forEach(att => {
      const q = allQuestions.find(quest => quest.day === att.questionId);
      if (q && q.category) {
        if (!categoryStats[q.category]) {
          categoryStats[q.category] = { solved: 0, points: 0, total: 0 };
        }
        categoryStats[q.category].total += 1;
        if (att.correct) {
          categoryStats[q.category].solved += 1;
          categoryStats[q.category].points += att.pointsEarned || 0;
        }
      }
    });

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
        categoryStats: Object.entries(categoryStats).map(([name, data]) => ({
          name,
          ...data
        })),
      }
    });
  } catch (error) {
    return handleApiError(error, req);
  }
}
