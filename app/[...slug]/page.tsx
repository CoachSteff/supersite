import { getPageBySlug, getAllPages } from '@/lib/markdown';
import MarkdownContent from '@/components/MarkdownContent';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const pages = await getAllPages();
  
  return pages
    .filter(page => page.slug !== 'home')
    .map((page) => ({
      slug: page.slug.split('/'),
    }));
}

export default async function Page({ params }: { params: { slug: string[] } }) {
  const page = await getPageBySlug(params.slug);

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
