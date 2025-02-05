import axios from "axios";
import type { User, ChatMessage } from "@shared/schema";

function createConversationSummary(messages: ChatMessage[], user: User): string {
  // Find the last inquiry from the user
  let lastInquiry = '';
  let matchedBusiness = null;
  let businessInfo = '';

  // Scan messages in reverse to find the last complete interaction
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];

    // Extract business information when found
    if (msg.role === 'assistant' && msg.content.includes('📞')) {
      businessInfo = msg.content;
      continue;
    }

    // Find the last user inquiry before the business info
    if (msg.role === 'user' && !lastInquiry && businessInfo) {
      lastInquiry = msg.content;
      break;
    }
  }

  // Create a concise summary
  return `User Inquiry: ${lastInquiry || 'N/A'}

${businessInfo ? `Recommended Business:\n${businessInfo}` : 'No specific business was recommended.'}`
}

export async function sendToGHL(data: {
  user: User;
  messages: ChatMessage[];
}) {
  if (!process.env.GHL_WEBHOOK_URL) {
    throw new Error("GHL_WEBHOOK_URL not configured");
  }

  try {
    const summary = createConversationSummary(data.messages, data.user);

    // Current timestamp for the conversation end
    const currentTime = new Date().toISOString();

    // Prepare the payload for GHL
    const payload = {
      contact: {
        firstName: data.user.name.split(' ')[0],
        lastName: data.user.name.split(' ').slice(1).join(' '),
        email: data.user.email
      },
      conversation: {
        summary: summary,
        endedAt: currentTime,
        totalMessages: data.messages.length
      }
    };

    await axios.post(process.env.GHL_WEBHOOK_URL, payload);
  } catch (error) {
    console.error("Error sending data to GHL:", error);
    throw error;
  }
}