import type { SiteConfig } from '@/lib/config';

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function buildWebSiteSchema(config: SiteConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.site.name,
    url: config.site.url,
    description: config.seo.defaultDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${config.site.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildOrganizationSchema(config: SiteConfig) {
  const sameAs: string[] = [];
  if (config.social?.twitter) sameAs.push(config.social.twitter);
  if (config.social?.linkedin) sameAs.push(config.social.linkedin);
  if (config.social?.github) sameAs.push(config.social.github);
  if (config.social?.youtube) sameAs.push(config.social.youtube);
  if (config.social?.instagram) sameAs.push(config.social.instagram);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: config.site.name,
    url: config.site.url,
    logo: config.site.logo ? `${config.site.url}${config.site.logo}` : undefined,
    description: config.seo.defaultDescription,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function buildPersonSchema(config: SiteConfig) {
  const sameAs: string[] = [];
  if (config.social?.twitter) sameAs.push(config.social.twitter);
  if (config.social?.linkedin) sameAs.push(config.social.linkedin);
  if (config.social?.github) sameAs.push(config.social.github);
  if (config.social?.youtube) sameAs.push(config.social.youtube);
  if (config.social?.instagram) sameAs.push(config.social.instagram);

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: config.profile?.name || config.site.name,
    url: config.site.url,
    ...(config.profile?.title ? { jobTitle: config.profile.title } : {}),
    ...(config.profile?.bio ? { description: config.profile.bio } : {}),
    ...(config.profile?.image ? { image: `${config.site.url}${config.profile.image}` } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function buildArticleSchema(
  post: {
    title: string;
    description?: string;
    date: string;
    author?: string;
    tags?: string[];
    path: string;
  },
  config: SiteConfig,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    ...(post.description ? { description: post.description } : {}),
    datePublished: post.date,
    url: `${config.site.url}${post.path}`,
    ...(post.author
      ? {
          author: {
            '@type': 'Person',
            name: post.author,
          },
        }
      : {}),
    ...(post.tags && post.tags.length > 0 ? { keywords: post.tags.join(', ') } : {}),
    publisher: {
      '@type': 'Organization',
      name: config.site.name,
      url: config.site.url,
    },
  };
}

export function buildBreadcrumbSchema(
  items: { name: string; url: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildFAQSchema(
  questions: { question: string; answer: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}
