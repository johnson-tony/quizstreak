import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Attempt from '@/models/Attempt';
import { getTodayQuestion } from '@/lib/google-sheets';

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { selectedAnswer } = await req.json();

  await dbConnect();

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Check if already attempted today
  const existingAttempt = await Attempt.findOne({
    userId: user._id,
    date: today,
  });

  if (existingAttempt) {
    return NextResponse.json({ error: 'Already attempted today' }, { status: 400 });
  }

  const question = await getTodayQuestion();
  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  const isCorrect = selectedAnswer === question.correctAnswer;
  let pointsEarned = 0;

  if (isCorrect) {
    const basePoints = {
      Easy: 5,
      Medium: 10,
      Hard: 15,
    }[question.difficulty];

    // Streak bonus: +10% per 7-day milestone
    const streakBonusMultiplier = 1 + Math.floor(user.currentStreak / 7) * 0.1;
    pointsEarned = Math.round(basePoints * streakBonusMultiplier);

    // Update streak
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

    user.totalPoints += pointsEarned;
    user.lastAttemptDate = today;

    // Badge logic (simplified for now)
    if (user.currentStreak === 1 && !user.badges.includes('First Challenge')) {
      user.badges.push('First Challenge');
    }
    if (user.currentStreak === 7 && !user.badges.includes('7-Day Streak')) {
      user.badges.push('7-Day Streak');
    }
    if (user.currentStreak === 30 && !user.badges.includes('30-Day Streak')) {
      user.badges.push('30-Day Streak');
    }
  } else {
    // Incorrect answer
    // Should we reset streak on incorrect or only on missed days?
    // "Track streaks automatically—reset on missed days, increment on successful attempts."
    // This implies if they attempt but get it wrong, the streak might not reset yet, 
    // but the requirements say "increment on successful attempts".
    // Usually, streaks reset if you MISS a day.
    // Let's stick to: increment on success, stay same on fail, reset on miss? 
    // Actually, "reset on missed days" is clear.
    
    // We update lastAttemptDate even if wrong so they can't try again today
    user.lastAttemptDate = today;
  }

  const attempt = await Attempt.create({
    userId: user._id,
    questionId: question.day, // Using 'Day' as questionId
    date: today,
    selectedAnswer,
    correct: isCorrect,
    pointsEarned,
  });

  await user.save();

  return NextResponse.json({
    correct: isCorrect,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    pointsEarned,
    newStreak: user.currentStreak,
    newTotalPoints: user.totalPoints,
  });
}

export async function GET() {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const attempt = await Attempt.findOne({
    userId: user._id,
    date: today,
  });

  if (!attempt) return NextResponse.json({ attempted: false });

  const question = await getTodayQuestion();

  return NextResponse.json({
    attempted: true,
    correct: attempt.correct,
    selectedAnswer: attempt.selectedAnswer,
    correctAnswer: question?.correctAnswer,
    explanation: question?.explanation,
    pointsEarned: attempt.pointsEarned,
  });
}
