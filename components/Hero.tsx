import Link from 'next/link';
import Image from 'next/image';
import * as LucideIcons from 'lucide-react';
import { 
  MapPin, 
  Mail, 
  Globe,
} from 'lucide-react';
import type { SiteConfig } from '@/lib/config';
import { getRecentBlogPosts, type BlogPost } from '@/lib/markdown';
import { detectPlatform, sortLinks } from '@/lib/link-utils';
import type { Link as LinkType } from '@/lib/users';
import Avatar from '@/components/Avatar';
import styles from '@/styles/Hero.module.css';

interface HeroProps {
  type: 'none' | 'text' | 'image' | 'featured-post' | 'profile' | 'chat';
  height: string;
  config: SiteConfig;
  user?: any;
}

export default async function Hero({ type, height, config, user }: HeroProps) {
  if (type === 'none') {
    return null;
  }

  const heroStyle = {
    minHeight: height === 'auto' ? 'auto' : height,
  } as React.CSSProperties;

  switch (type) {
    case 'text':
      return <TextHero config={config} style={heroStyle} />;
    case 'image':
      return <ImageHero config={config} style={heroStyle} />;
    case 'featured-post':
      return <FeaturedPostHero style={heroStyle} />;
    case 'profile':
      return <ProfileHero config={config} style={heroStyle} user={user} />;
    case 'chat':
      return <ChatHero style={heroStyle} />;
    default:
      return null;
  }
}

function TextHero({ config, style }: { config: SiteConfig; style: React.CSSProperties }) {
  const hero = config.hero || {};
  const heading = hero.heading || 'Welcome to SuperSite';
  const subheading = hero.subheading || 'Build amazing websites with AI';
  const ctaText = hero.ctaText || 'Get Started';
  const ctaLink = hero.ctaLink || '/contact';

  return (
    <div className={styles.textHero} style={style}>
      <div className={styles.heroContent}>
        <h1 className={styles.heroHeading}>{heading}</h1>
        <p className={styles.heroSubheading}>{subheading}</p>
        <div className={styles.heroActions}>
          <Link href={ctaLink} className={styles.ctaButton}>
            {ctaText}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ImageHero({ config, style }: { config: SiteConfig; style: React.CSSProperties }) {
  const hero = config.hero || {};
  const heading = hero.heading || 'Welcome';
  const image = hero.image || '/images/hero-bg.jpg';
  const ctaText = hero.ctaText;
  const ctaLink = hero.ctaLink;

  return (
    <div className={styles.imageHero} style={style}>
      <div className={styles.heroImage}>
        <Image 
          src={image} 
          alt="Hero" 
          fill 
          style={{ objectFit: 'cover' }} 
          priority
        />
      </div>
      <div className={styles.heroOverlay}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroHeading}>{heading}</h1>
          {ctaText && ctaLink && (
            <div className={styles.heroActions}>
              <Link href={ctaLink} className={styles.ctaButton}>
                {ctaText}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

async function FeaturedPostHero({ style }: { style: React.CSSProperties }) {
  const posts = await getRecentBlogPosts(1);
  
  if (posts.length === 0) {
    return (
      <div className={styles.featuredPostHero} style={style}>
        <div className={styles.heroContent}>
          <p className={styles.noPostsMessage}>No blog posts yet. Check back soon!</p>
        </div>
      </div>
    );
  }

  const post = posts[0];

  return (
    <div className={styles.featuredPostHero} style={style}>
      <div className={styles.heroContent}>
        <span className={styles.featuredLabel}>Featured Post</span>
        <h1 className={styles.heroHeading}>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h1>
        {post.description && (
          <p className={styles.heroSubheading}>{post.description}</p>
        )}
        <div className={styles.postMeta}>
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </time>
          {post.tags && post.tags.length > 0 && (
            <span className={styles.tags}>
              {post.tags.slice(0, 3).map(tag => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </span>
          )}
        </div>
        <div className={styles.heroActions}>
          <Link href={`/blog/${post.slug}`} className={styles.ctaButton}>
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProfileHero({ config, style, user }: { config: SiteConfig; style: React.CSSProperties; user?: any }) {
  if (!user) {
    return (
      <div className={styles.profileHero} style={style}>
        <div className={styles.heroContent}>
          <p className={styles.noProfileMessage}>
            No primary user configured. Set <code>branding.primaryUser</code> in config/site.yaml to display a profile.
          </p>
        </div>
      </div>
    );
  }

  const displayName = user.profile?.firstName 
    ? `${user.profile.firstName}${user.profile.lastName ? ' ' + user.profile.lastName : ''}`
    : user.username || 'Anonymous';

  // Use unified links array, sorted by order
  const sortedLinks: LinkType[] = user.links ? sortLinks(user.links) : [];

  return (
    <div className={styles.profileHero} style={style}>
      <div className={styles.heroContent}>
        <Avatar
          src={user.profile?.avatar}
          name={displayName}
          size={150}
          className={styles.profileImg}
        />
        <h1 className={styles.profileName}>{displayName}</h1>
        {user.profile?.jobTitle && (
          <p className={styles.profileTitle}>
            {user.profile.jobTitle}
          </p>
        )}
        {user.profile?.bio && (
          <p className={styles.profileBio}>
            {user.profile.bio}
          </p>
        )}
        <div className={styles.profileDetails}>
          {user.profile?.location && (
            <span className={styles.profileDetail}>
              <MapPin size={16} />
              {user.profile.location}
            </span>
          )}
          {user.profile?.email && (
            <span className={styles.profileDetail}>
              <Mail size={16} />
              <a href={`mailto:${user.profile.email}`}>
                {user.profile.email}
              </a>
            </span>
          )}
        </div>
        {sortedLinks.length > 0 && (
          <div className={styles.profileSocial}>
            {sortedLinks.map((link, index) => {
              const platformInfo = detectPlatform(link.url);
              const IconComponent = platformInfo?.icon 
                ? (LucideIcons as any)[platformInfo.icon] 
                : Globe;
              const label = link.label || platformInfo?.label || 'Link';

              return (
                <a 
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={styles.socialLink}
                >
                  <IconComponent size={20} />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatHero({ style }: { style: React.CSSProperties }) {
  return (
    <div className={styles.chatHero} style={style}>
      <div className={styles.heroContent}>
        <h1 className={styles.heroHeading}>Chat with AI</h1>
        <p className={styles.heroSubheading}>
          Click the chat button in the bottom right to start a conversation
        </p>
      </div>
    </div>
  );
}
