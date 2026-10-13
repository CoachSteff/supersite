import { headers } from 'next/headers';
import { getPageBySlug } from '@/lib/markdown';
import { translatePageContent } from '@/lib/translation-service';
import { getSiteConfig, getActiveTheme } from '@/lib/config';
import MarkdownContent from '@/components/MarkdownContent';
import PageShell from '@/components/PageShell';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug([]);
  
  if (!page) {
    return {};
  }

  const config = getSiteConfig();
  const siteUrl = config.site.url;
  const supportedLanguages = config.multilingual?.supportedLanguages || ['en'];
  
  // Generate hreflang links for homepage
  const languages: Record<string, string> = {};
  supportedLanguages.forEach((lang) => {
    const langPath = lang === 'en' ? '/' : `/${lang}`;
    languages[lang] = `${siteUrl}${langPath}`;
  });
  
  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description || page.description,
    alternates: {
      canonical: siteUrl,
      languages,
    },
  };
}

export default async function HomePage() {
  const headersList = headers();
  const language = headersList.get('x-supersite-lang') || 'en';
  const config = getSiteConfig();
  
  const page = await getPageBySlug([]);
  
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

  const theme = getActiveTheme();

  // The home route implicitly binds to the `home` page-type when the page
  // content doesn't declare its own. Frontmatter still wins if set.
  const homePage = { ...translatedPage, pageType: translatedPage.pageType ?? 'home' };

  return (
    <PageShell theme={theme} page={homePage}>
      <MarkdownContent
        title={translatedPage.title}
        content={translatedPage.content}
        markdown={translatedPage.markdown}
        path={translatedPage.path}
        siteUrl={config.site.url}
      />
    </PageShell>
  );
}
