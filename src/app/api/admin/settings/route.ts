import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Setting from "@/models/Setting";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    let settings = await Setting.findOne({});
    
    if (!settings) {
      settings = await Setting.create({});
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await dbConnect();
    
    let settings = await Setting.findOne({});
    if (!settings) {
      settings = await Setting.create(body);
    } else {
      settings.isSubscriptionEnabled = body.isSubscriptionEnabled ?? settings.isSubscriptionEnabled;
      settings.upiLink = body.upiLink ?? settings.upiLink;
      settings.freeSetsLimit = body.freeSetsLimit ?? settings.freeSetsLimit;
      settings.siteName = body.siteName ?? settings.siteName;
      settings.logoUrl = body.logoUrl ?? settings.logoUrl;
      settings.dailyQuote = body.dailyQuote ?? settings.dailyQuote;
      settings.autoUpdateQuote = body.autoUpdateQuote ?? settings.autoUpdateQuote;
      await settings.save();
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
