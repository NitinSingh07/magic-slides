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

        let rawClassification = response.choices[0].message.content?.trim();
        let classification: string;

        if (rawClassification) {
          // Canonicalize the raw classification to Title Case for comparison
          const canonicalClassification =
            rawClassification.charAt(0).toUpperCase() +
            rawClassification.slice(1).toLowerCase();

          if (classificationCategories.includes(canonicalClassification)) {
            classification = canonicalClassification;
          } else {
            console.warn(
              `Unexpected classification received: ${rawClassification}. Defaulting to Important.`
            );
            classification = "Important"; // Fallback if canonicalized doesn't match
          }
        } else {
          console.warn(
            `No classification received from OpenAI. Defaulting to Important.`
          );
          classification = "Important"; // Fallback if AI returns empty
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
