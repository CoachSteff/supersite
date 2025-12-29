import { NextRequest, NextResponse } from 'next/server';
import { getSiteConfig } from '@/lib/config';
import { getProvider, AIMessage } from '@/lib/ai-providers';
import { buildContext, truncateContext } from '@/lib/context-builder';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const config = getSiteConfig();

    if (!config.chat.enabled) {
      return NextResponse.json(
        { error: 'Chat feature is disabled' },
        { status: 403 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'Last message must be from user' },
        { status: 400 }
      );
    }

    const context = await buildContext(lastMessage.content);
    const truncatedContext = truncateContext(context);

    const provider = getProvider(config);
    const response = await provider.chat(
      messages as AIMessage[],
      config.chat.systemPrompt,
      truncatedContext
    );

    if (response.error) {
      console.error('AI Provider error:', response.error);
      return NextResponse.json(
        { error: 'Failed to get response from AI provider' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      content: response.content,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
