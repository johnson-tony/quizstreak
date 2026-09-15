import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Pool from "@/models/Pool";
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
    const { id } = await params;

    await dbConnect();
    const pool = await Pool.findById(id).lean();
    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }

    // Get all participants
    const participants = await PoolParticipant.find({ poolId: pool._id })
      .sort({ score: -1, timeTakenSeconds: 1 })
      .lean();

    // Check if current user is enrolled
    let myParticipation: any = null;
    if (session?.user?.email) {
      const user = await User.findOne({ email: session.user.email });
      if (user) {
        myParticipation = participants.find(
          (p) => p.userId.toString() === user._id.toString()
        );
      }
    }

    // Leaderboard of completed members
    const leaderboard = participants
      .filter((p) => p.quizStatus === "completed")
      .map((p, index) => ({
        rank: index + 1,
        userName: p.userName,
        userImage: p.userImage,
        score: p.score,
        totalQuestions: p.totalQuestions,
        timeTakenSeconds: p.timeTakenSeconds,
        prizeWon: p.prizeWon || 0,
      }));

    return NextResponse.json({
      pool: {
        _id: pool._id,
        title: pool.title,
        type: pool.type,
        creatorName: pool.creatorName,
        creatorId: pool.creatorId,
        category: pool.category,
        difficulty: pool.difficulty,
        questionCount: pool.questionCount,
        maxMembers: pool.maxMembers,
        entryFee: pool.entryFee,
        totalPrizePool: pool.totalPrizePool,
        platformFeePercent: pool.platformFeePercent,
        inviteCode: pool.inviteCode,
        status: pool.status,
        startDate: pool.startDate,
        endDate: pool.endDate,
        createdAt: pool.createdAt,
      },
      participantsCount: participants.length,
      participants: participants.map((p) => ({
        _id: p._id,
        userId: p.userId,
        userName: p.userName,
        userImage: p.userImage,
        paymentStatus: p.paymentStatus,
        quizStatus: p.quizStatus,
        score: p.score,
        timeTakenSeconds: p.timeTakenSeconds,
        joinedAt: p.joinedAt,
      })),
      myParticipation,
      leaderboard,
    });
  } catch (error) {
    return handleApiError(error, req, session?.user?.id);
  }
}
