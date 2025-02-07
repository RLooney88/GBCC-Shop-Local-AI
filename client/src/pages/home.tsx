import { useEffect, useRef, useState } from 'react';
import { UserForm } from '@/components/chat/user-form';
import { ChatInterface } from '@/components/chat/chat-interface';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [chatStarted, setChatStarted] = useState(false);
  const [chatId, setChatId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // For smooth transitions

  // Ref to track the chatbot container
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Smooth transition: Delay removal
  const closeChat = () => {
    setIsVisible(false);
    setTimeout(() => setIsOpen(false), 300); // Match the transition duration
  };

  // Close chatbot on Escape key or clicking outside
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeChat();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target as Node)
      ) {
        closeChat();
      }
    };

    if (isOpen) {
      setIsVisible(true); // Start fade-in transition
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const clsTransition = isVisible
    ? 'translate-y-0 visible'
    : 'duration-700 translate-y-full invisible';

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          className="fixed bottom-4 right-4 bg-[#00A7B7] hover:bg-[#008A99] rounded-full p-4 shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Chat Widget (iframe only) */}
      {isOpen && (
        <div
          ref={chatContainerRef}
          className={cn(
            'fixed sm:bottom-4 sm:right-4 w-[100vw] sm:w-[400px] h-[100vh] sm:h-[95vh] lg:h-[600px] transition-all duration-300 ease-in-out',
            clsTransition
          )}
        >
          <Card className="h-full flex flex-col shadow-xl border-0 rounded-none sm:rounded-lg">
            <div className="p-4 border-b flex justify-between items-center rounded-none sm:rounded-t-lg bg-[#00A7B7] text-white">
              <h2 className="font-semibold">The Shop Local Assistant</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:text-white hover:bg-[#008A99]"
                onClick={() => closeChat()}
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
                  <UserForm
                    onChatStart={(id) => {
                      setChatId(id);
                      setChatStarted(true);
                    }}
                  />
                </div>
              ) : (
                <ChatInterface chatId={chatId!} />
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
