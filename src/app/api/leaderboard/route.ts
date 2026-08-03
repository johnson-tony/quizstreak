import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { handleApiError } from '@/lib/error-handler';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'allTime';

    await dbConnect();

    let users = [];

    // Only show active users; deleted (trashed) users are hidden from rankings
    const filter = { status: 'active' };

    if (type === 'allTime') {
      users = await User.find(filter)
        .sort({ totalPoints: -1 })
        .limit(100)
        .select('name image totalPoints badges');
    } else {
      users = await User.find(filter)
        .sort({ totalPoints: -1 })
        .limit(100)
        .select('name image totalPoints badges');
    }

    if (!users || users.length === 0) {
      return NextResponse.json([]);
    }

    return NextResponse.json(users);
  } catch (error) {
    return handleApiError(error, req);
  }
}
