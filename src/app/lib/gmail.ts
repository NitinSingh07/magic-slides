import { google } from "googleapis";

export async function fetchGmailEmails(
  accessToken: string,
  maxResults?: number
) {
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  try {
    const res = await gmail.users.messages.list({
      userId: "me",
      maxResults: maxResults || 10, // Use maxResults if provided, otherwise default to 10
    });

    const messages = res.data.messages || [];
    const emails = [];

    for (const message of messages) {
      if (message.id) {
        const msg = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
          format: "full",
        });

        const headers = msg.data.payload?.headers;
        const subject =
          headers?.find((header) => header.name === "Subject")?.value ||
          "No Subject";
        const from =
          headers?.find((header) => header.name === "From")?.value ||
          "Unknown Sender";

        let body = "";
        if (msg.data.payload?.parts) {
          const part = msg.data.payload.parts.find(
            (p) => p.mimeType === "text/plain"
          );
          if (part?.body?.data) {
            body = Buffer.from(part.body.data, "base64").toString("utf8");
          }
        } else if (msg.data.payload?.body?.data) {
          body = Buffer.from(msg.data.payload.body.data, "base64").toString(
            "utf8"
          );
        }

        emails.push({
          id: message.id,
          from,
          subject,
          body,
        });
      }
    }
    return emails;
  } catch (error) {
    console.error("Error fetching emails from Gmail:", error);
    throw new Error("Failed to fetch emails from Gmail.");
  }
}
