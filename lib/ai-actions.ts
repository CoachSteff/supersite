/**
 * AI Actions System
 * 
 * Allows the AI to perform actions on the page, making it truly AI-first.
 * Actions are embedded in the AI response and executed client-side.
 */

export type ActionType = 
  | 'navigate'
  | 'search'
  | 'scroll'
  | 'highlight'
  | 'openLink'
  | 'copyText'
  | 'suggest'
  | 'showNotification';

export interface AIAction {
  type: ActionType;
  payload: Record<string, unknown>;
  label?: string;
  description?: string;
}

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: unknown;
}

// Action markers that AI can use in responses
export const ACTION_MARKERS = {
  navigate: '[[navigate:',
  search: '[[search:',
  scroll: '[[scroll:',
  highlight: '[[highlight:',
  openLink: '[[link:',
  copyText: '[[copy:',
  suggest: '[[suggest:',
  notify: '[[notify:',
  end: ']]',
};

/**
 * Parse actions from AI response text
 */
export function parseActions(text: string): { cleanText: string; actions: AIAction[] } {
  const actions: AIAction[] = [];
  let cleanText = text;

  // Parse navigate actions: [[navigate:/about]]
  const navigateRegex = /\[\[navigate:([^\]]+)\]\]/g;
  let match;
  while ((match = navigateRegex.exec(text)) !== null) {
    actions.push({
      type: 'navigate',
      payload: { path: match[1].trim() },
      label: `Go to ${match[1].trim()}`,
    });
  }
  cleanText = cleanText.replace(navigateRegex, '');

  // Parse search actions: [[search:query]]
  const searchRegex = /\[\[search:([^\]]+)\]\]/g;
  while ((match = searchRegex.exec(text)) !== null) {
    actions.push({
      type: 'search',
      payload: { query: match[1].trim() },
      label: `Search for "${match[1].trim()}"`,
    });
  }
  cleanText = cleanText.replace(searchRegex, '');

  // Parse scroll actions: [[scroll:#section-id]]
  const scrollRegex = /\[\[scroll:([^\]]+)\]\]/g;
  while ((match = scrollRegex.exec(text)) !== null) {
    actions.push({
      type: 'scroll',
      payload: { target: match[1].trim() },
      label: `Scroll to ${match[1].trim()}`,
    });
  }
  cleanText = cleanText.replace(scrollRegex, '');

  // Parse highlight actions: [[highlight:text to highlight]]
  const highlightRegex = /\[\[highlight:([^\]]+)\]\]/g;
  while ((match = highlightRegex.exec(text)) !== null) {
    actions.push({
      type: 'highlight',
      payload: { text: match[1].trim() },
      label: 'Highlight text',
    });
  }
  cleanText = cleanText.replace(highlightRegex, '');

  // Parse link actions: [[link:url|label]]
  const linkRegex = /\[\[link:([^|\]]+)\|?([^\]]*)\]\]/g;
  while ((match = linkRegex.exec(text)) !== null) {
    actions.push({
      type: 'openLink',
      payload: { url: match[1].trim(), label: match[2]?.trim() || match[1].trim() },
      label: match[2]?.trim() || 'Open link',
    });
  }
  cleanText = cleanText.replace(linkRegex, '');

  // Parse copy actions: [[copy:text to copy]]
  const copyRegex = /\[\[copy:([^\]]+)\]\]/g;
  while ((match = copyRegex.exec(text)) !== null) {
    actions.push({
      type: 'copyText',
      payload: { text: match[1].trim() },
      label: 'Copy to clipboard',
    });
  }
  cleanText = cleanText.replace(copyRegex, '');

  // Parse suggestion actions: [[suggest:suggestion text]]
  const suggestRegex = /\[\[suggest:([^\]]+)\]\]/g;
  while ((match = suggestRegex.exec(text)) !== null) {
    actions.push({
      type: 'suggest',
      payload: { text: match[1].trim() },
      label: match[1].trim(),
    });
  }
  cleanText = cleanText.replace(suggestRegex, '');

  // Parse notification actions: [[notify:message]]
  const notifyRegex = /\[\[notify:([^\]]+)\]\]/g;
  while ((match = notifyRegex.exec(text)) !== null) {
    actions.push({
      type: 'showNotification',
      payload: { message: match[1].trim() },
    });
  }
  cleanText = cleanText.replace(notifyRegex, '');

  return { cleanText: cleanText.trim(), actions };
}

/**
 * System prompt addition for AI actions
 */
export const AI_ACTIONS_PROMPT = `
You can perform actions on the page by including special markers in your response:

- [[navigate:/path]] - Navigate to a page (e.g., [[navigate:/about]])
- [[search:query]] - Open search with a query
- [[scroll:#section]] - Scroll to a section
- [[link:url|label]] - Create a clickable link
- [[copy:text]] - Add a "copy to clipboard" button
- [[suggest:text]] - Suggest a follow-up question
- [[notify:message]] - Show a notification

Use these sparingly and only when they add value. For example:
- If someone asks about services, you might include [[navigate:/services]]
- If you want to suggest follow-up questions, use [[suggest:...]]

Always provide the information in your text response as well - actions are supplementary.
`;

/**
 * Client-side action executor
 */
export class ActionExecutor {
  private router: { push: (path: string) => void } | null = null;

  setRouter(router: { push: (path: string) => void }) {
    this.router = router;
  }

  async execute(action: AIAction): Promise<ActionResult> {
    try {
      switch (action.type) {
        case 'navigate':
          return this.executeNavigate(action);
        case 'search':
          return this.executeSearch(action);
        case 'scroll':
          return this.executeScroll(action);
        case 'highlight':
          return this.executeHighlight(action);
        case 'openLink':
          return this.executeOpenLink(action);
        case 'copyText':
          return this.executeCopyText(action);
        case 'showNotification':
          return this.executeNotification(action);
        default:
          return { success: false, message: 'Unknown action type' };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Action failed' 
      };
    }
  }

  private executeNavigate(action: AIAction): ActionResult {
    const path = action.payload.path as string;
    if (this.router) {
      this.router.push(path);
      return { success: true, message: `Navigating to ${path}` };
    }
    // Fallback to window.location
    if (typeof window !== 'undefined') {
      window.location.href = path;
      return { success: true, message: `Navigating to ${path}` };
    }
    return { success: false, message: 'Navigation not available' };
  }

  private executeSearch(action: AIAction): ActionResult {
    const query = action.payload.query as string;
    // Dispatch a custom event that the search component can listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('supersite:search', { detail: { query } }));
      return { success: true, message: `Searching for "${query}"` };
    }
    return { success: false, message: 'Search not available' };
  }

  private executeScroll(action: AIAction): ActionResult {
    const target = action.payload.target as string;
    if (typeof document !== 'undefined') {
      const element = document.querySelector(target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return { success: true, message: `Scrolled to ${target}` };
      }
    }
    return { success: false, message: `Element ${target} not found` };
  }

  private executeHighlight(action: AIAction): ActionResult {
    const text = action.payload.text as string;
    if (typeof window !== 'undefined' && (window as any).find) {
      (window as any).find(text);
      return { success: true, message: 'Text highlighted' };
    }
    return { success: false, message: 'Highlight not supported' };
  }

  private executeOpenLink(action: AIAction): ActionResult {
    const url = action.payload.url as string;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
      return { success: true, message: 'Link opened' };
    }
    return { success: false, message: 'Cannot open link' };
  }

  private async executeCopyText(action: AIAction): Promise<ActionResult> {
    const text = action.payload.text as string;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return { success: true, message: 'Copied to clipboard' };
    }
    return { success: false, message: 'Clipboard not available' };
  }

  private executeNotification(action: AIAction): ActionResult {
    const message = action.payload.message as string;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('supersite:notification', { detail: { message } }));
      return { success: true };
    }
    return { success: false, message: 'Notifications not available' };
  }
}

// Singleton instance
export const actionExecutor = new ActionExecutor();
