import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { tools } from '@/ai/tools';

export async function POST(request: Request) {
  const { messages } = await request.json();

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: `You are a helpful cryptocurrency wallet assistant. You can help users with:
    - Sending cryptocurrency to other users or addresses
    - Checking wallet balances and portfolio information
    - Swapping between different cryptocurrencies
    - Explaining crypto concepts and providing guidance
    
    When users want to send crypto, use the sendCryptocurrency tool.
    When users ask about balances or wallet info, use the getWalletInfo tool.
    When users want to swap currencies, use the swapCryptocurrency tool.
    
    Be conversational and helpful. Always confirm transaction details before processing.`,
    messages,
    maxSteps: 5,
    tools,
  });

  return result.toDataStreamResponse();
}
