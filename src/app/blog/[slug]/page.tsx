import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/markdown';
import MarkdownContent from '@/components/MarkdownContent';
import { notFound } from 'next/navigation';
import styles from '@/styles/Blog.module.css';

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className={styles.blogPost}>
      <header className={styles.postHeader}>
        <h1>{post.title}</h1>
        <div className={styles.postMeta}>
          {post.date && <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>}
          {post.author && <span className={styles.author}>By {post.author}</span>}
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className={styles.tags}>
            {post.tags.map((tag) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}
      </header>
      <MarkdownContent 
        title={post.title}
        content={post.content}
        markdown={post.markdown}
        path={post.path}
      />
    </article>
  );
}
