import { NextResponse } from 'next/server';
import { getTodayQuestion } from '@/lib/google-sheets';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const question = await getTodayQuestion();

  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  // Omit the correct answer and explanation if the user hasn't attempted it yet?
  // Actually, the requirements say "After submission: Show correct answer, explanation"
  // So we should probably hide it initially.
  
  const { correctAnswer, explanation, ...publicQuestion } = question;

  return NextResponse.json(publicQuestion);
}
