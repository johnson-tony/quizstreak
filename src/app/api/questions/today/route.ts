import { NextResponse } from 'next/server';
import { getTodayQuestions } from '@/lib/google-sheets';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const questions = await getTodayQuestions();

  if (!questions || questions.length === 0) {
    return NextResponse.json({ error: 'Questions not found' }, { status: 404 });
  }

  // Omit correct answers and explanations for all questions
  const publicQuestions = questions.map(({ correctAnswer, explanation, ...publicQ }) => publicQ);

  return NextResponse.json(publicQuestions);
}
