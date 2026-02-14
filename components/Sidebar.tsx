'use client';

import { useState, useEffect } from 'react';
import { Search, Mail, Twitter, Github, Linkedin, Youtube, Instagram } from 'lucide-react';
import type { SidebarWidget } from '@/lib/theme-system';
import styles from '@/styles/Sidebar.module.css';

interface SidebarProps {
  widgets: SidebarWidget[];
  categories?: { category: string; count: number }[];
  tags?: { tag: string; count: number }[];
  recentPosts?: { slug: string; title: string; date: string }[];
  socialLinks?: { twitter?: string; github?: string; linkedin?: string; youtube?: string; instagram?: string };
}

export default function Sidebar({ widgets, categories, tags, recentPosts, socialLinks }: SidebarProps) {
  if (widgets.length === 0) {
    return null;
  }

  return (
    <div className={styles.sidebar}>
      {widgets.map((widget, index) => (
        <SidebarWidgetRenderer 
          key={`${widget.type}-${index}`} 
          widget={widget}
          categories={categories}
          tags={tags}
          recentPosts={recentPosts}
          socialLinks={socialLinks}
        />
      ))}
    </div>
  );
}

function SidebarWidgetRenderer({ 
  widget, 
  categories, 
  tags, 
  recentPosts,
  socialLinks 
}: { 
  widget: SidebarWidget;
  categories?: { category: string; count: number }[];
  tags?: { tag: string; count: number }[];
  recentPosts?: { slug: string; title: string; date: string }[];
  socialLinks?: { twitter?: string; github?: string; linkedin?: string; youtube?: string; instagram?: string };
}) {
  switch (widget.type) {
    case 'search':
      return <SearchWidget />;
    case 'about':
      return <AboutWidget title={widget.title} content={widget.content} image={widget.image} />;
    case 'categories':
      return <CategoriesWidget title={widget.title} categories={categories} />;
    case 'tags':
      return <TagsWidget title={widget.title} limit={widget.limit} tags={tags} />;
    case 'recent-posts':
      return <RecentPostsWidget title={widget.title} limit={widget.limit} posts={recentPosts} />;
    case 'newsletter':
      return (
        <NewsletterWidget 
          title={widget.title} 
          description={widget.description}
          placeholder={widget.placeholder}
          buttonText={widget.buttonText}
        />
      );
    case 'social-links':
      return <SocialLinksWidget title={widget.title} links={socialLinks} />;
    case 'custom':
      return <CustomWidget title={widget.title} content={widget.content} />;
    default:
      return null;
  }
}

function SearchWidget() {
  return (
    <div className={styles.widget}>
      <div className={styles.searchInput}>
        <Search size={18} />
        <input type="text" placeholder="Search..." />
      </div>
    </div>
  );
}

function AboutWidget({ title, content, image }: { title?: string; content?: string; image?: string }) {
  return (
    <div className={styles.widget}>
      {title && <h3 className={styles.widgetTitle}>{title}</h3>}
      {image && <img src={image} alt="" className={styles.aboutImage} />}
      {content && <p className={styles.aboutContent}>{content}</p>}
    </div>
  );
}

function CategoriesWidget({ title, categories }: { title?: string; categories?: { category: string; count: number }[] }) {
  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>{title || 'Categories'}</h3>
      <ul className={styles.categoryList}>
        {categories && categories.length > 0 ? (
          categories.map(({ category, count }) => (
            <li key={category}>
              <a href={`/blog?category=${encodeURIComponent(category)}`}>
                {category} ({count})
              </a>
            </li>
          ))
        ) : (
          <li>No categories yet</li>
        )}
      </ul>
    </div>
  );
}

function TagsWidget({ title, limit = 20, tags }: { title?: string; limit?: number; tags?: { tag: string; count: number }[] }) {
  const displayTags = tags ? tags.slice(0, limit) : [];
  
  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>{title || 'Tags'}</h3>
      <div className={styles.tagCloud}>
        {displayTags.length > 0 ? (
          displayTags.map(({ tag, count }) => (
            <a 
              key={tag} 
              href={`/blog?tag=${encodeURIComponent(tag)}`}
              className={styles.tag}
              title={`${count} post${count !== 1 ? 's' : ''}`}
            >
              {tag}
            </a>
          ))
        ) : (
          <span className={styles.tag}>No tags yet</span>
        )}
      </div>
    </div>
  );
}

function RecentPostsWidget({ title, limit = 5, posts }: { title?: string; limit?: number; posts?: { slug: string; title: string; date: string }[] }) {
  const displayPosts = posts ? posts.slice(0, limit) : [];
  
  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>{title || 'Recent Posts'}</h3>
      <ul className={styles.postList}>
        {displayPosts.length > 0 ? (
          displayPosts.map(post => (
            <li key={post.slug}>
              <a href={`/blog/${post.slug}`}>{post.title}</a>
              <span className={styles.postDate}>
                {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </li>
          ))
        ) : (
          <li>No posts yet</li>
        )}
      </ul>
    </div>
  );
}

function NewsletterWidget({ 
  title, 
  description, 
  placeholder = 'your@email.com',
  buttonText = 'Subscribe'
}: { 
  title?: string; 
  description?: string;
  placeholder?: string;
  buttonText?: string;
}) {
  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>{title || 'Newsletter'}</h3>
      {description && <p className={styles.newsletterDesc}>{description}</p>}
      <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.inputGroup}>
          <Mail size={18} />
          <input type="email" placeholder={placeholder} />
        </div>
        <button type="submit">{buttonText}</button>
      </form>
    </div>
  );
}

function SocialLinksWidget({ title, links }: { title?: string; links?: { twitter?: string; github?: string; linkedin?: string; youtube?: string; instagram?: string } }) {
  if (!links) return null;
  
  const socialIcons = [
    { name: 'twitter', url: links.twitter, Icon: Twitter },
    { name: 'github', url: links.github, Icon: Github },
    { name: 'linkedin', url: links.linkedin, Icon: Linkedin },
    { name: 'youtube', url: links.youtube, Icon: Youtube },
    { name: 'instagram', url: links.instagram, Icon: Instagram },
  ].filter(social => social.url);
  
  if (socialIcons.length === 0) return null;
  
  return (
    <div className={styles.widget}>
      {title && <h3 className={styles.widgetTitle}>{title}</h3>}
      <div className={styles.socialLinks}>
        {socialIcons.map(({ name, url, Icon }) => (
          <a 
            key={name} 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label={name}
            title={name}
          >
            <Icon size={20} />
          </a>
        ))}
      </div>
    </div>
  );
}

function CustomWidget({ title, content }: { title?: string; content: string }) {
  const [sanitized, setSanitized] = useState('');

  useEffect(() => {
    import('isomorphic-dompurify').then(({ default: DOMPurify }) => {
      setSanitized(DOMPurify.sanitize(content));
    });
  }, [content]);

  return (
    <div className={styles.widget}>
      {title && <h3 className={styles.widgetTitle}>{title}</h3>}
      <div dangerouslySetInnerHTML={{ __html: sanitized }} />
    </div>
  );
}
