import { GoogleGenerativeAI } from '@google/generative-ai';
import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { ReactNode } from 'react';
import { SendingConfirmationUI } from '@/components/ai/SendingConfirmationUI';
import { TransactionPendingUI } from '@/components/ai/TransactionPendingUI';

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

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

// Function definitions for Gemini
const functions = {
  send_cryptocurrency: {
    description: 'Process a cryptocurrency sending request',
    parameters: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          description: 'The amount of cryptocurrency to send'
        },
        currency: {
          type: 'string',
          description: 'The cryptocurrency symbol (e.g., ETH, BTC, USDC, ALGO)',
          enum: ['ETH', 'BTC', 'USDC', 'ALGO', 'MATIC', 'SOL', 'AVAX', 'ADA', 'DOT', 'LINK', 'UNI']
        },
        recipient: {
          type: 'string',
          description: 'The recipient username or wallet address'
        }
      },
      required: ['amount', 'currency', 'recipient']
    }
  },
  general_response: {
    description: 'Provide a general response for non-transaction queries',
    parameters: {
      type: 'object',
      properties: {
        response: {
          type: 'string',
          description: 'A helpful response to the user query'
        }
      },
      required: ['response']
    }
  }
};

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

  const result = await streamUI({
    model: genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.1, // Lower temperature for more consistent function calling
      }
    }),
    initial: (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600">Processing your request...</p>
        </div>
      </div>
    ),
    system: `You are a helpful cryptocurrency wallet assistant. 
    
    When users want to send, transfer, or pay cryptocurrency:
    - Use the send_cryptocurrency function
    - Extract the amount, currency, and recipient from their message
    - Be flexible with recipient formats (usernames with @, wallet addresses, or plain names)
    
    For all other queries (balance checks, help, general questions):
    - Use the general_response function
    - Provide helpful, concise responses about cryptocurrency and wallet operations`,
    
    messages: [
      {
        role: 'user',
        content,
      },
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
      send_cryptocurrency: {
        description: functions.send_cryptocurrency.description,
        parameters: functions.send_cryptocurrency.parameters,
        generate: async function* ({ amount, currency, recipient }) {
          yield (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-600">Preparing transaction...</p>
              </div>
            </div>
          );

          // Simulate processing delay
          await new Promise(resolve => setTimeout(resolve, 1000));

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
                content: `Prepared transaction: ${amount} ${currency} to ${recipient}`,
                ui: confirmationUI,
              },
            ],
          });

          return confirmationUI;
        },
      },

      general_response: {
        description: functions.general_response.description,
        parameters: functions.general_response.parameters,
        generate: async function* ({ response }) {
          yield (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-600">Thinking...</p>
              </div>
            </div>
          );

          // Simulate thinking delay
          await new Promise(resolve => setTimeout(resolve, 500));

          const responseUI = (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm leading-relaxed text-gray-900">{response}</p>
            </div>
          );

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: Date.now().toString(),
                role: 'assistant',
                content: response,
                ui: responseUI,
              },
            ],
          });

          return responseUI;
        },
      },
    },
  });

  return {
    id: Date.now().toString(),
    display: result.value,
  };
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
        ui: display,
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