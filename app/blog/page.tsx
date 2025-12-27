import { getAllBlogPosts } from '@/lib/markdown';
import BlogCard from '@/components/BlogCard';
import styles from '@/styles/Blog.module.css';

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className={styles.blogList}>
      <h1>Blog</h1>
      <div className={styles.posts}>
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
