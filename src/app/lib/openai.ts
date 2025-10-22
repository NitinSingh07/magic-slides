import OpenAI from "openai";

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  classification?: string;
}

export async function classifyEmails(emails: Email[]) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const classificationCategories = [
    "Important",
    "Promotions",
    "Social",
    "Marketing",
    "Spam",
    "General",
  ];

  const classifiedEmails = await Promise.all(
    emails.map(async (email) => {
      try {
        const prompt = `Classify the following email into one of these categories: ${classificationCategories.join(
          ", "
        )}.

Email Subject: ${email.subject}
Email Body: ${email.body}

Classification:`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 10,
        });

        const classification =
          response.choices[0].message.content?.trim() || "General";
        return { ...email, classification };
      } catch (error) {
        console.error(`Error classifying email ${email.id}:`, error);
        return { ...email, classification: "General" };
      }
    })
  );

  return classifiedEmails;
}
