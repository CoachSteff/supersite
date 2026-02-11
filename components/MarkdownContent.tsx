'use client';

import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import PageActions from './PageActions';
import CodeBlock from './CodeBlock';
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
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code: ({ node, inline, className, children, ...props }: any) => {
            const code = String(children).replace(/\n$/, '');
            
            if (inline) {
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
