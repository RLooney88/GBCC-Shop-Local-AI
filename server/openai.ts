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
          content: `You are a business search assistant. Analyze user queries to extract search terms that will help find relevant businesses.

            Important guidelines:
            - Focus on identifying business needs and requirements, not just keywords
            - Consider various ways a user might describe the same business need
            - Extract both specific terms and general business categories

            Always respond with a JSON object in this exact format:
            {
              "keywords": ["extracted terms that describe what user wants"],
              "categories": ["business categories that might fulfill this need"]
            }`
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

export async function generateRefinementQuestion(businesses: BusinessInfo[]): Promise<string> {
  try {
    // Group businesses by primary characteristic
    const characteristicGroups = businesses.reduce((groups: any, business) => {
      const key = business.primaryServices.split(',')[0].trim().toLowerCase();
      if (!groups[key]) groups[key] = [];
      groups[key].push(business);
      return groups;
    }, {});

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a business directory assistant helping users find the right business.
            Given grouped business information, generate a clear question to help narrow down choices.
            Focus on the key differentiators between groups.
            Keep questions simple and user-friendly.`
        },
        {
          role: "user",
          content: JSON.stringify({
            groups: characteristicGroups,
            totalBusinesses: businesses.length
          })
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

export async function generateBusinessDescription(business: BusinessInfo): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Create a brief, engaging description (<150 chars) highlighting this business's key value proposition and unique services.
            Focus on what makes them special and how they can help potential customers.`
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