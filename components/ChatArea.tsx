'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Zap, ArrowUpRight, ArrowDownLeft, Calendar, ArrowLeftRight, Grid as Bridge, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccountSwitcher } from './AccountSwitcher';
import { EnhancedChatInput } from './EnhancedChatInput';

interface ChatAreaProps {
  messages: Array<{
    id: string;
    display: React.ReactNode;
  }>;
  onSendMessage: (content: string) => void;
  isHomePage?: boolean;
  onInputFocus?: () => void;
  onInputBlur?: () => void;
}

export function ChatArea({ messages, onSendMessage, isHomePage = false, onInputFocus, onInputBlur }: ChatAreaProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = useCallback((content: string) => {
    onSendMessage(content);
    setInput('');
  }, [onSendMessage]);

  // Use useCallback to prevent recreation on every render
  const handleQuickAction = useCallback((description: string) => {
    setInput(description);
  }, []);

  // Memoize the focus/blur handlers to prevent recreation
  const handleInputFocus = useCallback(() => {
    onInputFocus?.();
  }, [onInputFocus]);

  const handleInputBlur = useCallback(() => {
    onInputBlur?.();
  }, [onInputBlur]);

  const quickActions = [
    { icon: ArrowUpRight, label: 'Send', description: 'Send cryptocurrency or tokens' },
    { icon: ArrowDownLeft, label: 'Receive', description: 'Receive cryptocurrency or tokens' },
    { icon: Calendar, label: 'Schedule', description: 'Schedule a transaction' },
    { icon: ArrowLeftRight, label: 'Swap', description: 'Swap between cryptocurrencies' },
    { icon: Bridge, label: 'Bridge', description: 'Bridge assets across chains' },
    { icon: TrendingUp, label: 'Borrow', description: 'Borrow cryptocurrency' },
    { icon: TrendingDown, label: 'Lend', description: 'Lend cryptocurrency for yield' },
  ];

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-2xl w-full px-6">
            <div className="text-center mb-8">
              {/* Account Switcher */}
              <div className="flex justify-center mb-4">
                <AccountSwitcher />
              </div>

              <h1 className="text-3xl font-light text-gray-800 mb-2">
                {isHomePage ? "Hey there, Chijioke" : "New Chat"}
              </h1>
            </div>

            <div className="mb-8 relative z-50">
              <EnhancedChatInput
                value={input}
                onChange={setInput}
                onSubmit={handleSubmit}
                placeholder="How can I help you today?"
                rows={3}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

            {isHomePage && (
              <div className="flex flex-wrap gap-3 justify-center">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.description)}
                    className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:scale-105"
                  >
                    <action.icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div key={index} className="flex justify-start">
              <div className="max-w-[80%]">
                {message.display}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-200 p-6">
        <div className="max-w-3xl mx-auto">
          <EnhancedChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            placeholder="Type your message..."
            rows={2}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        </div>
      </div>
    </div>
  );
}
