import { NextRequest, NextResponse } from 'next/server';
import { getSiteConfig } from '@/lib/config';
import { getStreamingProvider, StreamingMessage } from '@/lib/ai-streaming';
import { buildContext, truncateContext } from '@/lib/context-builder';
import { AI_ACTIONS_PROMPT } from '@/lib/ai-actions';
import { getBrowserLanguage, determineResponseLanguage } from '@/lib/language-detector';
import { getLanguageName } from '@/lib/translation-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 256 * 1024; // 256 KB

export async function POST(request: NextRequest) {
  // Reject oversized bodies early
  const contentLength = request.headers.get('content-length');
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
  }

  // Validate request body *before* opening a stream, so failures return proper HTTP codes.
  let messages: StreamingMessage[];
  let currentLanguage: string | undefined;
  try {
    const body = await request.json();
    messages = body?.messages;
    currentLanguage = body?.currentLanguage;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
  }

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== 'user') {
    return NextResponse.json({ error: 'Last message must be from user' }, { status: 400 });
  }

  const config = getSiteConfig();
  if (!config.chat.enabled) {
    return NextResponse.json({ error: 'Chat feature is disabled' }, { status: 503 });
  }

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const sendEvent = async (event: string, data: unknown) => {
    await writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
  };

  (async () => {
    try {
      // Build context for AI
      const context = await buildContext(lastMessage.content);
      const truncatedContext = truncateContext(context);

      // Detect language from user message and browser preference
      const browserLang = getBrowserLanguage(request.headers.get('accept-language') || '');
      const detectedLang = determineResponseLanguage(lastMessage.content, browserLang);

      // Build system prompt with language instruction
      const languageInstruction = `\n\nIMPORTANT: Respond in the same language as the user's message. The user is communicating in ${detectedLang}. Match their language exactly and maintain a friendly, helpful tone.`;
      
      let systemPrompt = config.chat.systemPrompt + languageInstruction;
      
      // Add multilingual context note if user is viewing translated content
      if (currentLanguage && currentLanguage !== 'en') {
        const langName = getLanguageName(currentLanguage);
        systemPrompt += `\n\nNote: The user is currently viewing this website in ${langName}. The content they see is AI-translated from English. If they ask about page content, be aware that the original source content is in English.`;
      }
      
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
