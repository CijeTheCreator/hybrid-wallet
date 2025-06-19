'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';
import { useToast } from './ToastProvider';
import { useAIState, useUIState, useActions } from 'ai/rsc';
import type { AI } from '@/lib/ai';

interface ChatInterfaceProps {
  chatId?: string;
}

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(chatId);

  // AI state management
  const [aiState] = useAIState<typeof AI>();
  const [messages, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions<typeof AI>();

  // Check if we're on the home page (no chatId)
  const isHomePage = !currentChatId;

  // Demo toast notification - simulate receiving crypto
  useEffect(() => {
    // Show a demo toast after 3 seconds on home page
    if (isHomePage) {
      const timer = setTimeout(() => {
        showToast({
          type: 'crypto-received',
          title: 'Crypto Received!',
          message: 'You have received Ethereum',
          amount: '$10.00',
          currency: 'ETH',
          transactionId: 'demo-tx-' + Date.now()
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isHomePage, showToast]);

  const handleSendMessage = async (content: string) => {
    let activeChatId = currentChatId;
    
    // If we're on the home page, create a new chat ID and update URL
    if (isHomePage) {
      activeChatId = generateChatId();
      setCurrentChatId(activeChatId);
      // Update URL without navigation
      window.history.pushState({}, '', `/chats/${activeChatId}`);
    }

    try {
      // Submit message to AI and get response
      console.log(1)
      const response = await submitUserMessage(content);
      console.log(2)
      setMessages(currentMessages => [...currentMessages, response]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback to simple response
      const fallbackResponse = {
        id: Date.now().toString(),
        display: (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm leading-relaxed text-gray-900">
              I'm here to help with your cryptocurrency wallet. How can I assist you today?
            </p>
          </div>
        )
      };
      setMessages(currentMessages => [...currentMessages, fallbackResponse]);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(undefined);
    router.push('/');
  };

  const generateChatId = (): string => {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Load messages for existing chat (in a real app, this would fetch from an API)
  useEffect(() => {
    if (chatId && chatId !== currentChatId) {
      setCurrentChatId(chatId);
      // In a real application, you would fetch messages for this chatId
      // For now, we'll just ensure messages are empty for new chats
      setMessages([]);
    }
  }, [chatId, currentChatId, setMessages]);

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Global Blur Overlay - only on home page when input is focused */}
      {isHomePage && (
        <div 
          className={`fixed inset-0 z-40 pointer-events-none transition-all duration-500 ease-out ${
            isInputFocused 
              ? 'opacity-100 backdrop-blur-md bg-white/20' 
              : 'opacity-0 backdrop-blur-none bg-transparent'
          }`}
        />
      )}

      <Sidebar 
        expanded={sidebarExpanded} 
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        onNewChat={handleNewChat}
        currentChatId={currentChatId}
      />
      
      <div className="flex-1 flex flex-col">
        <ChatArea 
          messages={messages} 
          onSendMessage={handleSendMessage}
          isHomePage={isHomePage}
          onInputFocus={() => setIsInputFocused(true)}
          onInputBlur={() => setIsInputFocused(false)}
        />
      </div>
    </div>
  );
}