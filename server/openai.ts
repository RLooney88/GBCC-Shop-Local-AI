import OpenAI from "openai";
import type { ChatMessage, BusinessInfo } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function findMatchingBusinesses(
  query: string, 
  businesses: any[],
  previousMessages: ChatMessage[] = []
): Promise<{
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
            Analyze the user's query, conversation history, and the provided business directory to find the best matches.

            Important guidelines for matching:
            - Consider the user's needs and requirements holistically
            - Look for both exact and related matches
            - Group similar businesses when multiple matches are found
            - Consider business locations for physical services
            - Track conversation context to avoid repeating questions

            When multiple matches are found, analyze these fields to create targeted follow-up questions:
            - Primary Services: Focus on specific service offerings and specializations
            - Categories 1/2/3: Understand the full scope of services and business types
            - Company Overview: Extract unique selling points and differentiators
            - Location: For physical businesses, consider geographic preferences
            - Business Hours: If relevant for the service type

            Guidelines for follow-up questions:
            1. Focus on key differentiators between matched businesses
            2. For physical services, include location-based questions when relevant
            3. Ask about specific service needs that would help narrow down the options
            4. Consider price ranges or service levels if that information is available
            5. For professional services, focus on expertise areas and specializations
            6. Never repeat a previously asked question
            7. Use previous answers to refine and narrow down the selection
            8. If user's answer eliminates some businesses, focus next question on remaining differences

            Respond with a JSON object in this format:
            {
              "matches": [{
                "name": "business name",
                "primaryServices": "main services",
                "categories": ["category1", "category2", "category3"],
                "phone": "phone number",
                "email": "email",
                "website": "website",
                "location": "business location",
                "overview": "company overview",
                "matchReason": "why this business matches the query"
              }],
              "message": "response to user based on match count",
              "followUpQuestion": "question to refine results (only if multiple matches)",
              "questionContext": "explanation of why this question helps differentiate the matches",
              "eliminatedBusinesses": ["names of businesses eliminated based on previous answers"]
            }`
        },
        {
          role: "user",
          content: JSON.stringify({
            query,
            businesses,
            conversationHistory: previousMessages
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
      message: result.matches.length > 1 
        ? `${result.followUpQuestion}\n\n(${result.questionContext})`
        : result.message,
      matches: result.matches.map((match: any) => ({
        name: match.name,
        primaryServices: match.primaryServices,
        categories: match.categories,
        phone: match.phone,
        email: match.email,
        website: match.website,
        location: match.location
      }))
    };
  } catch (error) {
    console.error("Error in findMatchingBusinesses:", error);
    throw error;
  }
}