/**
 * Link utilities for platform detection and management
 */

export interface PlatformInfo {
  platform: string;
  icon: string;
  label?: string;
  color?: string;
}

const platformPatterns: Record<string, { pattern: RegExp; icon: string; label: string; color: string }> = {
  github: {
    pattern: /github\.com/i,
    icon: 'Github',
    label: 'GitHub',
    color: '#181717',
  },
  linkedin: {
    pattern: /linkedin\.com/i,
    icon: 'Linkedin',
    label: 'LinkedIn',
    color: '#0A66C2',
  },
  twitter: {
    pattern: /twitter\.com/i,
    icon: 'Twitter',
    label: 'Twitter',
    color: '#1DA1F2',
  },
  x: {
    pattern: /x\.com/i,
    icon: 'X',
    label: 'X',
    color: '#000000',
  },
  facebook: {
    pattern: /facebook\.com|fb\.com/i,
    icon: 'Facebook',
    label: 'Facebook',
    color: '#1877F2',
  },
  instagram: {
    pattern: /instagram\.com/i,
    icon: 'Instagram',
    label: 'Instagram',
    color: '#E4405F',
  },
  youtube: {
    pattern: /youtube\.com|youtu\.be/i,
    icon: 'Youtube',
    label: 'YouTube',
    color: '#FF0000',
  },
  spotify: {
    pattern: /spotify\.com/i,
    icon: 'Music',
    label: 'Spotify',
    color: '#1DB954',
  },
  tiktok: {
    pattern: /tiktok\.com/i,
    icon: 'Music',
    label: 'TikTok',
    color: '#000000',
  },
  twitch: {
    pattern: /twitch\.tv/i,
    icon: 'Twitch',
    label: 'Twitch',
    color: '#9146FF',
  },
  discord: {
    pattern: /discord\.gg|discord\.com/i,
    icon: 'MessageCircle',
    label: 'Discord',
    color: '#5865F2',
  },
  telegram: {
    pattern: /t\.me|telegram\.me/i,
    icon: 'Send',
    label: 'Telegram',
    color: '#26A5E4',
  },
  medium: {
    pattern: /medium\.com/i,
    icon: 'FileText',
    label: 'Medium',
    color: '#000000',
  },
  substack: {
    pattern: /substack\.com/i,
    icon: 'Mail',
    label: 'Substack',
    color: '#FF6719',
  },
  reddit: {
    pattern: /reddit\.com/i,
    icon: 'MessageSquare',
    label: 'Reddit',
    color: '#FF4500',
  },
  pinterest: {
    pattern: /pinterest\.com/i,
    icon: 'Image',
    label: 'Pinterest',
    color: '#E60023',
  },
  behance: {
    pattern: /behance\.net/i,
    icon: 'Briefcase',
    label: 'Behance',
    color: '#1769FF',
  },
  dribbble: {
    pattern: /dribbble\.com/i,
    icon: 'Palette',
    label: 'Dribbble',
    color: '#EA4C89',
  },
  figma: {
    pattern: /figma\.com/i,
    icon: 'Figma',
    label: 'Figma',
    color: '#F24E1E',
  },
  notion: {
    pattern: /notion\.so/i,
    icon: 'FileText',
    label: 'Notion',
    color: '#000000',
  },
  producthunt: {
    pattern: /producthunt\.com/i,
    icon: 'Rocket',
    label: 'Product Hunt',
    color: '#DA552F',
  },
  patreon: {
    pattern: /patreon\.com/i,
    icon: 'Heart',
    label: 'Patreon',
    color: '#FF424D',
  },
  kofi: {
    pattern: /ko-fi\.com/i,
    icon: 'Coffee',
    label: 'Ko-fi',
    color: '#FF5E5B',
  },
  buymeacoffee: {
    pattern: /buymeacoffee\.com/i,
    icon: 'Coffee',
    label: 'Buy Me a Coffee',
    color: '#FFDD00',
  },
  paypal: {
    pattern: /paypal\.com|paypal\.me/i,
    icon: 'DollarSign',
    label: 'PayPal',
    color: '#00457C',
  },
  calendly: {
    pattern: /calendly\.com/i,
    icon: 'Calendar',
    label: 'Calendly',
    color: '#006BFF',
  },
  linktree: {
    pattern: /linktr\.ee/i,
    icon: 'Link',
    label: 'Linktree',
    color: '#39E09B',
  },
};

/**
 * Detect platform from URL
 */
export function detectPlatform(url: string): PlatformInfo | null {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    
    for (const [platform, { pattern, icon, label, color }] of Object.entries(platformPatterns)) {
      if (pattern.test(urlObj.hostname)) {
        return { platform, icon, label, color };
      }
    }
    
    // Default for unrecognized domains
    return {
      platform: 'website',
      icon: 'Globe',
      label: urlObj.hostname.replace(/^www\./, ''),
    };
  } catch (error) {
    return null;
  }
}

/**
 * Extract label from URL if not provided
 */
export function extractLabel(url: string, platformInfo?: PlatformInfo | null): string {
  if (platformInfo?.label) {
    return platformInfo.label;
  }

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/^www\./, '');
    
    // Capitalize first letter
    return hostname.charAt(0).toUpperCase() + hostname.slice(1).split('.')[0];
  } catch (error) {
    return 'Link';
  }
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get favicon URL for a domain
 */
export function getFaviconUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
  } catch (error) {
    return null;
  }
}

/**
 * Sort links by order
 */
export function sortLinks<T extends { order: number }>(links: T[]): T[] {
  return [...links].sort((a, b) => a.order - b.order);
}

/**
 * Reorder links after drag and drop
 */
export function reorderLinks<T extends { order: number }>(
  links: T[],
  fromIndex: number,
  toIndex: number
): T[] {
  const result = [...links];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  
  // Reassign order values
  return result.map((link, index) => ({
    ...link,
    order: index,
  }));
}
