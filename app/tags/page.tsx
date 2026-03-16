import Link from 'next/link';
import { getAllTags } from '@/lib/markdown';
import { getSiteConfig } from '@/lib/config';
import type { Metadata } from 'next';
import styles from '@/styles/Tags.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const config = getSiteConfig();
  const siteUrl = config.site.url;

  return {
    title: `Tags — ${config.site.name}`,
    description: `Browse all topics and tags on ${config.site.name}`,
    alternates: {
      canonical: `${siteUrl}/tags`,
    },
  };
}

export default async function TagsPage() {
  const tags = await getAllTags();

  if (tags.length === 0) {
    return (
      <div className={styles.tagsPage}>
        <h1>Tags</h1>
        <p>No tags found yet.</p>
      </div>
    );
  }

  // Calculate relative sizes for tag cloud
  const maxCount = Math.max(...tags.map(t => t.count));
  const minCount = Math.min(...tags.map(t => t.count));

  return (
    <div className={styles.tagsPage}>
      <h1>Tags</h1>
      <p className={styles.intro}>Browse all topics across the site.</p>
      <div className={styles.tagCloud}>
        {tags.map(({ tag, count }) => {
          // Scale font size between 1rem and 2.2rem based on count
          const scale = maxCount === minCount
            ? 0.5
            : (count - minCount) / (maxCount - minCount);
          const fontSize = 1 + scale * 1.2;

          return (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className={styles.tagLink}
              style={{ fontSize: `${fontSize}rem` }}
            >
              #{tag}
              <span className={styles.tagCount}>{count}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
