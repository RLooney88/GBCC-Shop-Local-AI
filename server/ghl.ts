import axios from "axios";
import type { User, ChatMessage } from "@shared/schema";

export async function sendToGHL(data: {
  user: User;
  messages: ChatMessage[];
}) {
  if (!process.env.GHL_WEBHOOK_URL) {
    throw new Error("GHL_WEBHOOK_URL not configured");
  }

  try {
    // Format conversation into a readable transcript
    const transcript = data.messages.map(msg => {
      const timestamp = new Date(msg.timestamp).toLocaleString();
      const role = msg.role === 'user' ? data.user.name : 'Assistant';
      return `[${timestamp}] ${role}: ${msg.content}`;
    }).join('\n\n');

    // Prepare the payload for GHL
    const payload = {
      contact: {
        firstName: data.user.name.split(' ')[0],
        lastName: data.user.name.split(' ').slice(1).join(' '),
        email: data.user.email
      },
      conversation: {
        transcript: transcript,
        startedAt: new Date(data.messages[0]?.timestamp).toISOString(),
        endedAt: new Date(data.messages[data.messages.length - 1]?.timestamp).toISOString(),
        messageCount: data.messages.length
      }
    };

    await axios.post(process.env.GHL_WEBHOOK_URL, payload);
  } catch (error) {
    console.error("Error sending data to GHL:", error);
    throw error;
  }
}