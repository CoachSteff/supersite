import { getSiteConfig } from '@/lib/config';
import PageActions from './PageActions';
import styles from '@/styles/Content.module.css';

interface MarkdownContentProps {
  title?: string;
  content: string;
  markdown?: string;
  path?: string;
}

export default function MarkdownContent({ title, content, markdown, path }: MarkdownContentProps) {
  const config = getSiteConfig();
  const fullUrl = path ? `${config.site.url}${path}` : config.site.url;

  return (
    <div className={styles.content}>
      <div dangerouslySetInnerHTML={{ __html: content }} />
      {markdown && path && title && (
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
