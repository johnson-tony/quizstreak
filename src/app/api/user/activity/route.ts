import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Attempt from '@/models/Attempt';

export async function GET(req: Request) {
  const session = await auth(req);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Get all attempts for the heatmap/timeline
  const allAttempts = await Attempt.find({ userId: user._id }, 'date correct');

  return NextResponse.json(allAttempts);
}
