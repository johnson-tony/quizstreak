import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Pool from "@/models/Pool";
import PoolParticipant from "@/models/PoolParticipant";
import User from "@/models/User";
import { handleApiError } from "@/lib/error-handler";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let session;
  try {
    session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to join." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { paymentUtr, paymentProofUrl } = body;

    if (!paymentUtr || paymentUtr.trim().length < 6) {
      return NextResponse.json(
        { error: "Valid 12-digit UPI Reference / UTR Number is required." },
        { status: 400 }
      );
    }

    await dbConnect();
    const pool = await Pool.findById(id);
    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }

    if (pool.status === "completed" || pool.status === "cancelled") {
      return NextResponse.json({ error: "This pool is no longer open for joining." }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already joined
    const existing = await PoolParticipant.findOne({
      poolId: pool._id,
      userId: user._id,
    });

    if (existing) {
      return NextResponse.json({
        message: "You are already enrolled in this pool.",
        participant: existing,
      });
    }

    // Check member cap
    const currentCount = await PoolParticipant.countDocuments({
      poolId: pool._id,
      paymentStatus: { $in: ["verified", "pending"] },
    });

    if (currentCount >= pool.maxMembers) {
      return NextResponse.json(
        { error: "This pool is already full! Please join another pool." },
        { status: 400 }
      );
    }

    // Create participant record
    // Instant verification if UTR provided so user can enjoy playing without waiting
    const participant = await PoolParticipant.create({
      poolId: pool._id,
      userId: user._id,
      userName: user.name || "Contestant",
      userImage: user.image || "",
      paymentStatus: "verified",
      paymentUtr: paymentUtr.trim(),
      paymentProofUrl: paymentProofUrl || "",
      paidAmount: pool.entryFee,
      quizStatus: "not_started",
      score: 0,
      totalQuestions: pool.questionCount,
      timeTakenSeconds: 0,
    });

    // Check if pool is now full and update status to 'active'
    if (currentCount + 1 >= pool.maxMembers) {
      pool.status = "active";
      await pool.save();
    }

    return NextResponse.json({
      success: true,
      message: "Successfully joined the pool!",
      participant,
    });
  } catch (error) {
    return handleApiError(error, req, session?.user?.id);
  }
}
