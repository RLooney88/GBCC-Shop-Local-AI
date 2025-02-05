import OpenAI from "openai";
import type { ChatMessage, BusinessInfo } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function findMatchingBusinesses(query: string, businesses: any[]): Promise<{
  message: string;
  matches: BusinessInfo[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a business directory assistant helping users find relevant businesses.
            Analyze the user's query and the provided business directory to find the best matches.

            Important guidelines:
            - Consider the user's needs and requirements
            - Look for both exact and related matches
            - Group similar businesses when multiple matches are found

            Respond with a JSON object in this format:
            {
              "matches": [{
                "name": "business name",
                "primaryServices": "main services",
                "categories": ["category1", "category2"],
                "phone": "phone number",
                "email": "email",
                "website": "website",
                "matchReason": "why this business matches the query"
              }],
              "message": "response to user based on match count",
              "followUpQuestion": "question to refine results (only if multiple matches)"
            }`
        },
        {
          role: "user",
          content: JSON.stringify({
            query: query,
            businesses: businesses
          })
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to get response from OpenAI");
    }

    const result = JSON.parse(content);
    return {
      message: result.matches.length > 1 ? result.followUpQuestion : result.message,
      matches: result.matches.map((match: any) => ({
        name: match.name,
        primaryServices: match.primaryServices,
        categories: match.categories,
        phone: match.phone,
        email: match.email,
        website: match.website
      }))
    };
  } catch (error) {
    console.error("Error in findMatchingBusinesses:", error);
    throw error;
  }
}