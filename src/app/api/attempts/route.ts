import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Attempt from '@/models/Attempt';
import { getQuestionsBySet } from '@/lib/google-sheets';

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { answers } = await req.json(); // answers: { day: string, selectedAnswer: string }[]

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

  const questions = await getQuestionsBySet(user.currentSet);
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
      const streakBonusMultiplier = 1 + Math.floor(user.currentStreak / 7) * 0.1;
      points = Math.round(basePoints * streakBonusMultiplier);
    }

    totalPointsEarned += points;

    // Create attempt record for each
    await Attempt.create({
      userId: user._id,
      questionId: question.day,
      date: today,
      selectedAnswer: answer.selectedAnswer,
      correct: isCorrect,
      pointsEarned: points,
    });

    results.push({
      day: question.day,
      correct: isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation
    });
  }

  // Update set and streak if they completed it
  if (answers.length === questions.length) {
    // Increment set for tomorrow regardless of allCorrect (as they tried all)
    // Actually, usually users only move to next set if they finish the previous one.
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

  const attempts = await Attempt.find({
    userId: user._id,
    date: today,
  });

  if (attempts.length === 0) return NextResponse.json({ attempted: false });

  // For GET, we need the questions of the set they attempted TODAY
  // Since we increment set in POST, the set they did is actually user.currentSet - 1
  const attemptedSet = user.currentSet - 1;
  const questions = await getQuestionsBySet(attemptedSet);

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
}
