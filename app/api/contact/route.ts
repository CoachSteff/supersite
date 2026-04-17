import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().email().max(320),
  message: z.string().trim().min(1).max(5000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { name, email, message } = parsed.data;

    // JSON-line log format — no CRLF/log-injection risk, easy to parse.
    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      name,
      email,
      message,
    }) + '\n';

    const logPath = path.join(process.cwd(), 'contact-submissions.log');
    await fs.appendFile(logPath, entry, 'utf-8');

    return NextResponse.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}
