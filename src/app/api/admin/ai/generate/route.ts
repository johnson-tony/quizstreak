import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateAIQuestions } from '@/lib/gemini';

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { category, count, difficulty } = await req.json();
    
    if (!category || !count) {
      return NextResponse.json({ error: 'Category and count are required' }, { status: 400 });
    }

    const questions = await generateAIQuestions(category, count, difficulty || 'Medium');
    return NextResponse.json(questions);
  } catch (error) {
    console.error("AI Generate Route Error:", error);
    return NextResponse.json({ error: 'Failed to generate AI questions' }, { status: 500 });
  }
}
