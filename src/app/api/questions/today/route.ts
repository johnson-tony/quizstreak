import { NextResponse } from 'next/server';
import { getQuestionsBySet } from '@/lib/google-sheets';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Setting from '@/models/Setting';
import { handleApiError } from '@/lib/error-handler';

export async function GET(req: Request) {
  let session;
  try {
    session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Paywall Check
    const settings = await Setting.findOne({}) || { isSubscriptionEnabled: false, upiLink: '', freeSetsLimit: 10 };
    
    if (settings.isSubscriptionEnabled && !user.isSubscribed && (user.currentSet || 1) > (settings.freeSetsLimit || 10)) {
      return NextResponse.json({ 
        error: 'Subscription required', 
        requiresSubscription: true, 
        upiLink: settings.upiLink 
      }, { status: 403 });
    }

    const questions = await getQuestionsBySet(user.currentSet);

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'Questions for this set not found' }, { status: 404 });
    }

    // Omit correct answers and explanations
    const publicQuestions = questions.map(({ correctAnswer, explanation, ...publicQ }) => publicQ);

    return NextResponse.json(publicQuestions);
  } catch (error) {
    return handleApiError(error, req, session?.user?.id);
  }
}
