import { getAllBlogPosts } from '@/lib/markdown';
import { getActiveTheme } from '@/lib/config';
import BlogCard from '@/components/BlogCard';
import styles from '@/styles/Blog.module.css';

export default async function BlogPage() {
  const posts = await getAllBlogPosts();
  const theme = getActiveTheme();
  const hasSidebar = theme.structure.layout.type.includes('sidebar');

  return (
    <div className={styles.blogList}>
      <h1>Blog</h1>
      <div className={`${styles.posts} ${hasSidebar ? styles.postsWithSidebar : ''}`}>
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
