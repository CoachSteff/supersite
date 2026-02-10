import { headers } from 'next/headers';
import { getPageBySlug, getAllPages } from '@/lib/markdown';
import { translatePageContent } from '@/lib/translation-service';
import { getSiteConfig } from '@/lib/config';
import MarkdownContent from '@/components/MarkdownContent';
import PageActions from '@/components/PageActions';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const pages = await getAllPages();
  
  // Only generate English routes for static pre-rendering
  // Non-English routes will be handled on-demand via middleware rewrite
  return pages
    .filter(page => page.slug !== 'home')
    .map((page) => ({
      slug: page.slug.split('/'),
    }));
}

export async function generateMetadata({ params }: { params: { slug: string[] } }): Promise<Metadata> {
  const page = await getPageBySlug(params.slug);
  
  if (!page) {
    return {};
  }

  const config = getSiteConfig();
  const siteUrl = config.site.url;
  const currentPath = '/' + params.slug.join('/');
  const supportedLanguages = config.multilingual?.supportedLanguages || ['en'];
  
  // Generate hreflang links
  const languages: Record<string, string> = {};
  supportedLanguages.forEach((lang) => {
    const langPath = lang === 'en' ? currentPath : `/${lang}${currentPath}`;
    languages[lang] = `${siteUrl}${langPath}`;
  });
  
  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description || page.description,
    alternates: {
      canonical: `${siteUrl}${currentPath}`,
      languages,
    },
  };
}

export default async function Page({ params }: { params: { slug: string[] } }) {
  const headersList = headers();
  const language = headersList.get('x-supersite-lang') || 'en';
  
  const page = await getPageBySlug(params.slug);

  if (!page) {
    notFound();
  }

  // Translate if needed
  let translatedPage = page;
  if (language !== 'en') {
    try {
      translatedPage = await translatePageContent(page, language);
    } catch (error) {
      console.error('Translation error:', error);
      // Fall back to original content on error
    }
  }

  return (
    <>
      <MarkdownContent 
        title={translatedPage.title} 
        content={translatedPage.content}
        markdown={translatedPage.markdown}
        path={translatedPage.path}
      />
      <PageActions 
        title={translatedPage.title}
        markdown={translatedPage.markdown || ''}
        path={translatedPage.path}
        url={`/${params.slug.join('/')}`}
      />
    </>
  );
}
