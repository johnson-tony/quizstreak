import { NextResponse } from 'next/server';
import { getQuestionsBySet, getAllQuestions } from '@/lib/google-sheets';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Attempt from '@/models/Attempt';
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

    let questions = [];
    const track = user.preferredTrack || 'Mixed';

    if (track === 'Mixed') {
      questions = await getQuestionsBySet(user.currentSet);
    } else {
      // Specialist Track Logic: Pull 15 fresh questions for that category
      const allQuestions = await getAllQuestions();
      const categoryQuestions = allQuestions.filter(q => q.category.toLowerCase() === track.toLowerCase());
      
      // Get all previous attempts for this user and category to avoid duplicates
      const previousAttempts = await Attempt.find({ userId: user._id });
      const attemptedIds = new Set(previousAttempts.map(a => a.questionId));
      
      // Filter out already seen questions
      questions = categoryQuestions
        .filter(q => !attemptedIds.has(q.day))
        .slice(0, 15);

      // If no fresh questions left, fallback to any questions in that category or notify
      if (questions.length === 0 && categoryQuestions.length > 0) {
        // Option: Shuffle and give random ones if they finished the track
        questions = categoryQuestions.sort(() => Math.random() - 0.5).slice(0, 15);
      }
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'No questions available for your track. Try switching focus!' }, { status: 404 });
    }

    // Omit correct answers and explanations
    const publicQuestions = questions.map(({ correctAnswer, explanation, ...publicQ }) => publicQ);

    return NextResponse.json(publicQuestions);
  } catch (error) {
    return handleApiError(error, req, session?.user?.id);
  }
}
