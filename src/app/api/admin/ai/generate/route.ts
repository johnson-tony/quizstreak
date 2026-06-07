import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateAIQuestions } from '@/lib/groq';

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
    }
    const { category, count, difficulty } = body;
    
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
