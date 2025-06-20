'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';
import { useToast } from './ToastProvider';
import { useChat } from '@ai-sdk/react';
import { SendingConfirmationUI } from './ai/SendingConfirmationUI';
import { TransactionPendingUI } from './ai/TransactionPendingUI';
import { WalletBalance } from './ai/WalletBalance';
import { SwapInterface } from './ai/SwapInterface';

interface ChatInterfaceProps {
  chatId?: string;
}

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(chatId);

  // Use the useChat hook properly
  const { messages, append, isLoading } = useChat({
    api: '/api/chat',
  });

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

    // Send the message using the append function from useChat
    await append({
      role: 'user',
      content: content
    });
  };

  const handleNewChat = () => {
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
    }
  }, [chatId, currentChatId]);

  // Transform messages to include tool invocation rendering
  const transformedMessages = messages.map(message => ({
    id: message.id,
    display: (
      <div key={message.id}>
        {/* Regular message content */}
        {message.content && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <div className="text-sm font-medium text-gray-600 mb-2">
              {message.role === 'user' ? 'You' : 'Assistant'}
            </div>
            <p className="text-sm leading-relaxed text-gray-900">{message.content}</p>
          </div>
        )}

        {/* Tool invocations */}
        {message.toolInvocations?.map(toolInvocation => {
          const { toolName, toolCallId, state } = toolInvocation;

          if (state === 'result') {
            const { result } = toolInvocation;

            if (toolName === 'sendCryptocurrency') {
              return (
                <div key={toolCallId} className="mb-4">
                  <SendingConfirmationUI
                    amount={result.amount}
                    currency={result.currency}
                    recipient={result.recipient}
                    originalMessage={`Send ${result.amount} ${result.currency} to ${result.recipient}`}
                  />
                </div>
              );
            } else if (toolName === 'getWalletInfo') {
              return (
                <div key={toolCallId} className="mb-4">
                  <WalletBalance
                    query={result.query}
                    data={result.data}
                  />
                </div>
              );
            } else if (toolName === 'swapCryptocurrency') {
              return (
                <div key={toolCallId} className="mb-4">
                  <SwapInterface
                    fromCurrency={result.fromCurrency}
                    toCurrency={result.toCurrency}
                    fromAmount={result.fromAmount}
                    toAmount={result.toAmount}
                    exchangeRate={result.exchangeRate}
                    transactionId={result.transactionId}
                    status={result.status}
                  />
                </div>
              );
            }
          } else {
            // Loading state
            return (
              <div key={toolCallId} className="mb-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-600">
                      {toolName === 'sendCryptocurrency' && 'Preparing transaction...'}
                      {toolName === 'getWalletInfo' && 'Loading wallet information...'}
                      {toolName === 'swapCryptocurrency' && 'Processing swap...'}
                      {!['sendCryptocurrency', 'getWalletInfo', 'swapCryptocurrency'].includes(toolName) && 'Processing...'}
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    )
  }));

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Global Blur Overlay - only on home page when input is focused */}
      {isHomePage && (
        <div
          className={`fixed inset-0 z-40 pointer-events-none transition-all duration-500 ease-out ${isInputFocused
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
          messages={transformedMessages}
          onSendMessage={handleSendMessage}
          isHomePage={isHomePage}
          onInputFocus={() => setIsInputFocused(true)}
          onInputBlur={() => setIsInputFocused(false)}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
