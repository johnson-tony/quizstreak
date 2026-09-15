import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Pool from "@/models/Pool";
import PoolParticipant from "@/models/PoolParticipant";
import Setting from "@/models/Setting";
import User from "@/models/User";
import { curatePoolQuestions } from "@/lib/pool-questions";
import { handleApiError } from "@/lib/error-handler";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "QZ-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET(req: Request) {
  let session;
  try {
    session = await auth();
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    // If searching by invite code
    if (code) {
      const pool = await Pool.findOne({ inviteCode: code.trim().toUpperCase() });
      if (!pool) {
        return NextResponse.json({ error: "Pool with this invite code was not found" }, { status: 404 });
      }
      return NextResponse.json({ poolId: pool._id });
    }

    // 1. Fetch Featured Weekend Tournaments
    const weekendTournaments = await Pool.find({
      type: "weekend_tournament",
      status: { $in: ["open", "active"] },
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    // 2. Fetch Open Custom Duels
    const openDuels = await Pool.find({
      type: "custom_duel",
      status: { $in: ["open", "active"] },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // 3. If logged in, fetch user's joined & created pools
    let myPools: any[] = [];
    let myParticipations: any[] = [];

    if (session?.user?.email) {
      const user = await User.findOne({ email: session.user.email });
      if (user) {
        myParticipations = await PoolParticipant.find({ userId: user._id })
          .populate("poolId")
          .sort({ joinedAt: -1 })
          .lean();

        myPools = myParticipations
          .filter((p) => p.poolId)
          .map((p) => ({
            ...p.poolId,
            myStatus: p.paymentStatus,
            myQuizStatus: p.quizStatus,
            myScore: p.score,
          }));
      }
    }

    // Get participant count for tournaments and duels
    const enrichWithCount = async (pools: any[]) => {
      return Promise.all(
        pools.map(async (p) => {
          const participantCount = await PoolParticipant.countDocuments({
            poolId: p._id,
            paymentStatus: { $in: ["verified", "pending"] },
          });
          return {
            ...p,
            joinedCount: participantCount,
            questionsCount: p.questions ? p.questions.length : p.questionCount,
            questions: undefined, // Do not expose questions in list
          };
        })
      );
    };

    const [enrichedTournaments, enrichedDuels] = await Promise.all([
      enrichWithCount(weekendTournaments),
      enrichWithCount(openDuels),
    ]);

    return NextResponse.json({
      weekendTournaments: enrichedTournaments,
      openDuels: enrichedDuels,
      myPools,
    });
  } catch (error) {
    return handleApiError(error, req, session?.user?.id);
  }
}

export async function POST(req: Request) {
  let session;
  try {
    session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to create a pool." }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      type = "custom_duel",
      category,
      difficulty = "Medium",
      questionCount = 10,
      maxMembers = 5,
      entryFee = 50,
      endDate,
    } = body;

    if (!title || !category) {
      return NextResponse.json({ error: "Title and category are required" }, { status: 400 });
    }

    // Check if non-admin is trying to create a weekend_tournament
    const isAdmin = (session.user as any).role === "admin";
    const poolType = isAdmin && type === "weekend_tournament" ? "weekend_tournament" : "custom_duel";

    // Fetch site commission percent from settings
    const settings = await Setting.findOne({});
    const platformFeePercent = settings?.platformCommissionPercent ?? 10;

    // Calculate total prize pool (after platform commission)
    const rawTotal = Number(entryFee) * Number(maxMembers);
    const platformFee = Math.round(rawTotal * (platformFeePercent / 100));
    const totalPrizePool = rawTotal - platformFee;

    // Generate unique invite code
    let inviteCode = generateInviteCode();
    let codeExists = await Pool.findOne({ inviteCode });
    while (codeExists) {
      inviteCode = generateInviteCode();
      codeExists = await Pool.findOne({ inviteCode });
    }

    // Default end date: 7 days from now if not provided
    const poolEndDate = endDate
      ? new Date(endDate)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Curate questions for this pool
    const questions = await curatePoolQuestions(
      category,
      Number(questionCount) || 10,
      difficulty
    );

    // Create Pool
    const newPool = await Pool.create({
      title: title.trim(),
      type: poolType,
      creatorId: user._id,
      creatorName: user.name || "Quiz Master",
      category,
      difficulty,
      questionCount: questions.length,
      maxMembers: Number(maxMembers) || 5,
      entryFee: Number(entryFee) || 50,
      totalPrizePool,
      platformFeePercent,
      inviteCode,
      status: "open",
      startDate: new Date(),
      endDate: poolEndDate,
      questions,
    });

    // Automatically enroll the creator into their pool
    await PoolParticipant.create({
      poolId: newPool._id,
      userId: user._id,
      userName: user.name || "Creator",
      userImage: user.image || "",
      paymentStatus: "verified", // Creator is auto-verified
      paidAmount: Number(entryFee) || 50,
      quizStatus: "not_started",
      score: 0,
      totalQuestions: questions.length,
      timeTakenSeconds: 0,
    });

    return NextResponse.json({
      success: true,
      poolId: newPool._id,
      inviteCode: newPool.inviteCode,
      message: "Pool created successfully!",
    });
  } catch (error) {
    return handleApiError(error, req, session?.user?.id);
  }
}
