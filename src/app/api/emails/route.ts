import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { fetchGmailEmails } from "@/app/lib/gmail";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    console.error("Unauthorized: No session or access token.");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Attempting to fetch emails with access token.");
    const emails = await fetchGmailEmails(session.accessToken);
    console.log("Emails fetched successfully.", emails);
    return NextResponse.json({ emails });
  } catch (error: any) {
    console.error("Error in API route /api/emails:", error);
    return NextResponse.json(
      { message: "Failed to fetch emails", error: error.message },
      { status: 500 }
    );
  }
}
