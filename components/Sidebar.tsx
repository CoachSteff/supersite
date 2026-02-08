'use client';

import { Search, Mail } from 'lucide-react';
import type { SidebarWidget } from '@/lib/theme-system';
import styles from '@/styles/Sidebar.module.css';

interface SidebarProps {
  widgets: SidebarWidget[];
}

export default function Sidebar({ widgets }: SidebarProps) {
  if (widgets.length === 0) {
    return null;
  }

  return (
    <div className={styles.sidebar}>
      {widgets.map((widget, index) => (
        <SidebarWidgetRenderer key={`${widget.type}-${index}`} widget={widget} />
      ))}
    </div>
  );
}

function SidebarWidgetRenderer({ widget }: { widget: SidebarWidget }) {
  switch (widget.type) {
    case 'search':
      return <SearchWidget />;
    case 'about':
      return <AboutWidget title={widget.title} content={widget.content} image={widget.image} />;
    case 'categories':
      return <CategoriesWidget title={widget.title} />;
    case 'tags':
      return <TagsWidget title={widget.title} limit={widget.limit} />;
    case 'recent-posts':
      return <RecentPostsWidget title={widget.title} limit={widget.limit} />;
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
      return <SocialLinksWidget title={widget.title} />;
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

function CategoriesWidget({ title }: { title?: string }) {
  // TODO: Fetch categories from content
  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>{title || 'Categories'}</h3>
      <ul className={styles.categoryList}>
        <li><a href="/blog?category=technology">Technology</a></li>
        <li><a href="/blog?category=design">Design</a></li>
        <li><a href="/blog?category=business">Business</a></li>
      </ul>
    </div>
  );
}

function TagsWidget({ title, limit = 20 }: { title?: string; limit?: number }) {
  // TODO: Fetch tags from content
  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>{title || 'Tags'}</h3>
      <div className={styles.tagCloud}>
        <span className={styles.tag}>AI</span>
        <span className={styles.tag}>Web</span>
        <span className={styles.tag}>Design</span>
        <span className={styles.tag}>Next.js</span>
      </div>
    </div>
  );
}

function RecentPostsWidget({ title, limit = 5 }: { title?: string; limit?: number }) {
  // TODO: Fetch recent posts from content
  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>{title || 'Recent Posts'}</h3>
      <ul className={styles.postList}>
        <li><a href="/blog/example">Example Post Title</a></li>
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

function SocialLinksWidget({ title }: { title?: string }) {
  // TODO: Get social links from config
  return (
    <div className={styles.widget}>
      {title && <h3 className={styles.widgetTitle}>{title}</h3>}
      <div className={styles.socialLinks}>
        {/* Social icons would go here */}
      </div>
    </div>
  );
}

function CustomWidget({ title, content }: { title?: string; content: string }) {
  return (
    <div className={styles.widget}>
      {title && <h3 className={styles.widgetTitle}>{title}</h3>}
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
