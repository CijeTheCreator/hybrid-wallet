'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Zap, ArrowUpRight, ArrowDownLeft, Calendar, ArrowLeftRight, Grid as Bridge, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccountSwitcher } from './AccountSwitcher';
import { EnhancedChatInput } from './EnhancedChatInput';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  thinking?: boolean;
}

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isHomePage?: boolean;
}

export function ChatArea({ messages, onSendMessage, isHomePage = false }: ChatAreaProps) {
  const [input, setInput] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (content: string) => {
    onSendMessage(content);
    setInput('');
  };

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
        {/* Blur Overlay */}
        {isInputFocused && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div 
              className="absolute inset-0 backdrop-blur-sm bg-white/30 transition-all duration-300"
              style={{
                maskImage: `
                  radial-gradient(ellipse at center bottom, transparent 0%, transparent 25%, black 60%),
                  linear-gradient(to bottom, black 0%, black 70%, transparent 100%)
                `,
                WebkitMaskImage: `
                  radial-gradient(ellipse at center bottom, transparent 0%, transparent 25%, black 60%),
                  linear-gradient(to bottom, black 0%, black 70%, transparent 100%)
                `,
                maskComposite: 'intersect',
                WebkitMaskComposite: 'source-in'
              }}
            />
          </div>
        )}

        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-2xl w-full px-6 relative z-20">
            <div className="text-center mb-8">
              {/* Account Switcher */}
              <div className="flex justify-center mb-4">
                <AccountSwitcher />
              </div>
              
              <h1 className="text-3xl font-light text-gray-800 mb-2">
                {isHomePage ? "Hey there, Chijioke" : "New Chat"}
              </h1>
            </div>

            <div className="mb-8">
              <EnhancedChatInput
                value={input}
                onChange={setInput}
                onSubmit={handleSubmit}
                placeholder="How can I help you today?"
                rows={3}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                isFocused={isInputFocused}
              />
            </div>

            {isHomePage && (
              <div 
                className={cn(
                  "flex flex-wrap gap-3 justify-center transition-all duration-300 relative z-20",
                  isInputFocused ? "opacity-100" : "opacity-100"
                )}
              >
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(action.description)}
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
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-4",
                  message.role === 'user'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white border border-gray-200'
                )}
              >
                {message.thinking ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-gray-600 text-sm">Thinking...</span>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{message.content}</p>
                )}
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
          />
        </div>
      </div>
    </div>
  );
}