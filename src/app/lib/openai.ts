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

  const classificationCategories = ["Important", "Marketing", "Spam"];

  const classifiedEmails = await Promise.all(
    emails.map(async (email) => {
      try {
        const prompt = `Classify the following email into one of these categories: ${classificationCategories.join(
          ", "
        )}. Respond with only the classification word and nothing else.

Email Subject: ${email.subject}
Email Body: ${email.body}

Classification:`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 10, // Max tokens adjusted for single-word classification
        });

        let classification =
          response.choices[0].message.content?.trim() || "Important"; // Default to Important if AI fails

        // Ensure classification is one of the allowed categories
        if (!classificationCategories.includes(classification)) {
          console.warn(
            `Unexpected classification received: ${classification}. Defaulting to Important.`
          );
          classification = "Important";
        }
        console.log(`Email ${email.id} classified as: ${classification}`);
        return { ...email, classification };
      } catch (error) {
        console.error(`Error classifying email ${email.id}:`, error);
        return { ...email, classification: "Important" }; // Default to Important on error
      }
    })
  );

  return classifiedEmails;
}
