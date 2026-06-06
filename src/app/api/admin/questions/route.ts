import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAllQuestions, appendQuestions } from '@/lib/google-sheets';

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const questions = await getAllQuestions();
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { questions } = await req.json();
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'Invalid questions data' }, { status: 400 });
    }

    await appendQuestions(questions);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save questions' }, { status: 500 });
  }
}
