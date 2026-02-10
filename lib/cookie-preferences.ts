import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

const DATA_DIR = join(process.cwd(), 'data');
const COOKIE_PREFS_FILE = join(DATA_DIR, 'cookie-preferences.yaml');

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

interface CookiePreferencesStore {
  anonymous: CookiePreferences;
  users: Record<string, CookiePreferences>;
}

function loadCookiePreferences(): CookiePreferencesStore {
  if (!existsSync(COOKIE_PREFS_FILE)) {
    return {
      anonymous: {
        necessary: true,
        analytics: false,
        marketing: false,
        timestamp: new Date().toISOString(),
      },
      users: {},
    };
  }

  try {
    const content = readFileSync(COOKIE_PREFS_FILE, 'utf-8');
    return yaml.load(content) as CookiePreferencesStore;
  } catch (error) {
    console.error('[CookiePrefs] Error loading preferences:', error);
    return {
      anonymous: {
        necessary: true,
        analytics: false,
        marketing: false,
        timestamp: new Date().toISOString(),
      },
      users: {},
    };
  }
}

function saveCookiePreferences(store: CookiePreferencesStore): void {
  try {
    const yamlContent = yaml.dump(store);
    writeFileSync(COOKIE_PREFS_FILE, yamlContent, 'utf-8');
  } catch (error) {
    console.error('[CookiePrefs] Error saving preferences:', error);
  }
}

export function getCookiePreferences(userId?: string): CookiePreferences {
  const store = loadCookiePreferences();
  
  if (userId && store.users[userId]) {
    return store.users[userId];
  }
  
  return store.anonymous;
}

export function saveCookiePreferencesForUser(
  preferences: Omit<CookiePreferences, 'timestamp'>,
  userId?: string
): void {
  const store = loadCookiePreferences();
  
  const prefs: CookiePreferences = {
    ...preferences,
    necessary: true,
    timestamp: new Date().toISOString(),
  };

  if (userId) {
    store.users[userId] = prefs;
  } else {
    store.anonymous = prefs;
  }

  saveCookiePreferences(store);
}

export function hasSetCookiePreferences(userId?: string): boolean {
  const store = loadCookiePreferences();
  
  if (userId) {
    return !!store.users[userId];
  }
  
  return false;
}
