'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';
import { useToast } from './ToastProvider';
import { useChat } from 'ai/react';
import { SendingConfirmationUI } from './ai/SendingConfirmationUI';
import { TransactionPendingUI } from './ai/TransactionPendingUI';
import { WalletBalance } from './ai/WalletBalance';
import { SwapInterface } from './ai/SwapInterface';

interface ChatInterfaceProps {
  chatId?: string;
}

// Simple markdown renderer function
function renderMarkdown(text: string): string {
  return text
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic text
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Line breaks
    .replace(/\n/g, '<br>')
    // Lists
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
}

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(chatId);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    onError: (error) => {
      console.error('Chat error:', error);
    }
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

  const handleSendMessage = (content: string) => {
    handleSubmit({ preventDefault: () => {} } as any);
  };

  const handleNewChat = () => {
    setCurrentChatId(undefined);
    router.push('/');
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
            <div 
              className="text-sm leading-relaxed text-gray-900 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: renderMarkdown(message.content) 
              }}
            />
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
      <div
        className={`fixed inset-0 z-40 pointer-events-none transition-all duration-500 ease-out ${false
          ? 'opacity-100 backdrop-blur-md bg-white/20'
          : 'opacity-0 backdrop-blur-none bg-transparent'
          }`}
      />

      <Sidebar
        expanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        onNewChat={handleNewChat}
        currentChatId={currentChatId}
      />

      <div className="flex-1 flex flex-col h-screen">
        <ChatArea
          messages={transformedMessages}
          onSendMessage={(content) => {
            handleInputChange({ target: { value: content } } as any);
            handleSubmit({ preventDefault: () => {} } as any);
          }}
          isHomePage={isHomePage}
          onInputFocus={() => setIsInputFocused(true)}
          onInputBlur={() => setIsInputFocused(false)}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}