import { NextRequest, NextResponse } from "next/server";
import { classifyEmails } from "@/app/lib/openai";

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  classification?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { emails } = await req.json();

    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json(
        { message: "Invalid request: emails array is required." },
        { status: 400 }
      );
    }

    console.log("Attempting to classify emails on the server.");
    const classifiedEmails = await classifyEmails(emails);
    console.log("Emails classified successfully.");
    return NextResponse.json({ classifiedEmails });
  } catch (error: any) {
    console.error("Error in API route /api/classify:", error);
    return NextResponse.json(
      { message: "Failed to classify emails", error: error.message },
      { status: 500 }
    );
  }
}
