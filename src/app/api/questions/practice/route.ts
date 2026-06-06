import { NextResponse } from 'next/server';
import { getAllQuestions } from '@/lib/google-sheets';
import { auth } from '@/auth';

export async function GET(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');

  if (!category) {
    return NextResponse.json({ error: 'Category is required' }, { status: 400 });
  }

  try {
    const allQuestions = await getAllQuestions();
    
    // Filter by category and shuffle
    const filtered = allQuestions
      .filter(q => q.category.toLowerCase() === category.toLowerCase())
      .sort(() => Math.random() - 0.5)
      .slice(0, 5); // Just 5 questions for a quick practice sprint

    if (filtered.length === 0) {
      return NextResponse.json({ error: `No questions found for ${category}` }, { status: 404 });
    }

    // Omit correct answers
    const publicQuestions = filtered.map(({ correctAnswer, explanation, ...publicQ }) => publicQ);

    return NextResponse.json(publicQuestions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch practice questions' }, { status: 500 });
  }
}
