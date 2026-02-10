import { headers } from 'next/headers';
import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/markdown';
import { translateBlogPost } from '@/lib/translation-service';
import { getSiteConfig } from '@/lib/config';
import MarkdownContent from '@/components/MarkdownContent';
import PageActions from '@/components/PageActions';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import styles from '@/styles/Blog.module.css';

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);
  
  if (!post) {
    return {};
  }

  const config = getSiteConfig();
  const siteUrl = config.site.url;
  const currentPath = `/blog/${params.slug}`;
  const supportedLanguages = config.multilingual?.supportedLanguages || ['en'];
  
  // Generate hreflang links
  const languages: Record<string, string> = {};
  supportedLanguages.forEach((lang) => {
    const langPath = lang === 'en' ? currentPath : `/${lang}${currentPath}`;
    languages[lang] = `${siteUrl}${langPath}`;
  });
  
  return {
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.description,
    alternates: {
      canonical: `${siteUrl}${currentPath}`,
      languages,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const headersList = headers();
  const language = headersList.get('x-supersite-lang') || 'en';
  
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Translate if needed
  let translatedPost = post;
  if (language !== 'en') {
    try {
      translatedPost = await translateBlogPost(post, language);
    } catch (error) {
      console.error('Translation error:', error);
      // Fall back to original content on error
    }
  }

  return (
    <article className={styles.blogPost}>
      <header className={styles.postHeader}>
        <h1>{translatedPost.title}</h1>
        <div className={styles.postMeta}>
          {translatedPost.date && <time dateTime={translatedPost.date}>{new Date(translatedPost.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>}
          {translatedPost.author && <span className={styles.author}>By {translatedPost.author}</span>}
        </div>
        {translatedPost.tags && translatedPost.tags.length > 0 && (
          <div className={styles.tags}>
            {translatedPost.tags.map((tag) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}
      </header>
      <MarkdownContent 
        title={translatedPost.title}
        content={translatedPost.content}
        markdown={translatedPost.markdown}
        path={translatedPost.path}
      />
      <PageActions 
        title={translatedPost.title}
        markdown={translatedPost.markdown || ''}
        path={translatedPost.path}
        url={`/blog/${params.slug}`}
      />
    </article>
  );
}
