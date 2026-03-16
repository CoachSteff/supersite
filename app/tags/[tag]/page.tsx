import Link from 'next/link';
import { getAllTags, getContentByTag } from '@/lib/markdown';
import { getSiteConfig } from '@/lib/config';
import BlogCard from '@/components/BlogCard';
import type { Metadata } from 'next';
import styles from '@/styles/Tags.module.css';

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map(({ tag }) => ({ tag }));
}

export async function generateMetadata({ params }: { params: { tag: string } }): Promise<Metadata> {
  const config = getSiteConfig();
  const siteUrl = config.site.url;
  const tag = decodeURIComponent(params.tag);

  return {
    title: `#${tag} — ${config.site.name}`,
    description: `All content tagged with #${tag} on ${config.site.name}`,
    alternates: {
      canonical: `${siteUrl}/tags/${tag}`,
    },
  };
}

export default async function TagPage({ params }: { params: { tag: string } }) {
  const tag = decodeURIComponent(params.tag);
  const { posts, pages } = await getContentByTag(tag);
  const totalCount = posts.length + pages.length;

  return (
    <div className={styles.tagsPage}>
      <header className={styles.tagHeader}>
        <Link href="/tags" className={styles.backLink}>&larr; All tags</Link>
        <h1>#{tag}</h1>
        <p className={styles.intro}>
          {totalCount} {totalCount === 1 ? 'item' : 'items'} tagged with <strong>#{tag}</strong>
        </p>
      </header>

      {posts.length > 0 && (
        <section>
          <h2>Blog Posts</h2>
          <div className={styles.contentList}>
            {posts.map(post => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {pages.length > 0 && (
        <section>
          <h2>Pages</h2>
          <div className={styles.contentList}>
            {pages.map(page => (
              <article key={page.slug} className={styles.pageItem}>
                <h3>
                  <Link href={page.path}>{page.title}</Link>
                </h3>
                {page.description && <p>{page.description}</p>}
                {page.tags && page.tags.length > 0 && (
                  <div className={styles.pageTags}>
                    {page.tags.map(t => (
                      <Link key={t} href={`/tags/${t}`} className={styles.pageTag}>#{t}</Link>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {totalCount === 0 && (
        <p>No content found with this tag.</p>
      )}
    </div>
  );
}
