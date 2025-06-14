'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Plus, Zap, ArrowUpRight, ArrowDownLeft, Calendar, ArrowLeftRight, Grid as Bridge, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    onSendMessage(input.trim());
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
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-2xl w-full px-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-light text-gray-800 mb-2">
                {isHomePage ? "Hey there, Chijioke" : "New Chat"}
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="mb-8">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="How can I help you today?"
                  className="w-full p-4 pr-16 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                  <button
                    type="button"
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>

            {isHomePage && (
              <div className="flex flex-wrap gap-3 justify-center">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(action.description)}
                    className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
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
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full p-4 pr-16 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute bottom-4 right-4 p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}