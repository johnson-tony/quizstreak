import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'allTime';

  await dbConnect();

  let users = [];

  if (type === 'allTime') {
    users = await User.find({})
      .sort({ totalPoints: -1 })
      .limit(100)
      .select('name image totalPoints badges');
  } else {
    // For weekly/monthly, we'd ideally aggregate points from Attempt collection
    // but for now, we'll return allTime as a placeholder or implement simple aggregation
    users = await User.find({})
      .sort({ totalPoints: -1 })
      .limit(100)
      .select('name image totalPoints badges');
  }

  return NextResponse.json(users);
}
