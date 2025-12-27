import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Ollama } from 'ollama';
import type { SiteConfig } from './config';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  error?: string;
}

export interface AIProvider {
  chat(messages: AIMessage[], systemPrompt: string, context: string): Promise<AIResponse>;
}

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: SiteConfig) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not found in environment variables');
    }

    this.client = new Anthropic({ apiKey });
    this.model = config.chat.model;
    this.temperature = config.chat.temperature;
    this.maxTokens = config.chat.maxTokens;
  }

  async chat(messages: AIMessage[], systemPrompt: string, context: string): Promise<AIResponse> {
    try {
      const fullSystemPrompt = `${systemPrompt}\n\n${context}`;

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: fullSystemPrompt,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return { content: content.text };
      }

      return { content: '', error: 'Unexpected response type' };
    } catch (error) {
      console.error('Anthropic API error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: SiteConfig) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not found in environment variables');
    }

    this.client = new OpenAI({ apiKey });
    this.model = config.chat.model || 'gpt-4-turbo-preview';
    this.temperature = config.chat.temperature;
    this.maxTokens = config.chat.maxTokens;
  }

  async chat(messages: AIMessage[], systemPrompt: string, context: string): Promise<AIResponse> {
    try {
      const fullSystemPrompt = `${systemPrompt}\n\n${context}`;

      const response = await this.client.chat.completions.create({
        model: this.model,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        messages: [
          { role: 'system', content: fullSystemPrompt },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        ],
      });

      return {
        content: response.choices[0]?.message?.content || '',
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: SiteConfig) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    this.client = new GoogleGenerativeAI(apiKey);
    this.model = config.chat.model || 'gemini-pro';
    this.temperature = config.chat.temperature;
    this.maxTokens = config.chat.maxTokens;
  }

  async chat(messages: AIMessage[], systemPrompt: string, context: string): Promise<AIResponse> {
    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      
      const fullPrompt = `${systemPrompt}\n\n${context}\n\nConversation:\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: this.temperature,
          maxOutputTokens: this.maxTokens,
        },
      });

      const response = result.response;
      return {
        content: response.text(),
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export class OllamaProvider implements AIProvider {
  private client: Ollama;
  private model: string;
  private temperature: number;

  constructor(config: SiteConfig) {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    
    this.client = new Ollama({ host: baseUrl });
    this.model = config.chat.model || 'llama2';
    this.temperature = config.chat.temperature;
  }

  async chat(messages: AIMessage[], systemPrompt: string, context: string): Promise<AIResponse> {
    try {
      const fullSystemPrompt = `${systemPrompt}\n\n${context}`;

      const response = await this.client.chat({
        model: this.model,
        messages: [
          { role: 'system', content: fullSystemPrompt },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        ],
        options: {
          temperature: this.temperature,
        },
      });

      return {
        content: response.message.content,
      };
    } catch (error) {
      console.error('Ollama API error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export function getProvider(config: SiteConfig): AIProvider {
  switch (config.chat.provider) {
    case 'anthropic':
      return new AnthropicProvider(config);
    case 'openai':
      return new OpenAIProvider(config);
    case 'gemini':
      return new GeminiProvider(config);
    case 'ollama':
      return new OllamaProvider(config);
    default:
      throw new Error(`Unknown AI provider: ${config.chat.provider}`);
  }
}
