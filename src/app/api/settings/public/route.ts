import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Setting from "@/models/Setting";

export async function GET() {
  try {
    await dbConnect();
    let settings = await Setting.findOne({});
    if (!settings) {
      settings = await Setting.create({});
    }

    return NextResponse.json({
      siteName: settings.siteName || "QuizStreak",
      logoUrl: settings.logoUrl || "/quickstreak.svg",
      adminUpiId: settings.adminUpiId || "",
      paymentQrUrl: settings.paymentQrUrl || "",
      platformCommissionPercent: settings.platformCommissionPercent ?? 10,
      upiLink: settings.upiLink || "",
      isSubscriptionEnabled: settings.isSubscriptionEnabled || false,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
