import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ReactNode } from 'react';
import { z } from 'zod';
import { SendingConfirmationUI } from '@/components/ai/SendingConfirmationUI';
import { TransactionPendingUI } from '@/components/ai/TransactionPendingUI';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
console.log("Google Gemini Key:")
console.log(process.env.GOOGLE_GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({
  model: 'gemini-pro',
  generationConfig: {
    temperature: 0.1,
  }
});

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
console.log("### 1")
  const aiState = getMutableAIState<typeof AI>();
console.log("### 2")
  const currentState = aiState.get();
console.log("### 3")
  
  // Add user message to AI state
  aiState.update({
    ...currentState,
    messages: [
      ...currentState.messages,
      {
        id: Date.now().toString(),
        role: 'user',
        content,
      },
    ],
  });
console.log("### 4")
  try {
    const result = await streamUI({
      model: model, 
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
          const currentState = aiState.get();
          aiState.done({
            ...currentState,
            messages: [
              ...currentState.messages,
              {
                id: Date.now().toString(),
                role: 'assistant',
                content,
              },
            ],
          });
        }
console.log("### 5")
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
console.log("### 6")
            // Add to AI state
            const currentState = aiState.get();
            aiState.done({
              ...currentState,
              messages: [
                ...currentState.messages,
                {
                  id: Date.now().toString(),
                  role: 'assistant',
                  content: `Preparing to send ${amount} ${currency} to ${recipient}`,
                },
              ],
            });
console.log("### 7")
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

      const currentState = aiState.get();
      aiState.done({
        ...currentState,
        messages: [
          ...currentState.messages,
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

    const currentState = aiState.get();
    aiState.done({
      ...currentState,
      messages: [
        ...currentState.messages,
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
): Promise<ReactNode> {
  'use server';

  const aiState = getMutableAIState<typeof AI>();
  const currentState = aiState.get();
  
  // Add transaction confirmation to AI state
  aiState.done({
    ...currentState,
    messages: [
      ...currentState.messages,
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Processing transaction: ${amount} ${currency} to ${recipient}`,
      },
    ],
  });

  console.log("Returning transaction pending UI")
  // Return the transaction pending UI
  return (
    <TransactionPendingUI
      amount={amount}
      currency={currency}
      recipient={recipient}
    />
  );
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
