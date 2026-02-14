import FlexSearch from 'flexsearch';
import { getAllPages, getAllBlogPosts } from './markdown';

export interface SearchResult {
  title: string;
  description?: string;
  path: string;
  type: 'page' | 'blog';
}

let searchIndex: FlexSearch.Index | null = null;
let searchData: SearchResult[] = [];
let indexBuiltAt: number = 0;
const INDEX_TTL_MS = 5 * 60 * 1000; // Cache for 5 minutes

export async function buildSearchIndex() {
  const index = new FlexSearch.Index({
    tokenize: 'forward',
    resolution: 9,
  });

  const pages = await getAllPages();
  const posts = await getAllBlogPosts();

  searchData = [];
  let id = 0;

  for (const page of pages) {
    const searchText = `${page.title} ${page.description || ''} ${page.content.replace(/<[^>]*>/g, '')}`;
    index.add(id, searchText);
    searchData.push({
      title: page.title,
      description: page.description,
      path: page.path,
      type: 'page',
    });
    id++;
  }

  for (const post of posts) {
    const searchText = `${post.title} ${post.description || ''} ${post.content.replace(/<[^>]*>/g, '')}`;
    index.add(id, searchText);
    searchData.push({
      title: post.title,
      description: post.description,
      path: post.path,
      type: 'blog',
    });
    id++;
  }

  searchIndex = index;
  indexBuiltAt = Date.now();
  return index;
}

export async function searchContent(query: string): Promise<SearchResult[]> {
  const isStale = !searchIndex || (Date.now() - indexBuiltAt > INDEX_TTL_MS);
  if (isStale) {
    await buildSearchIndex();
  }

  if (!searchIndex || !query.trim()) {
    return [];
  }

  const results = searchIndex.search(query, { limit: 10 });
  
  return results.map((id) => searchData[id as number]).filter(Boolean);
}
