import { google } from '@ai-sdk/google';
import { streamText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    // model: openai("gpt-4o"),
    model: google('gemini-2.5-flash'),
    system:
      "reply messages like you are a pirate",
    messages,
  });

  return result.toDataStreamResponse();
}
