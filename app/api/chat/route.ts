import { google } from '@ai-sdk/google';
import { streamText, generateText } from "ai";

// export async function POST(req: Request) {
//   const { messages } = await req.json();
//
//   const result = streamText({
//     // model: openai("gpt-4o"),
//     model: google('gemini-2.5-flash'),
//     system:
//       "reply messages like you are a pirate",
//     messages,
//   });
//
//   return result.toDataStreamResponse();
// }

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Add multiple AI responses to conversation history
  const messagesWithAIHistory = [
    ...messages,
    {
      role: 'assistant',
      content: 'I understand your question. Let me break this down:'
    },
    {
      role: 'assistant',
      content: 'First, consider the technical aspects...'
    }
  ];

  const { text } = await generateText({
    model: google('gemini-2.5-flash'),
    messages: messagesWithAIHistory,
  });

  return new Response(JSON.stringify({
    role: 'assistant',
    content: text
  }));
}
