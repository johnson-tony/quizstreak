import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public directory
    const filename = `logo-${Date.now()}${path.extname(file.name)}`;
    const publicPath = path.join(process.cwd(), "public", filename);
    await writeFile(publicPath, buffer);

    const fileUrl = `/${filename}`;
    return NextResponse.json({ url: fileUrl });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
