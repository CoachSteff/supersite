import { getPageBySlug } from '@/lib/markdown';
import MarkdownContent from '@/components/MarkdownContent';
import { notFound } from 'next/navigation';

export default async function HomePage() {
  const page = await getPageBySlug([]);
  
  if (!page) {
    notFound();
  }

  return (
    <MarkdownContent 
      title={page.title} 
      content={page.content}
      markdown={page.markdown}
      path={page.path}
    />
  );
}
