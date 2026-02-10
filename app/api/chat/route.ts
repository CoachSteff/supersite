import { NextRequest, NextResponse } from 'next/server';
import { getSiteConfig } from '@/lib/config';
import { getProvider, AIMessage } from '@/lib/ai-providers';
import { buildContext, truncateContext } from '@/lib/context-builder';
import { getBrowserLanguage, determineResponseLanguage } from '@/lib/language-detector';
import { getLanguageName } from '@/lib/translation-service';
import { AI_ACTIONS_PROMPT } from '@/lib/ai-actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, currentLanguage } = body;

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

    const provider = getProvider(config);
    const response = await provider.chat(
      messages as AIMessage[],
      systemPrompt,
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
