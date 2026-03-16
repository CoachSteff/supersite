/**
 * Custom remark plugin that transforms #hashtag patterns in markdown
 * into clickable tag links pointing to taxonomy pages.
 *
 * - Matches #word and #kebab-case patterns in text nodes
 * - Skips headings, code blocks, and existing links
 * - Produces <a href="/tags/tagname" class="hashtag">#tagname</a>
 */
import { visit } from 'unist-util-visit';

const HASHTAG_REGEX = /#([a-zA-Z][a-zA-Z0-9-]*)/g;

export function normalizeTag(tag: string): string {
  return tag.toLowerCase().trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

// Node types where hashtags should NOT be processed
const SKIP_PARENTS = new Set([
  'heading',
  'code',
  'inlineCode',
  'link',
  'linkReference',
  'html',
]);

export default function remarkHashtags() {
  return (tree: any) => {
    visit(tree, 'text', (node: any, index: number | undefined, parent: any) => {
      if (!parent || index === undefined) return;
      if (SKIP_PARENTS.has(parent.type)) return;

      const value: string = node.value;
      const matches = [...value.matchAll(HASHTAG_REGEX)];
      if (matches.length === 0) return;

      const children: any[] = [];
      let lastIndex = 0;

      for (const match of matches) {
        const matchStart = match.index!;
        const tag = match[1].toLowerCase();

        // Add text before the hashtag
        if (matchStart > lastIndex) {
          children.push({ type: 'text', value: value.slice(lastIndex, matchStart) });
        }

        // Add the hashtag as a link
        children.push({
          type: 'link',
          url: `/tags/${tag}`,
          data: {
            hProperties: { className: 'hashtag' },
          },
          children: [{ type: 'text', value: `#${tag}` }],
        });

        lastIndex = matchStart + match[0].length;
      }

      // Add remaining text after last hashtag
      if (lastIndex < value.length) {
        children.push({ type: 'text', value: value.slice(lastIndex) });
      }

      // Replace the text node with the new children
      parent.children.splice(index, 1, ...children);
    });
  };
}

/**
 * Extract all hashtags from raw markdown text.
 * Returns deduplicated, lowercased tag names (without the # prefix).
 */
export function extractHashtags(markdown: string): string[] {
  // Strip code blocks and inline code first
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/^#{1,6}\s.*$/gm, ''); // Strip headings

  const matches = [...stripped.matchAll(HASHTAG_REGEX)];
  const tags = new Set(matches.map(m => m[1].toLowerCase()));
  return Array.from(tags);
}
