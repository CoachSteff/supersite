'use client';

import { useMemo, useState } from 'react';
import yaml from 'js-yaml';
import { z } from 'zod';
import styles from '@/styles/Contact.module.css';

const fieldSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['text', 'email', 'tel', 'url', 'number', 'select', 'textarea']).default('text'),
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
});

const formSchema = z.object({
  fields: z.array(fieldSchema).min(1),
  submit: z.string().default('Send'),
  endpoint: z.string().optional(),
});

type FormSpec = z.infer<typeof formSchema>;

interface SchemaFormProps {
  source: string;
}

export default function SchemaForm({ source }: SchemaFormProps) {
  const parsed = useMemo<FormSpec | { error: string }>(() => {
    try {
      const raw = yaml.load(source);
      const result = formSchema.safeParse(raw);
      if (!result.success) {
        return { error: result.error.issues[0]?.message ?? 'Invalid form schema' };
      }
      return result.data;
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Invalid YAML' };
    }
  }, [source]);

  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if ('error' in parsed) {
    return (
      <div className={styles.errorMessage}>
        Form schema error: {parsed.error}
      </div>
    );
  }

  const spec = parsed;

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    const endpoint =
      spec.endpoint ||
      (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FORM_ENDPOINT) ||
      '/api/form/submit';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: values }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setStatus('success');
        setValues({});
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to send message');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Failed to send message. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {spec.fields.map((field) => {
        const id = `schema-form-${field.name}`;
        const value = values[field.name] ?? '';
        return (
          <div key={field.name} className={styles.formGroup}>
            <label htmlFor={id}>
              {field.label}
              {field.required ? ' *' : ''}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={id}
                rows={6}
                required={field.required}
                placeholder={field.placeholder}
                value={value}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            ) : field.type === 'select' ? (
              <select
                id={id}
                required={field.required}
                value={value}
                onChange={(e) => handleChange(field.name, e.target.value)}
              >
                <option value="" disabled>
                  {field.placeholder || 'Choose one…'}
                </option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={id}
                type={field.type}
                required={field.required}
                placeholder={field.placeholder}
                value={value}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            )}
          </div>
        );
      })}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className={styles.submitButton}
      >
        {status === 'submitting' ? 'Sending…' : spec.submit}
      </button>

      {status === 'success' && (
        <div className={styles.successMessage}>
          Thanks — your message is on its way.
        </div>
      )}

      {status === 'error' && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}
    </form>
  );
}
