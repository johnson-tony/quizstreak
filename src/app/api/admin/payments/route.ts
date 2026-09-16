import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import PoolParticipant from "@/models/PoolParticipant";
import Pool from "@/models/Pool";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search")?.trim() || "";
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(10, Number(searchParams.get("limit") || 25)));

    const filter: any = {};
    if (["pending", "verified", "rejected"].includes(status)) filter.paymentStatus = status;
    if (from || to) {
      filter.joinedAt = {};
      if (from) filter.joinedAt.$gte = new Date(`${from}T00:00:00.000Z`);
      if (to) filter.joinedAt.$lte = new Date(`${to}T23:59:59.999Z`);
    }
    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: "i" } },
        { paymentUtr: { $regex: search, $options: "i" } },
      ];
    }

    const [rows, total, summary] = await Promise.all([
      PoolParticipant.find(filter).sort({ joinedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      PoolParticipant.countDocuments(filter),
      PoolParticipant.aggregate([
        { $match: filter },
        { $group: {
          _id: null,
          totalCollected: { $sum: { $cond: [{ $eq: ["$paymentStatus", "verified"] }, "$paidAmount", 0] } },
          successful: { $sum: { $cond: [{ $eq: ["$paymentStatus", "verified"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$paymentStatus", "pending"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$paymentStatus", "rejected"] }, 1, 0] } },
        } },
      ]),
    ]);

    const poolIds = rows.map((r: any) => r.poolId).filter(Boolean);
    const pools = await Pool.find({ _id: { $in: poolIds } }).select("title entryFee type category platformFeePercent").lean();
    const poolMap = new Map(pools.map((p: any) => [String(p._id), p]));
    const userIds = rows.map((r: any) => r.userId).filter(Boolean);
    const users = await User.find({ _id: { $in: userIds } }).select("email").lean();
    const userMap = new Map(users.map((u: any) => [String(u._id), u.email]));

    const data = rows.map((r: any) => ({
      ...r,
      email: userMap.get(String(r.userId)) || "",
      pool: poolMap.get(String(r.poolId)) || null,
    }));

    return NextResponse.json({
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      summary: summary[0] || { totalCollected: 0, successful: 0, pending: 0, rejected: 0 },
    });
  } catch (error: any) {
    console.error("Admin payments error:", error);
    return NextResponse.json({ error: error?.message || "Failed to load payments" }, { status: 500 });
  }
}
