'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';

interface ChatInterfaceProps {
  chatId?: string;
}

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const router = useRouter();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [messages, setMessages] = useState<Array<{
    id: string;
    content: string;
    role: 'user' | 'assistant';
    thinking?: boolean;
  }>>([]);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(chatId);

  // Check if we're on the home page (no chatId)
  const isHomePage = !currentChatId;

  const handleSendMessage = (content: string) => {
    let activeChatId = currentChatId;
    
    // If we're on the home page, create a new chat ID and update URL
    if (isHomePage) {
      activeChatId = generateChatId();
      setCurrentChatId(activeChatId);
      // Update URL without navigation
      window.history.pushState({}, '', `/chats/${activeChatId}`);
    }

    const userMessage = {
      id: Date.now().toString(),
      content,
      role: 'user' as const,
    };

    const thinkingMessage = {
      id: (Date.now() + 1).toString(),
      content: 'Thinking...',
      role: 'assistant' as const,
      thinking: true,
    };

    setMessages(prev => [...prev, userMessage, thinkingMessage]);

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === thinkingMessage.id 
            ? { 
                ...msg, 
                content: generateAIResponse(content),
                thinking: false 
              }
            : msg
        )
      );
    }, 2500);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(undefined);
    router.push('/');
  };

  const generateChatId = (): string => {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateAIResponse = (userMessage: string): string => {
    const responses = [
      "I understand your question. Let me help you with that. This is a simulated response to demonstrate the chat functionality.",
      "That's an interesting point. Here's what I think about it: This interface demonstrates smooth animations and responsive design patterns.",
      "I can help you with that. This response shows how the AI agent would provide thoughtful, detailed answers to user queries.",
      "Thank you for your message. This simulated response demonstrates the chat interface's ability to handle various types of conversations."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Load messages for existing chat (in a real app, this would fetch from an API)
  useEffect(() => {
    if (chatId && chatId !== currentChatId) {
      setCurrentChatId(chatId);
      // In a real application, you would fetch messages for this chatId
      // For now, we'll just ensure messages are empty for new chats
      setMessages([]);
    }
  }, [chatId, currentChatId]);

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