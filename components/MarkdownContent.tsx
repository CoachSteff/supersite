'use client';

import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import remarkDirectives from '@/lib/remarkDirectives';
import PageActions from './PageActions';
import CodeBlock from './CodeBlock';
import {
  ImageGrid, Carousel, Columns, Callout, Figure,
  Details, Tabs, Card, Steps,
  YouTube, Button, Spacer, Divider,
  Highlight, Badge, Kbd, Abbr,
} from './directives';
import styles from '@/styles/Content.module.css';
import 'highlight.js/styles/github-dark.css';

interface MarkdownContentProps {
  title?: string;
  content: string;
  markdown?: string;
  path?: string;
  siteUrl?: string;
}

export default function MarkdownContent({ title, content, markdown, path, siteUrl }: MarkdownContentProps) {
  const fullUrl = path && siteUrl ? `${siteUrl}${path}` : siteUrl || '';

  return (
    <div className={styles.content}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkDirective, remarkDirectives]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          div: ({ node, children, ...props }: any) => {
            const directive = props['data-directive'];
            if (directive) {
              switch (directive) {
                case 'image-grid': return <ImageGrid {...props}>{children}</ImageGrid>;
                case 'carousel': return <Carousel {...props}>{children}</Carousel>;
                case 'columns': return <Columns {...props}>{children}</Columns>;
                case 'callout': return <Callout {...props}>{children}</Callout>;
                case 'figure': return <Figure {...props}>{children}</Figure>;
                case 'details': return <Details {...props}>{children}</Details>;
                case 'tabs': return <Tabs {...props}>{children}</Tabs>;
                case 'card': return <Card {...props}>{children}</Card>;
                case 'steps': return <Steps {...props}>{children}</Steps>;
                case 'youtube': return <YouTube {...props} />;
                case 'button': return <Button {...props} />;
                case 'spacer': return <Spacer {...props} />;
                case 'divider': return <Divider {...props} />;
              }
            }
            return <div {...props}>{children}</div>;
          },
          span: ({ node, children, ...props }: any) => {
            const directive = props['data-directive'];
            if (directive) {
              switch (directive) {
                case 'highlight': return <Highlight {...props}>{children}</Highlight>;
                case 'badge': return <Badge {...props}>{children}</Badge>;
                case 'kbd': return <Kbd {...props}>{children}</Kbd>;
                case 'abbr': return <Abbr {...props}>{children}</Abbr>;
              }
            }
            return <span {...props}>{children}</span>;
          },
          p: ({ node, children, ...props }: any) => {
            // Check if paragraph contains a code block component
            const hasCodeBlock = Array.isArray(children) && children.some((child: any) => 
              child?.type?.name === 'CodeBlock' || 
              (child?.props?.className?.includes('language-'))
            );
            
            // If it has a code block, render as fragment to avoid nesting issues
            if (hasCodeBlock) {
              return <>{children}</>;
            }
            
            return <p {...props}>{children}</p>;
          },
          pre: ({ node, children, ...props }: any) => {
            // Don't render pre wrapper, CodeBlock handles it
            return <>{children}</>;
          },
          code: ({ node, inline, className, children, ...props }: any) => {
            const code = String(children).replace(/\n$/, '');
            const isInline = inline || (!className && !code.includes('\n'));

            if (isInline) {
              return <code className={className} {...props}>{children}</code>;
            }

            return (
              <CodeBlock
                code={code}
                className={className}
              >
                {children}
              </CodeBlock>
            );
          }
        }}
      >
        {markdown || content}
      </ReactMarkdown>
      {markdown && path && title && siteUrl && (
        <PageActions 
          title={title}
          markdown={markdown}
          path={path}
          url={fullUrl}
        />
      )}
    </div>
  );
}
