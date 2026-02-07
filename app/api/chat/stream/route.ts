import { NextRequest } from 'next/server';
import { getSiteConfig } from '@/lib/config';
import { getStreamingProvider, StreamingMessage } from '@/lib/ai-streaming';
import { buildContext, truncateContext } from '@/lib/context-builder';
import { AI_ACTIONS_PROMPT } from '@/lib/ai-actions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const sendEvent = async (event: string, data: unknown) => {
    await writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
  };

  (async () => {
    try {
      const body = await request.json();
      const { messages } = body;

      if (!messages || !Array.isArray(messages)) {
        await sendEvent('error', { error: 'Messages array is required' });
        await writer.close();
        return;
      }

      const config = getSiteConfig();

      if (!config.chat.enabled) {
        await sendEvent('error', { error: 'Chat feature is disabled' });
        await writer.close();
        return;
      }

      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || lastMessage.role !== 'user') {
        await sendEvent('error', { error: 'Last message must be from user' });
        await writer.close();
        return;
      }

      // Build context for AI
      const context = await buildContext(lastMessage.content);
      const truncatedContext = truncateContext(context);

      // Build system prompt with actions if enabled
      let systemPrompt = config.chat.systemPrompt;
      if (config.chat.actions?.enabled) {
        systemPrompt += '\n\n' + AI_ACTIONS_PROMPT;
      }

      // Get streaming provider
      const provider = getStreamingProvider(config);

      // Stream the response
      await provider.streamChat(
        messages as StreamingMessage[],
        systemPrompt,
        truncatedContext,
        {
          onToken: async (token: string) => {
            await sendEvent('token', { token });
          },
          onComplete: async (fullText: string) => {
            await sendEvent('complete', { 
              content: fullText,
              timestamp: new Date().toISOString()
            });
            await writer.close();
          },
          onError: async (error: Error) => {
            console.error('Streaming error:', error);
            await sendEvent('error', { error: error.message });
            await writer.close();
          },
        }
      );
    } catch (error) {
      console.error('Chat stream API error:', error);
      await sendEvent('error', { error: 'Internal server error' });
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
