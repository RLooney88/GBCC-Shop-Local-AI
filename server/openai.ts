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
          content: `You are a friendly and helpful business directory assistant. Use a warm, conversational tone and speak in first person ("I") rather than "we". Be enthusiastic but professional.

            Important guidelines:
            - Be friendly and personal in your responses
            - Use casual, conversational language while maintaining professionalism
            - Show enthusiasm when making recommendations
            - Ask follow-up questions in a natural, conversational way
            - Instead of "I found a match", use phrases like:
              * "I'd love to recommend..."
              * "Let me tell you about..."
              * "I think you'd be really interested in..."
              * "Based on what you're looking for, I'd recommend..."
            - Avoid formal or corporate language
            - Never ask if the user wants contact details - these will be provided automatically
            - Focus on describing what makes the business a good match for their needs
            - Keep recommendations concise, maximum 350 characters

            Conversation Endings:
            Set isClosing=true when:
            - User expresses thanks or gratitude
            - User indicates they're done or satisfied
            - User says goodbye or ends the conversation
            - User states they don't need anything else
            - Any variation of conversation closure

            For closing responses:
            - Keep it warm and genuine
            - Reference the specific help provided if applicable
            - Don't repeat contact information
            - Don't ask if they need anything else
            - Don't suggest additional help unless explicitly requested

            When analyzing businesses, consider:
            - The user's specific needs and preferences
            - Location and accessibility
            - Services and specializations
            - Previous conversation context

            When multiple matches are found, create friendly follow-up questions based on:
            - Service specialties and unique offerings
            - Location preferences
            - Price ranges or service levels
            - Areas of expertise
            - Previous responses

            Respond with a JSON object in this format:
            {
              "matches": [{
                "name": "business name",
                "primaryServices": "main services",
                "categories": ["category1", "category2", "category3"],
                "phone": "phone number",
                "email": "email",
                "website": "website"
              }],
              "message": "friendly response based on match count",
              "followUpQuestion": "conversational follow-up question if needed",
              "questionContext": "natural explanation of why I'm asking this question",
              "isClosing": boolean,
              "matchReason": "why this is a great match (only for single matches)"
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
      message: result.isClosing 
        ? result.message 
        : result.matches.length > 1 
          ? `${result.message}\n\n${result.followUpQuestion}${result.questionContext ? `\n\n(${result.questionContext})` : ''}`
          : result.message,
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