import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { ReactNode } from 'react';
import { z } from 'zod';
import { SendingConfirmationUI } from '@/components/ai/SendingConfirmationUI';
import { TransactionPendingUI } from '@/components/ai/TransactionPendingUI';

// Define the AI state and UI state types
export interface AIState {
  chatId: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface UIState {
  id: string;
  display: ReactNode;
}

// Fallback response generator
function getWalletResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('balance')) {
    return "I can help you check your wallet balance. Your current balances are: ETH: 2.45, USDC: 1,234.56, ALGO: 500.00. Would you like to see more details for any specific token?";
  }
  
  if (lowerMessage.includes('receive') || lowerMessage.includes('deposit')) {
    return "To receive cryptocurrency, you can share your wallet address or generate a QR code. Would you like me to show your receiving address for a specific token?";
  }
  
  if (lowerMessage.includes('swap') || lowerMessage.includes('exchange')) {
    return "I can help you swap between different cryptocurrencies. What tokens would you like to swap? For example, you could swap ETH for USDC or vice versa.";
  }
  
  if (lowerMessage.includes('bridge')) {
    return "Bridging allows you to move assets between different blockchains. Which chains would you like to bridge between? Popular options include Ethereum, Polygon, and Avalanche.";
  }
  
  if (lowerMessage.includes('schedule')) {
    return "You can schedule transactions to be executed at a specific time or when certain conditions are met. What type of scheduled transaction would you like to set up?";
  }
  
  if (lowerMessage.includes('borrow') || lowerMessage.includes('lend')) {
    return "I can help you explore DeFi lending and borrowing options. You can lend your crypto to earn yield or borrow against your holdings. What are you interested in?";
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return "I'm your AI wallet assistant! I can help you send crypto, check balances, swap tokens, bridge assets, schedule transactions, and explore DeFi opportunities. What would you like to do?";
  }
  
  return "I'm here to help with your cryptocurrency wallet needs. I can assist with sending crypto, checking balances, swapping tokens, and more. How can I help you today?";
}

// Main AI action using streamUI
async function submitUserMessage(content: string): Promise<{
  id: string;
  display: ReactNode;
}> {
  'use server';

  const aiState = getMutableAIState<typeof AI>();
  
  // Add user message to AI state
  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: Date.now().toString(),
        role: 'user',
        content,
      },
    ],
  });

  try {
    const result = await streamUI({
      model: 'gpt-4o', // Using OpenAI since Gemini isn't directly supported
      system: `You are a helpful cryptocurrency wallet assistant. You can help with:
      - Sending cryptocurrency (use the sendCrypto tool when users want to send/transfer/pay crypto)
      - Checking balances
      - Explaining crypto concepts
      - Providing wallet management guidance
      - Answering general questions about cryptocurrency
      
      Keep responses concise and helpful.`,
      messages: [
        ...aiState.get().messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
      text: ({ content, done }) => {
        if (done) {
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: Date.now().toString(),
                role: 'assistant',
                content,
              },
            ],
          });
        }

        return (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm leading-relaxed text-gray-900">{content}</p>
          </div>
        );
      },
      tools: {
        sendCrypto: {
          description: 'Prepare a cryptocurrency transaction for sending',
          parameters: z.object({
            amount: z.number().describe('The amount of cryptocurrency to send'),
            currency: z.string().describe('The cryptocurrency symbol (e.g., ETH, BTC, USDC)'),
            recipient: z.string().describe('The recipient address or username'),
          }),
          generate: async function* ({ amount, currency, recipient }) {
            yield (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-600">Preparing transaction...</p>
                </div>
              </div>
            );

            // Add to AI state
            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: Date.now().toString(),
                  role: 'assistant',
                  content: `Preparing to send ${amount} ${currency} to ${recipient}`,
                },
              ],
            });

            return (
              <SendingConfirmationUI
                amount={amount}
                currency={currency}
                recipient={recipient}
                originalMessage={content}
              />
            );
          },
        },
      },
    });

    return {
      id: Date.now().toString(),
      display: result.value,
    };

  } catch (error) {
    console.error('Error in AI response:', error);
    
    // Fallback response with pattern matching
    const lowerContent = content.toLowerCase();
    const isSendRequest = lowerContent.includes('send') || 
                         lowerContent.includes('transfer') || 
                         lowerContent.includes('pay');
    
    if (isSendRequest) {
      // Extract transaction details
      const amountMatch = content.match(/(\d+(?:\.\d+)?)/);
      const currencyMatch = content.match(/\b(ETH|BTC|USDC|ALGO|MATIC|SOL|AVAX|ADA|DOT|LINK|UNI)\b/i);
      const recipientMatch = content.match(/@(\w+)/) || content.match(/to (\w+)/i);
      
      const amount = amountMatch ? parseFloat(amountMatch[1]) : 1;
      const currency = currencyMatch ? currencyMatch[1].toUpperCase() : 'ETH';
      const recipient = recipientMatch ? recipientMatch[1] : 'Unknown';

      const confirmationUI = (
        <SendingConfirmationUI
          amount={amount}
          currency={currency}
          recipient={recipient}
          originalMessage={content}
        />
      );

      aiState.done({
        ...aiState.get(),
        messages: [
          ...aiState.get().messages,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Transaction prepared: ${amount} ${currency} to ${recipient}`,
          },
        ],
      });

      return {
        id: Date.now().toString(),
        display: confirmationUI,
      };
    }
    
    // Fallback to simple response
    const fallbackResponse = getWalletResponse(content);
    const responseUI = (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-sm leading-relaxed text-gray-900">{fallbackResponse}</p>
      </div>
    );

    aiState.done({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: fallbackResponse,
        },
      ],
    });

    return {
      id: Date.now().toString(),
      display: responseUI,
    };
  }
}

// Transaction confirmation action
async function confirmTransaction(
  amount: number,
  currency: string,
  recipient: string
): Promise<{
  id: string;
  display: ReactNode;
}> {
  'use server';

  const aiState = getMutableAIState<typeof AI>();
  
  // Generate transaction pending UI
  const display = (
    <TransactionPendingUI
      amount={amount}
      currency={currency}
      recipient={recipient}
    />
  );

  // Add transaction confirmation to AI state
  aiState.done({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Processing transaction: ${amount} ${currency} to ${recipient}`,
      },
    ],
  });

  return {
    id: Date.now().toString(),
    display,
  };
}

// Create the AI instance
export const AI = createAI<AIState, UIState[]>({
  actions: {
    submitUserMessage,
    confirmTransaction,
  },
  initialUIState: [],
  initialAIState: { chatId: 'new', messages: [] },
});