import { GoogleGenerativeAI } from '@google/generative-ai';
import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { ReactNode } from 'react';
import { SendingConfirmationUI } from '@/components/ai/SendingConfirmationUI';
import { TransactionPendingUI } from '@/components/ai/TransactionPendingUI';

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || 'dummy-key');

// Define the AI state and UI state types
export interface AIState {
  chatId: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    ui?: ReactNode;
  }>;
}

export interface UIState {
  id: string;
  display: ReactNode;
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

  // Simple pattern matching for demo purposes
  const lowerContent = content.toLowerCase();
  
  // Check if this is a send/transfer request
  const isSendRequest = lowerContent.includes('send') || 
                       lowerContent.includes('transfer') || 
                       lowerContent.includes('pay');
  
  if (isSendRequest) {
    // Extract amount, currency, and recipient using regex
    const amountMatch = content.match(/(\d+(?:\.\d+)?)/);
    const currencyMatch = content.match(/\b(ETH|BTC|USDC|ALGO|MATIC|SOL|AVAX|ADA|DOT|LINK|UNI)\b/i);
    const recipientMatch = content.match(/@(\w+)/) || content.match(/to (\w+)/i);
    
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 1;
    const currency = currencyMatch ? currencyMatch[1].toUpperCase() : 'ETH';
    const recipient = recipientMatch ? recipientMatch[1] : 'Unknown';

    try {
      const result = await streamUI({
        model: genAI.getGenerativeModel({ 
          model: 'gemini-pro',
          generationConfig: {
            temperature: 0.1,
          }
        }),
        initial: (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-600">Preparing transaction...</p>
            </div>
          </div>
        ),
        system: 'You are a helpful cryptocurrency wallet assistant preparing a transaction.',
        messages: [
          {
            role: 'user',
            content: `Prepare to send ${amount} ${currency} to ${recipient}`,
          },
        ],
        text: ({ content }) => {
          return (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm leading-relaxed text-gray-900">{content}</p>
            </div>
          );
        },
      });

      const confirmationUI = (
        <SendingConfirmationUI
          amount={amount}
          currency={currency}
          recipient={recipient}
          originalMessage={content}
        />
      );

      aiState.update({
        ...aiState.get(),
        messages: [
          ...aiState.get().messages,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Transaction prepared: ${amount} ${currency} to ${recipient}`,
            ui: confirmationUI,
          },
        ],
      });

      // Finalize AI state
      aiState.done({
        ...aiState.get(),
      });

      return {
        id: Date.now().toString(),
        display: confirmationUI,
      };

    } catch (error) {
      console.error('Error in transaction preparation:', error);
      // Fallback to simple confirmation UI
      const confirmationUI = (
        <SendingConfirmationUI
          amount={amount}
          currency={currency}
          recipient={recipient}
          originalMessage={content}
        />
      );

      aiState.update({
        ...aiState.get(),
        messages: [
          ...aiState.get().messages,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Transaction prepared: ${amount} ${currency} to ${recipient}`,
            ui: confirmationUI,
          },
        ],
      });

      // Finalize AI state
      aiState.done({
        ...aiState.get(),
      });

      return {
        id: Date.now().toString(),
        display: confirmationUI,
      };
    }
  }

  // Handle general queries
  try {
    const result = await streamUI({
      model: genAI.getGenerativeModel({ 
        model: 'gemini-pro',
        generationConfig: {
          temperature: 0.7,
        }
      }),
      initial: (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600">Thinking...</p>
          </div>
        </div>
      ),
      system: `You are a helpful cryptocurrency wallet assistant. You can help with:
      - Checking balances
      - Explaining crypto concepts
      - Providing wallet management guidance
      - Answering general questions about cryptocurrency
      
      Keep responses concise and helpful.`,
      messages: [
        {
          role: 'user',
          content,
        },
      ],
      text: ({ content }) => {
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm leading-relaxed text-gray-900">{content}</p>
          </div>
        );
      },
    });

    aiState.update({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'AI response generated',
        },
      ],
    });

    // Finalize AI state
    aiState.done({
      ...aiState.get(),
    });

    return {
      id: Date.now().toString(),
      display: result.value,
    };

  } catch (error) {
    console.error('Error in general response:', error);
    
    // Fallback response
    const fallbackResponse = getWalletResponse(content);
    const responseUI = (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-sm leading-relaxed text-gray-900">{fallbackResponse}</p>
      </div>
    );

    aiState.update({
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

    // Finalize AI state
    aiState.done({
      ...aiState.get(),
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
  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Processing transaction: ${amount} ${currency} to ${recipient}`,
        ui: display,
      },
    ],
  });

  // Finalize AI state
  aiState.done({
    ...aiState.get(),
  });

  return {
    id: Date.now().toString(),
    display,
  };
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

// Create the AI instance
export const AI = createAI<AIState, UIState[]>({
  actions: {
    submitUserMessage,
    confirmTransaction,
  },
  initialUIState: [],
  initialAIState: { chatId: 'new', messages: [] },
});