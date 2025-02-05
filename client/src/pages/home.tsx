import { useState } from "react";
import { UserForm } from "@/components/chat/user-form";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [chatStarted, setChatStarted] = useState(false);
  const [chatId, setChatId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-4 right-4 bg-[#00A7B7] hover:bg-[#008A99] rounded-full p-4 shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-[400px] h-[600px] transition-all duration-300 ease-in-out">
      <Card className="h-full flex flex-col shadow-xl border-t-4 border-t-[#00A7B7]">
        <div className="p-4 border-b flex justify-between items-center bg-[#00A7B7] text-white">
          <h2 className="font-semibold">The Shop Local Assistant</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:text-white hover:bg-[#008A99]"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          {!chatStarted ? (
            <div className="p-4">
              <p className="text-gray-600 mb-4">
                Hi there! Introduce yourself to begin!
              </p>
              <UserForm onChatStart={(id) => {
                setChatId(id);
                setChatStarted(true);
              }} />
            </div>
          ) : (
            <ChatInterface chatId={chatId!} />
          )}
        </div>
      </Card>
    </div>
  );
}