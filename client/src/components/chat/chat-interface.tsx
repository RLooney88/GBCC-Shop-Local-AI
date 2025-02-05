import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { BusinessCard } from "./business-card";
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
    <div className="flex flex-col space-y-4">
      <ScrollArea className="h-[400px] p-4 rounded-lg border">
        {messages.map((message, i) => (
          <ChatMessage key={i} message={message} />
        ))}
        {sendMessage.isPending && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100" />
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200" />
          </div>
        )}
      </ScrollArea>

      {selectedBusiness && (
        <BusinessCard business={selectedBusiness} />
      )}

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={sendMessage.isPending}
        />
        <Button 
          type="submit" 
          disabled={sendMessage.isPending}
          className="bg-[#00A7B7] hover:bg-[#008A99]"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
