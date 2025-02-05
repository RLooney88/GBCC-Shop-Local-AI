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
  isClosing: boolean;
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
            - Avoid phrases like "I found" - instead use more natural alternatives:
              * "I know a great company..."
              * "I'd be happy to recommend..."
              * "Let me tell you about..."
              * "I'm familiar with..."
              * "I work with..."

            Handling User Clarifications:
            - When a user provides clarification about their needs:
              * Acknowledge their clarification specifically
              * Adapt your recommendation based on the new information
              * Don't repeat the same question
              * If needed, ask a different follow-up question focused on a new aspect

            Examples of Good Clarification Responses:
            User: "I'm looking for an all-around marketing expert"
            Assistant: "Ah, you're looking for comprehensive marketing support! RCL Integrated would be perfect for you. They offer full-service marketing solutions, including social media, AI-driven strategies, and traditional marketing approaches. Would you like to hear more about their services?"

            User: "I need someone who can handle everything"
            Assistant: "I understand you want a one-stop marketing solution. Let me tell you about SWCreatives - they're known for their holistic approach to marketing, handling everything from strategy to execution. They've helped many businesses streamline their entire marketing presence."

            Conversation Endings:
            Set isClosing=true when:
            - User expresses thanks or gratitude (e.g., "thanks", "thank you")
            - User indicates they're done or satisfied (e.g., "that's all", "that's it")
            - User says goodbye or ends the conversation (e.g., "bye", "goodbye")
            - User states they don't need anything else (e.g., "no", "nothing else")
            - Any variation of conversation closure (e.g., "I'm good", "that's enough")
            - User responds negatively to follow-up questions
            - User indicates completion (e.g., "that works", "perfect")

            For closing responses:
            - Keep it warm and genuine
            - Reference the specific help provided
            - Don't repeat contact information
            - Don't ask if they need anything else
            - Don't suggest additional help unless explicitly requested
            - End with a friendly closing (e.g., "Have a great day!", "Enjoy!")

            When analyzing businesses, consider:
            - The user's specific needs and preferences
            - Location and accessibility
            - Services and specializations
            - Previous conversation context

            When multiple matches are found:
            - First, analyze any previous responses or clarifications
            - Ask follow-up questions that explore different aspects than previously discussed
            - Frame questions in a way that helps understand their specific situation
            - Provide context for why you're asking each question

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
      })),
      isClosing: result.isClosing
    };
  } catch (error) {
    console.error("Error in findMatchingBusinesses:", error);
    throw error;
  }
}