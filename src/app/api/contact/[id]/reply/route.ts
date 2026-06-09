import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/email";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const { id } = await params;

    await dbConnect();
    const contact = await Contact.findById(id);

    if (!contact) {
      return NextResponse.json({ error: "Contact message not found" }, { status: 404 });
    }

    // Send the email
    const emailSent = await sendEmail(
      contact.email,
      `Re: ${contact.subject}`,
      message,
      `<div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #6366f1;">Response from QuizStreak Support</h2>
        <p style="white-space: pre-wrap;">${message}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <div style="font-size: 12px; color: #666;">
          <p>Original Message:</p>
          <blockquote style="border-left: 2px solid #ddd; padding-left: 10px; margin-left: 0;">
            <strong>Subject:</strong> ${contact.subject}<br/>
            ${contact.message}
          </blockquote>
        </div>
      </div>`
    );

    if (!emailSent) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    // Update database
    contact.replies.push({
      message,
      adminEmail: session.user?.email || "admin@quizstreak.com",
      sentAt: new Date(),
    });
    contact.status = 'replied';
    await contact.save();

    return NextResponse.json({ success: true, contact });
  } catch (error: any) {
    console.error("Reply error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
