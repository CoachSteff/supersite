import { NextRequest, NextResponse } from 'next/server';
import { getPageBySlug, getBlogPostBySlug } from '@/lib/markdown';
import { FavoriteItem } from '@/lib/favorites';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pathsParam = searchParams.get('paths');

    if (!pathsParam) {
      return NextResponse.json({ error: 'Missing paths parameter' }, { status: 400 });
    }

    const paths = JSON.parse(pathsParam) as string[];
    const favorites: FavoriteItem[] = [];

    for (const path of paths) {
      try {
        if (path.startsWith('/blog/')) {
          const slug = path.replace('/blog/', '');
          const blogPost = await getBlogPostBySlug(slug);

          if (blogPost) {
            favorites.push({
              path,
              title: blogPost.title,
              type: 'blog',
              addedAt: Date.now(),
            });
          }
        } else {
          const slug = path.replace(/^\//, '').split('/');
          const page = await getPageBySlug(slug);

          if (page) {
            favorites.push({
              path,
              title: page.title,
              type: 'page',
              addedAt: Date.now(),
            });
          }
        }
      } catch (error) {
        console.error(`Error resolving favorite ${path}:`, error);
      }
    }

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('Error fetching favorites metadata:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
