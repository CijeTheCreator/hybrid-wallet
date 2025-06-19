import { GoogleGenerativeAI } from '@google/generative-ai';
import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { ReactNode } from 'react';
import { z } from 'zod';
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

// Intent detection schema
const SendIntentSchema = z.object({
  intent: z.literal('send'),
  amount: z.number().optional(),
  currency: z.string().optional(),
  recipient: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

const GeneralIntentSchema = z.object({
  intent: z.enum(['general', 'help', 'balance', 'history', 'other']),
  confidence: z.number().min(0).max(1),
});

type Intent = z.infer<typeof SendIntentSchema> | z.infer<typeof GeneralIntentSchema>;

// Intent detection function
async function detectIntent(message: string): Promise<Intent> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const prompt = `
    Analyze the following user message and determine the intent. 
    If the user wants to send cryptocurrency or money, respond with intent "send".
    Otherwise, classify as one of: general, help, balance, history, other.
    
    Also extract any mentioned amount, currency, and recipient if present.
    Provide a confidence score between 0 and 1.
    
    User message: "${message}"
    
    Respond with a JSON object in this format:
    {
      "intent": "send" | "general" | "help" | "balance" | "history" | "other",
      "amount": number (optional, only for send intent),
      "currency": string (optional, only for send intent),
      "recipient": string (optional, only for send intent),
      "confidence": number
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const parsed = JSON.parse(text);
    
    if (parsed.intent === 'send') {
      return SendIntentSchema.parse(parsed);
    } else {
      return GeneralIntentSchema.parse(parsed);
    }
  } catch (error) {
    console.error('Intent detection error:', error);
    // Fallback to simple keyword detection
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('send') || lowerMessage.includes('transfer') || lowerMessage.includes('pay')) {
      return { intent: 'send', confidence: 0.7 };
    }
    return { intent: 'general', confidence: 0.5 };
  }
}

// Generate AI response
async function generateResponse(message: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const prompt = `
    You are a helpful cryptocurrency wallet assistant. 
    Respond to the user's message in a friendly and informative way.
    Keep responses concise and relevant to cryptocurrency and wallet operations.
    
    User message: "${message}"
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Response generation error:', error);
    return "I'm here to help with your cryptocurrency wallet. How can I assist you today?";
  }
}

// Main AI action
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

  // Detect intent
  const intent = await detectIntent(content);
  
  let display: ReactNode;
  let assistantMessage: string;

  if (intent.intent === 'send' && intent.confidence > 0.6) {
    // Generate sending confirmation UI
    display = (
      <SendingConfirmationUI
        amount={intent.amount}
        currency={intent.currency}
        recipient={intent.recipient}
        originalMessage={content}
      />
    );
    assistantMessage = 'I can help you send cryptocurrency. Please confirm the transaction details.';
  } else {
    // Generate regular text response
    assistantMessage = await generateResponse(content);
    display = (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-sm leading-relaxed text-gray-900">{assistantMessage}</p>
      </div>
    );
  }

  // Add assistant message to AI state
  aiState.done({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: Date.now().toString() + '_assistant',
        role: 'assistant',
        content: assistantMessage,
        ui: display,
      },
    ],
  });

  return {
    id: Date.now().toString(),
    display,
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