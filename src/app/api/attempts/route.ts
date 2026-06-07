import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Attempt from '@/models/Attempt';
import { getQuestionsBySet, getAllQuestions } from '@/lib/google-sheets';
import { handleApiError } from '@/lib/error-handler';

export async function POST(req: Request) {
  let session;
  try {
    session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { answers, type } = await req.json(); // answers: { day: string, selectedAnswer: string }[], type: 'daily' | 'practice'

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Only check for existing attempts if it's a 'daily' set
    if (type === 'daily') {
      const existingAttempt = await Attempt.findOne({
        userId: user._id,
        date: today,
        type: 'daily' // We should add this field to the model
      });

      if (existingAttempt) {
        return NextResponse.json({ error: 'Already attempted today' }, { status: 400 });
      }
    }

    const questions = type === 'practice' 
      ? await getAllQuestions() 
      : await getQuestionsBySet(user.currentSet);

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'Questions not found' }, { status: 404 });
    }

    let totalPointsEarned = 0;
    let allCorrect = true;
    const results = [];

    for (const answer of answers) {
      const question = questions.find(q => q.day === answer.day);
      if (!question) continue;

      const isCorrect = answer.selectedAnswer.trim().toUpperCase() === question.correctAnswer.trim().toUpperCase();
      if (!isCorrect) allCorrect = false;

      let points = 0;
      if (isCorrect) {
        const basePoints = question.points || { Easy: 5, Medium: 10, Hard: 15 }[question.difficulty] || 10;
        // Streak bonus only applies to daily challenges
        const streakBonusMultiplier = type === 'daily' ? (1 + Math.floor(user.currentStreak / 7) * 0.1) : 1;
        points = Math.round(basePoints * streakBonusMultiplier);
      }

      totalPointsEarned += points;

      // Create attempt record
      await Attempt.create({
        userId: user._id,
        questionId: question.day,
        date: today,
        selectedAnswer: answer.selectedAnswer,
        correct: isCorrect,
        pointsEarned: points,
        type: type || 'daily'
      });

      results.push({
        day: question.day,
        correct: isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
      });
    }

    // Update set and streak ONLY for daily challenges
    if (type === 'daily' && answers.length === questions.length) {
      user.currentSet += 1;

      if (allCorrect) {
        const yesterday = new Date(today);
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);

        if (user.lastAttemptDate && user.lastAttemptDate.getTime() === yesterday.getTime()) {
          user.currentStreak += 1;
        } else {
          user.currentStreak = 1;
        }

        if (user.currentStreak > user.longestStreak) {
          user.longestStreak = user.currentStreak;
        }
        
        // Badge logic
        if (user.currentStreak === 1 && !user.badges.includes('First Challenge')) user.badges.push('First Challenge');
        if (user.currentStreak === 7 && !user.badges.includes('7-Day Streak')) user.badges.push('7-Day Streak');
        if (user.currentStreak === 30 && !user.badges.includes('30-Day Streak')) user.badges.push('30-Day Streak');
      }
    }

    user.totalPoints += totalPointsEarned;
    user.lastAttemptDate = today;
    await user.save();

    return NextResponse.json({
      correct: allCorrect,
      totalPointsEarned,
      results,
      newStreak: user.currentStreak,
      newTotalPoints: user.totalPoints,
      newSet: user.currentSet
    });
  } catch (error) {
    return handleApiError(error, req, session?.user?.id);
  }
}

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

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const attempts = await Attempt.find({
      userId: user._id,
      date: today,
    });

    if (attempts.length === 0) return NextResponse.json({ attempted: false });

    // For GET, we need the questions for the specific set/category they attempted TODAY
    const questions = await getAllQuestions();

    return NextResponse.json({
      attempted: true,
      correct: attempts.every(a => a.correct),
      pointsEarned: attempts.reduce((sum, a) => sum + a.pointsEarned, 0),
      results: attempts.map(a => {
        const q = questions.find(q => q.day === a.questionId);
        return {
          day: a.questionId,
          correct: a.correct,
          selectedAnswer: a.selectedAnswer,
          correctAnswer: q?.correctAnswer,
          explanation: q?.explanation
        };
      })
    });
  } catch (error) {
    return handleApiError(error, req, session?.user?.id);
  }
}
