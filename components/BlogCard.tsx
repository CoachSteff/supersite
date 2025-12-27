import Link from 'next/link';
import { ArrowRight, Calendar, Tag } from 'lucide-react';
import type { BlogPost } from '@/lib/markdown';
import styles from '@/styles/Blog.module.css';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className={styles.blogCard}>
      <h2>
        <Link href={post.path}>{post.title}</Link>
      </h2>
      {post.date && (
        <time dateTime={post.date} className={styles.date}>
          <Calendar size={16} />
          {new Date(post.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </time>
      )}
      {post.description && <p>{post.description}</p>}
      {post.tags && post.tags.length > 0 && (
        <div className={styles.tags}>
          {post.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              <Tag size={12} />
              {tag}
            </span>
          ))}
        </div>
      )}
      <Link href={post.path} className={styles.readMore}>
        Read more <ArrowRight size={16} />
      </Link>
    </article>
  );
}
