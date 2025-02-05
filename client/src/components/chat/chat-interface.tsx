import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import type { ChatMessage as ChatMessageType, BusinessInfo } from "@shared/schema";

interface ChatInterfaceProps {
  chatId: number;
}

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessInfo | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Query to fetch initial chat messages
  const { data: initialChat } = useQuery({
    queryKey: [`/api/chat/${chatId}`],
    queryFn: async () => {
      const res = await fetch(`/api/chat/${chatId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch chat');
      return res.json();
    },
  });

  // Set initial messages when chat data is loaded
  useEffect(() => {
    if (initialChat?.messages) {
      setMessages(initialChat.messages);
    }
  }, [initialChat]);

  // Scroll to bottom whenever messages change or typing status changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/chat/message", {
        chatId,
        message
      });
      return res.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: input, timestamp: Date.now() },
        { role: 'assistant', content: data.message, timestamp: Date.now() }
      ]);
      setInput("");
      if (data.businesses) {
        setSelectedBusiness(data.businesses);
        // Add business info as a system message
        if (data.businesses) {
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: `Here's the contact information for ${data.businesses.name}:
📞 ${data.businesses.phone || 'Phone not available'}
📧 ${data.businesses.email || 'Email not available'}
🌐 ${data.businesses.website ? `[${new URL(data.businesses.website.startsWith('http') ? data.businesses.website : `https://${data.businesses.website}`).hostname}](${data.businesses.website.startsWith('http') ? data.businesses.website : `https://${data.businesses.website}`})` : 'Website not available'}`,
              timestamp: Date.now()
            }
          ]);

          // Show typing indicator
          setIsTyping(true);

          // Add follow-up message after a delay
          setTimeout(() => {
            setMessages(prev => [
              ...prev,
              {
                role: 'assistant',
                content: "Is there anything else I can help you find today?",
                timestamp: Date.now()
              }
            ]);
            setIsTyping(false);
          }, 5000); // 5 second delay
        }
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !sendMessage.isPending) {
      sendMessage.mutate(input);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, i) => (
            <ChatMessage key={i} message={message} />
          ))}
          {(sendMessage.isPending || isTyping) && (
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100" />
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200" />
            </div>
          )}
          <div ref={messagesEndRef} /> {/* Add this invisible element */}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={sendMessage.isPending}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={sendMessage.isPending}
            className="bg-[#00A7B7] hover:bg-[#008A99]"
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}