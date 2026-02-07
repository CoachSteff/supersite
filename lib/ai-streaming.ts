import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Ollama } from 'ollama';
import type { SiteConfig } from './config';

export interface StreamingMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: Error) => void;
}

export interface StreamingProvider {
  streamChat(
    messages: StreamingMessage[],
    systemPrompt: string,
    context: string,
    callbacks: StreamCallbacks
  ): Promise<void>;
}

export class AnthropicStreamingProvider implements StreamingProvider {
  private client: Anthropic;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: SiteConfig) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not found');
    }
    this.client = new Anthropic({ apiKey });
    this.model = config.chat.model;
    this.temperature = config.chat.temperature;
    this.maxTokens = config.chat.maxTokens;
  }

  async streamChat(
    messages: StreamingMessage[],
    systemPrompt: string,
    context: string,
    callbacks: StreamCallbacks
  ): Promise<void> {
    try {
      const fullSystemPrompt = `${systemPrompt}\n\n${context}`;
      let fullText = '';

      const stream = await this.client.messages.stream({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: fullSystemPrompt,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          const token = event.delta.text;
          fullText += token;
          callbacks.onToken(token);
        }
      }

      callbacks.onComplete(fullText);
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}

export class OpenAIStreamingProvider implements StreamingProvider {
  private client: OpenAI;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: SiteConfig) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not found');
    }
    this.client = new OpenAI({ apiKey });
    this.model = config.chat.model || 'gpt-4-turbo-preview';
    this.temperature = config.chat.temperature;
    this.maxTokens = config.chat.maxTokens;
  }

  async streamChat(
    messages: StreamingMessage[],
    systemPrompt: string,
    context: string,
    callbacks: StreamCallbacks
  ): Promise<void> {
    try {
      const fullSystemPrompt = `${systemPrompt}\n\n${context}`;
      let fullText = '';

      const stream = await this.client.chat.completions.create({
        model: this.model,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        stream: true,
        messages: [
          { role: 'system', content: fullSystemPrompt },
          ...messages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
        ],
      });

      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content || '';
        if (token) {
          fullText += token;
          callbacks.onToken(token);
        }
      }

      callbacks.onComplete(fullText);
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}

export class GeminiStreamingProvider implements StreamingProvider {
  private client: GoogleGenerativeAI;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: SiteConfig) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found');
    }
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = config.chat.model || 'gemini-pro';
    this.temperature = config.chat.temperature;
    this.maxTokens = config.chat.maxTokens;
  }

  async streamChat(
    messages: StreamingMessage[],
    systemPrompt: string,
    context: string,
    callbacks: StreamCallbacks
  ): Promise<void> {
    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      
      const fullPrompt = `${systemPrompt}\n\n${context}\n\nConversation:\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nassistant:`;
      let fullText = '';

      const result = await model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: this.temperature,
          maxOutputTokens: this.maxTokens,
        },
      });

      for await (const chunk of result.stream) {
        const token = chunk.text();
        if (token) {
          fullText += token;
          callbacks.onToken(token);
        }
      }

      callbacks.onComplete(fullText);
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}

export class OllamaStreamingProvider implements StreamingProvider {
  private client: Ollama;
  private model: string;
  private temperature: number;

  constructor(config: SiteConfig) {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.client = new Ollama({ host: baseUrl });
    this.model = config.chat.model || 'llama2';
    this.temperature = config.chat.temperature;
  }

  async streamChat(
    messages: StreamingMessage[],
    systemPrompt: string,
    context: string,
    callbacks: StreamCallbacks
  ): Promise<void> {
    try {
      const fullSystemPrompt = `${systemPrompt}\n\n${context}`;
      let fullText = '';

      const response = await this.client.chat({
        model: this.model,
        stream: true,
        messages: [
          { role: 'system', content: fullSystemPrompt },
          ...messages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
        ],
        options: {
          temperature: this.temperature,
        },
      });

      for await (const part of response) {
        const token = part.message.content;
        if (token) {
          fullText += token;
          callbacks.onToken(token);
        }
      }

      callbacks.onComplete(fullText);
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}

export function getStreamingProvider(config: SiteConfig): StreamingProvider {
  switch (config.chat.provider) {
    case 'anthropic':
      return new AnthropicStreamingProvider(config);
    case 'openai':
      return new OpenAIStreamingProvider(config);
    case 'gemini':
      return new GeminiStreamingProvider(config);
    case 'ollama':
      return new OllamaStreamingProvider(config);
    default:
      throw new Error(`Unknown AI provider: ${config.chat.provider}`);
  }
}
