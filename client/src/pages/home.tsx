import { useState } from "react";
import { UserForm } from "@/components/chat/user-form";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [chatStarted, setChatStarted] = useState(false);
  const [chatId, setChatId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="border-t-4 border-t-[#00A7B7]">
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Business Discovery Assistant
            </h1>
            <p className="text-gray-600 mb-8">
              Let me help you find the perfect local business for your needs.
            </p>
            
            {!chatStarted ? (
              <UserForm onChatStart={(id) => {
                setChatId(id);
                setChatStarted(true);
              }} />
            ) : (
              <ChatInterface chatId={chatId!} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
