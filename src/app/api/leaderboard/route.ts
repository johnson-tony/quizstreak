import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Attempt from '@/models/Attempt';
import { handleApiError } from '@/lib/error-handler';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'allTime';

    await dbConnect();

    // Keep the existing daily/all-time ranking behavior unchanged.
    const filter = { status: 'active' };

    if (type !== 'weekly') {
      const users = await User.find(filter)
        .sort({ totalPoints: -1 })
        .limit(100)
        .select('name image totalPoints badges');

      return NextResponse.json(users || []);
    }

    // Weekly Challenge ranking: sum points earned from daily challenges
    // during the current UTC week (Monday 00:00 through Sunday 23:59).
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setUTCHours(0, 0, 0, 0);
    const day = weekStart.getUTCDay();
    const daysFromMonday = day === 0 ? 6 : day - 1;
    weekStart.setUTCDate(weekStart.getUTCDate() - daysFromMonday);

    const weekly = await Attempt.aggregate([
      {
        $match: {
          date: { $gte: weekStart },
          type: 'daily',
        },
      },
      {
        $group: {
          _id: '$userId',
          weeklyPoints: { $sum: '$pointsEarned' },
          challengesCompleted: { $addToSet: '$questionId' },
          correctAnswers: {
            $sum: { $cond: ['$correct', 1, 0] },
          },
        },
      },
      {
        $addFields: {
          challengesCompleted: { $size: '$challengesCompleted' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $match: {
          'user.status': 'active',
        },
      },
      {
        $project: {
          _id: '$user._id',
          name: '$user.name',
          image: '$user.image',
          badges: '$user.badges',
          weeklyPoints: 1,
          challengesCompleted: 1,
          correctAnswers: 1,
        },
      },
      {
        $sort: {
          weeklyPoints: -1,
          correctAnswers: -1,
          challengesCompleted: -1,
          name: 1,
        },
      },
      { $limit: 100 },
    ]);

    return NextResponse.json(weekly || []);
  } catch (error) {
    return handleApiError(error, req);
  }
}
