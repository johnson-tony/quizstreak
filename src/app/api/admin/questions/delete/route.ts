import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { deleteQuestion } from '@/lib/google-sheets';

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { rowIndex } = await req.json();
    if (!rowIndex) {
      return NextResponse.json({ error: 'Row index is required' }, { status: 400 });
    }

    await deleteQuestion(rowIndex);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}
