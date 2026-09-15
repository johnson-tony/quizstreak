import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Pool, { IPoolQuestion } from "@/models/Pool";
import PoolParticipant from "@/models/PoolParticipant";
import User from "@/models/User";
import { handleApiError } from "@/lib/error-handler";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let session;
  try {
    session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const pool = await Pool.findById(id);
    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const participant = await PoolParticipant.findOne({
      poolId: pool._id,
      userId: user._id,
    });

    if (!participant) {
      return NextResponse.json({ error: "You are not enrolled in this pool. Please join first." }, { status: 403 });
    }

    if (participant.paymentStatus !== "verified") {
      return NextResponse.json({ error: "Your payment verification is pending." }, { status: 403 });
    }

    // If already completed, return status
    if (participant.quizStatus === "completed" || participant.quizStatus === "terminated_cheating") {
      return NextResponse.json({
        alreadyCompleted: true,
        score: participant.score,
        totalQuestions: participant.totalQuestions,
        timeTakenSeconds: participant.timeTakenSeconds,
        answers: participant.answers,
      });
    }

    // Return safe question list (without correctAnswer or explanation!)
    const safeQuestions = (pool.questions as IPoolQuestion[]).map((q: IPoolQuestion) => ({
      day: q.day,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty,
    }));

    return NextResponse.json({
      pool: {
        _id: pool._id,
        title: pool.title,
        category: pool.category,
        questionCount: pool.questionCount,
        totalPrizePool: pool.totalPrizePool,
        entryFee: pool.entryFee,
      },
      questions: safeQuestions,
    });
  } catch (error) {
    return handleApiError(error, req, session?.user?.id);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let session;
  try {
    session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { answers, timeTakenSeconds = 60, terminatedDueToCheating, cheatingReason } = body;

    if (!Array.isArray(answers)) {
      return NextResponse.json({ error: "Answers array is required" }, { status: 400 });
    }

    await dbConnect();
    const pool = await Pool.findById(id);
    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const participant = await PoolParticipant.findOne({
      poolId: pool._id,
      userId: user._id,
    });

    if (!participant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    if (participant.quizStatus === "completed" || participant.quizStatus === "terminated_cheating") {
      return NextResponse.json({ error: "You have already completed this pool quiz." }, { status: 400 });
    }

    // Evaluate answers
    let correctCount = 0;
    const evaluatedAnswers = (pool.questions as IPoolQuestion[]).map((q: IPoolQuestion) => {
      const userAns = answers.find((a: any) => a.day === q.day);
      const selected = userAns?.selectedAnswer?.trim()?.toUpperCase() || "NONE";
      const isCorrect = selected === q.correctAnswer.trim().toUpperCase();
      if (isCorrect) correctCount += 1;

      return {
        day: q.day,
        selectedAnswer: selected,
        correct: isCorrect,
      };
    });

    // Update participant
    participant.quizStatus = terminatedDueToCheating ? "terminated_cheating" : "completed";
    participant.score = correctCount;
    participant.totalQuestions = pool.questions.length;
    participant.timeTakenSeconds = Math.max(1, Number(timeTakenSeconds) || 60);
    participant.answers = evaluatedAnswers;
    await participant.save();

    // Recompute ranks for all participants in this pool who completed
    const allParticipants = await PoolParticipant.find({
      poolId: pool._id,
      quizStatus: { $in: ["completed", "terminated_cheating"] },
    }).sort({ score: -1, timeTakenSeconds: 1 });

    for (let i = 0; i < allParticipants.length; i++) {
      allParticipants[i].rank = i + 1;

      // Prize distribution logic
      if (allParticipants.length >= 2) {
        if (pool.maxMembers <= 3) {
          // Winner takes all
          allParticipants[i].prizeWon = i === 0 ? pool.totalPrizePool : 0;
        } else {
          // Top 3 split: 1st 60%, 2nd 25%, 3rd 15%
          if (i === 0) allParticipants[i].prizeWon = Math.round(pool.totalPrizePool * 0.6);
          else if (i === 1) allParticipants[i].prizeWon = Math.round(pool.totalPrizePool * 0.25);
          else if (i === 2) allParticipants[i].prizeWon = Math.round(pool.totalPrizePool * 0.15);
          else allParticipants[i].prizeWon = 0;
        }
      }
      await allParticipants[i].save();
    }

    // Award XP to user
    const xpEarned = correctCount * 10;
    user.totalPoints += xpEarned;
    await user.save();

    // Fetch updated participant
    const updated = await PoolParticipant.findById(participant._id);

    return NextResponse.json({
      success: true,
      score: correctCount,
      totalQuestions: pool.questions.length,
      timeTakenSeconds: participant.timeTakenSeconds,
      rank: updated?.rank || 1,
      prizeWon: updated?.prizeWon || 0,
      xpEarned,
      evaluatedAnswers,
    });
  } catch (error) {
    return handleApiError(error, req, session?.user?.id);
  }
}
