import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    let { name, email, subject, message } = body;

    if (!name || typeof name !== 'string' || 
        !email || typeof email !== 'string' || 
        !subject || typeof subject !== 'string' || 
        !message || typeof message !== 'string') {
      return NextResponse.json({ error: "Invalid or missing fields" }, { status: 400 });
    }

    // Basic sanitization
    name = name.trim().substring(0, 100);
    email = email.trim().substring(0, 100);
    subject = subject.trim().substring(0, 200);
    message = message.trim().substring(0, 2000);

    await dbConnect();

    const contactData: any = {
      name,
      email,
      subject,
      message,
      status: 'pending'
    };

    if (session?.user?.id) {
      contactData.userId = session.user.id;
    }

    console.log("Saving contact message:", { ...contactData, message: "..." });
    const contact = await Contact.create(contactData);
    console.log("Contact saved successfully:", contact._id);

    return NextResponse.json({ success: true, contact }, { status: 201 });
  } catch (error: any) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    console.log(`Retrieved ${contacts.length} contact messages for admin.`);

    return NextResponse.json({ contacts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
