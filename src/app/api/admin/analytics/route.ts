import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Attempt from "@/models/Attempt";
import PoolParticipant from "@/models/PoolParticipant";
import Pool from "@/models/Pool";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const preset = searchParams.get("range") || "30d";
    const category = searchParams.get("category") || "all";
    const type = searchParams.get("type") || "all";
    const now = new Date();
    let start = new Date(now);
    if (preset === "today") start.setUTCHours(0, 0, 0, 0);
    else if (preset === "7d") start.setUTCDate(start.getUTCDate() - 7);
    else if (preset === "30d") start.setUTCDate(start.getUTCDate() - 30);
    else if (preset === "90d") start.setUTCDate(start.getUTCDate() - 90);
    else if (preset === "year") start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    else start.setUTCDate(start.getUTCDate() - 30);

    const attemptMatch: any = { date: { $gte: start, $lte: now } };
    if (type === "daily" || type === "practice") attemptMatch.type = type;
    if (category !== "all") {
      const pools = await Pool.find({ category }).select("_id").lean();
      // Attempts do not currently store category, so category filtering is only available for pool/payment data.
      if (!pools.length) attemptMatch.questionId = "__no_match__";
    }

    const [attemptSummary, dailyTrend, topQuestions, paymentSummary, poolTrend, userSummary] = await Promise.all([
      Attempt.aggregate([
        { $match: attemptMatch },
        { $group: { _id: null, attempts: { $sum: 1 }, correct: { $sum: { $cond: ["$correct", 1, 0] } }, points: { $sum: "$pointsEarned" }, users: { $addToSet: "$userId" }, cheating: { $sum: { $cond: ["$terminatedDueToCheating", 1, 0] } } } },
      ]),
      Attempt.aggregate([
        { $match: attemptMatch },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, attempts: { $sum: 1 }, correct: { $sum: { $cond: ["$correct", 1, 0] } }, points: { $sum: "$pointsEarned" } } },
        { $sort: { _id: 1 } },
      ]),
      Attempt.aggregate([
        { $match: attemptMatch },
        { $group: { _id: "$questionId", attempts: { $sum: 1 }, correct: { $sum: { $cond: ["$correct", 1, 0] } } } },
        { $addFields: { accuracy: { $multiply: [{ $divide: ["$correct", "$attempts"] }, 100] } } },
        { $sort: { attempts: -1 } }, { $limit: 10 },
      ]),
      PoolParticipant.aggregate([
        { $match: { joinedAt: { $gte: start, $lte: now } } },
        { $group: { _id: null, payments: { $sum: 1 }, verifiedPayments: { $sum: { $cond: [{ $eq: ["$paymentStatus", "verified"] }, 1, 0] } }, pendingPayments: { $sum: { $cond: [{ $eq: ["$paymentStatus", "pending"] }, 1, 0] } }, rejectedPayments: { $sum: { $cond: [{ $eq: ["$paymentStatus", "rejected"] }, 1, 0] } }, revenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "verified"] }, "$paidAmount", 0] } } } },
      ]),
      PoolParticipant.aggregate([
        { $match: { joinedAt: { $gte: start, $lte: now }, paymentStatus: "verified" } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$joinedAt" } }, revenue: { $sum: "$paidAmount" }, payments: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      User.aggregate([
        { $group: { _id: null, total: { $sum: 1 }, active: { $sum: { $cond: ["$isActive", 1, 0] } } } },
      ]),
    ]);

    const a = attemptSummary[0] || { attempts: 0, correct: 0, points: 0, users: [], cheating: 0 };
    const p = paymentSummary[0] || { payments: 0, verifiedPayments: 0, pendingPayments: 0, rejectedPayments: 0, revenue: 0 };
    const u = userSummary[0] || { total: 0, active: 0 };

    return NextResponse.json({
      range: preset,
      overview: {
        totalUsers: u.total,
        activeUsers: a.users?.length || 0,
        attempts: a.attempts,
        questionsAnswered: a.attempts,
        correctAnswers: a.correct,
        accuracy: a.attempts ? Number(((a.correct / a.attempts) * 100).toFixed(1)) : 0,
        pointsEarned: a.points,
        cheatingTerminations: a.cheating,
        revenue: p.revenue,
        successfulPayments: p.verifiedPayments,
        pendingPayments: p.pendingPayments,
        rejectedPayments: p.rejectedPayments,
      },
      dailyTrend: dailyTrend.map((x: any) => ({ date: x._id, attempts: x.attempts, correct: x.correct, points: x.points })),
      revenueTrend: poolTrend.map((x: any) => ({ date: x._id, revenue: x.revenue, payments: x.payments })),
      topQuestions: topQuestions.map((x: any) => ({ questionId: x._id, attempts: x.attempts, correct: x.correct, accuracy: Number(x.accuracy.toFixed(1)) })),
      filters: { category, type, note: category !== "all" ? "Attempt records do not currently store category; category filter applies to payment/pool data only." : "" },
    });
  } catch (error: any) {
    console.error("Admin analytics error:", error);
    return NextResponse.json({ error: error?.message || "Failed to load analytics" }, { status: 500 });
  }
}
