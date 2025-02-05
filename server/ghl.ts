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
    // Format conversation for GHL
    const formattedMessages = data.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp).toISOString()
    }));

    // Prepare the payload for GHL
    const payload = {
      contact: {
        firstName: data.user.name.split(' ')[0],
        lastName: data.user.name.split(' ').slice(1).join(' '),
        email: data.user.email
      },
      conversation: {
        messages: formattedMessages,
        summary: `Chat session with ${data.user.name}`,
        startedAt: formattedMessages[0]?.timestamp,
        lastMessageAt: formattedMessages[formattedMessages.length - 1]?.timestamp
      }
    };

    await axios.post(process.env.GHL_WEBHOOK_URL, payload);
  } catch (error) {
    console.error("Error sending data to GHL:", error);
    throw error;
  }
}
