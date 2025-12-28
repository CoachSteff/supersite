import { getSiteConfig } from './config';
import type { PageData, BlogPost, SEOMetadata } from './markdown';
import type { Metadata } from 'next';

export interface SEOProps {
  title?: string;
  description?: string;
  path: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  tags?: string[];
  seo?: SEOMetadata;
}

export function generateMetadata(props: SEOProps): Metadata {
  const config = getSiteConfig();
  
  const pageTitle = props.seo?.title || props.title || config.seo.defaultTitle;
  const fullTitle = props.title 
    ? config.seo.titleTemplate.replace('%s', pageTitle)
    : config.seo.defaultTitle;
  
  const description = props.seo?.description || props.description || config.seo.defaultDescription;
  const url = `${config.site.url}${props.path}`;
  const ogImage = `${config.site.url}${config.seo.ogImage}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: config.site.name,
      images: [{ url: ogImage }],
      type: props.type || 'website',
      ...(props.type === 'article' && props.publishedTime ? { publishedTime: props.publishedTime } : {}),
      ...(props.type === 'article' && props.author ? { authors: [props.author] } : {}),
      ...(props.type === 'article' && props.tags && props.tags.length > 0 ? { tags: props.tags } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
      ...(config.seo.twitterHandle ? { creator: config.seo.twitterHandle } : {}),
    },
  };

  if (props.seo?.keywords && props.seo.keywords.length > 0) {
    metadata.keywords = props.seo.keywords;
  }

  if (props.seo?.noindex) {
    metadata.robots = {
      index: false,
      follow: false,
    };
  }

  return metadata;
}

export function generatePageMetadata(page: PageData) {
  return generateMetadata({
    title: page.title,
    description: page.description,
    path: page.path,
    author: page.author,
    publishedTime: page.publishedDate,
    seo: page.seo,
  });
}

export function generateBlogMetadata(post: BlogPost) {
  return generateMetadata({
    title: post.title,
    description: post.description,
    path: post.path,
    type: 'article',
    publishedTime: post.date,
    author: post.author,
    tags: post.tags,
    seo: post.seo,
  });
}
