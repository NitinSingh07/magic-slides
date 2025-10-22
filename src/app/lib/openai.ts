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
        )}. Your response MUST be one of these words: Important, Marketing, Spam. If the email content strongly suggests one category over others, choose that one. Otherwise, try to infer the most likely category. DO NOT use any other words, punctuation, or formatting. 

        Here are examples:

        Example 1:
        Email Subject: Your Order Has Shipped - Urgent Action Required
        Email Body: Hi, your order with tracking number XYZ has shipped. Please review details immediately.
        Classification: Important

        Example 2:
        Email Subject: Limited Time Offer: 50% Off!
        Email Body: Don't miss out on our new product launch. Click here to get 50% off.
        Classification: Marketing

        Example 3:
        Email Subject: Congratulations, You've Won a Free Car!
        Email Body: Click this suspicious link to claim your prize. This is not a scam.
        Classification: Spam

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
