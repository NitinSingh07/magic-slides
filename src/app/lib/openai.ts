import OpenAI from "openai";
import { stripHtml } from "string-strip-html"; // Install using: npm i string-strip-html

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  classification?: string;
}

export async function classifyEmails(emails: Email[]) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const classificationCategories = ["Important", "Marketing", "Spam"];

  const classifiedEmails = await Promise.all(
    emails.map(async (email) => {
      try {
        // Clean and limit email body for better classification context
        const cleanBody = stripHtml(email.body || "").result.slice(0, 1000);

        const prompt = `
You are an expert email classifier. Your task is to categorize the following email into ONE and ONLY ONE of these categories: Important, Marketing, or Spam. 

RULES:
- Your response MUST be a single word: Important, Marketing, or Spam.
- If an email is clearly an advertisement, promotion, or newsletter, classify it as Marketing.
- If an email is unsolicited, suspicious, or a phishing attempt, classify it as Spam.
- ONLY classify as Important if it's personal communication, work-related, or requires user action.
- DO NOT default to Important. If unsure, first check if it fits Marketing or Spam.
- Return ONLY the category name. No punctuation, explanation, or extra text.

EXAMPLES:
Important: Subject: "Your flight is confirmed", Body: "Your flight from X to Y is confirmed."
Marketing: Subject: "Flash Sale! 50% off!", Body: "Don't miss out on our limited-time offer."
Spam: Subject: "Claim your prize!", Body: "You've won a million dollars, click here."

Email Details:
From: ${email.from}
Subject: ${email.subject}
Body: ${cleanBody}

Classification:
`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 10, // enough for a single word
          temperature: 0, // deterministic classification
        });

        const rawClassification = response.choices[0].message.content?.trim();
        let classification: string;

        if (rawClassification) {
          // Convert to Title Case for consistency
          const canonical =
            rawClassification.charAt(0).toUpperCase() +
            rawClassification.slice(1).toLowerCase();

          if (classificationCategories.includes(canonical)) {
            classification = canonical;
          } else {
            console.warn(
              `⚠️ Unexpected classification for email ${email.id}: "${rawClassification}". Defaulting to "Important".`
            );
            classification = "Important";
          }
        } else {
          console.warn(
            `⚠️ No classification received for email ${email.id}. Defaulting to "Important".`
          );
          classification = "Important";
        }

        console.log(`✅ Email ${email.id} classified as: ${classification}`);
        return { ...email, classification };
      } catch (error) {
        console.error(`❌ Error classifying email ${email.id}:`, error);
        return { ...email, classification: "Important" }; // fallback
      }
    })
  );

  return classifiedEmails;
}
