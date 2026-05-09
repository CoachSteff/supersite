import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';

const MAX_FIELD_LENGTH = 5000;
const MAX_FIELDS = 50;

const submissionSchema = z.object({
  fields: z
    .record(z.string(), z.string().max(MAX_FIELD_LENGTH))
    .refine((obj) => Object.keys(obj).length > 0, 'At least one field required')
    .refine(
      (obj) => Object.keys(obj).length <= MAX_FIELDS,
      `Submission exceeds ${MAX_FIELDS} fields`,
    ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = submissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || 'Invalid input' },
        { status: 400 },
      );
    }

    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      fields: parsed.data.fields,
    }) + '\n';

    const logPath = path.join(process.cwd(), 'form-submissions.log');
    await fs.appendFile(logPath, entry, 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 },
    );
  }
}
