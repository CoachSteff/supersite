'use client';

import { useMemo } from 'react';
import yaml from 'js-yaml';
import { z } from 'zod';
import styles from '@/styles/PartnershipLogos.module.css';

const partnerSchema = z.object({
  name: z.string().min(1),
  href: z.string().optional(),
  logo: z.string().optional(),
});

const logosSchema = z.array(partnerSchema).min(1);

type Partner = z.infer<typeof partnerSchema>;

interface PartnershipLogosProps {
  source: string;
}

export default function PartnershipLogos({ source }: PartnershipLogosProps) {
  const partners = useMemo<Partner[] | { error: string }>(() => {
    try {
      const raw = yaml.load(source);
      const result = logosSchema.safeParse(raw);
      if (!result.success) {
        return { error: result.error.issues[0]?.message ?? 'Invalid logos schema' };
      }
      return result.data;
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Invalid YAML' };
    }
  }, [source]);

  if ('error' in partners) {
    return <div className={styles.error}>Logos schema error: {partners.error}</div>;
  }

  return (
    <div className={styles.grid}>
      {partners.map((partner) => {
        const content = partner.logo ? (
          <img
            src={partner.logo}
            alt={partner.name}
            loading="lazy"
            className={styles.logo}
          />
        ) : (
          <span className={styles.fallback}>{partner.name}</span>
        );

        if (partner.href) {
          return (
            <a
              key={partner.name}
              href={partner.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={partner.name}
              className={styles.item}
            >
              {content}
            </a>
          );
        }

        return (
          <div key={partner.name} aria-label={partner.name} className={styles.item}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
