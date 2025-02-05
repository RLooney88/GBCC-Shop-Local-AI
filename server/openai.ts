import OpenAI from "openai";
import type { ChatMessage, BusinessInfo } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeUserQuery(query: string): Promise<{
  keywords: string[];
  categories: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Extract relevant keywords and business categories from user queries. Respond with JSON."
        },
        {
          role: "user",
          content: query
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to get response from OpenAI");
    }

    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed.keywords) || !Array.isArray(parsed.categories)) {
      throw new Error("Invalid response format from OpenAI");
    }

    return {
      keywords: parsed.keywords.map(k => k.toLowerCase()),
      categories: parsed.categories.map(c => c.toLowerCase())
    };
  } catch (error) {
    console.error("Error in analyzeUserQuery:", error);
    throw error;
  }
}

export async function generateBusinessDescription(business: BusinessInfo): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Generate a brief, friendly description (<150 chars) of a business based on its details."
        },
        {
          role: "user",
          content: JSON.stringify(business)
        }
      ]
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to get response from OpenAI");
    }

    return content;
  } catch (error) {
    console.error("Error in generateBusinessDescription:", error);
    throw error;
  }
}

export async function generateRefinementQuestion(businesses: BusinessInfo[]): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Generate a concise question to help narrow down business choices. The question should be specific to the differences between the businesses."
        },
        {
          role: "user",
          content: JSON.stringify(businesses)
        }
      ]
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to get response from OpenAI");
    }

    return content;
  } catch (error) {
    console.error("Error in generateRefinementQuestion:", error);
    throw error;
  }
}