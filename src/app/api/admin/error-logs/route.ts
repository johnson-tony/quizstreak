import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import ErrorLog from '@/models/ErrorLog';

export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const logs = await ErrorLog.find({}).sort({ timestamp: -1 }).limit(100);
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    await ErrorLog.deleteMany({});
    return NextResponse.json({ message: 'Logs cleared' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear logs' }, { status: 500 });
  }
}
