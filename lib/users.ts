import { readFileSync, writeFileSync, existsSync, unlinkSync, readdirSync, mkdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import yaml from 'js-yaml';

// Ensure data directories exist
const DATA_DIR = join(process.cwd(), 'data');
const USERS_DIR = join(DATA_DIR, 'users');

[DATA_DIR, USERS_DIR].forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

export interface CustomSocialLink {
  name: string;
  url: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  profile: {
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    organization?: string;
    bio?: string;
    avatar?: string;
  };
  social: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
    blog?: string;
    custom?: CustomSocialLink[];
  };
  settings: {
    theme: 'light' | 'dark' | 'system';
    notifications: {
      newPosts: boolean;
      replies: boolean;
      mentions: boolean;
    };
    privacy: {
      profileVisible: boolean;
      emailVisible: boolean;
    };
    language: string;
    timezone: string;
  };
  metadata: {
    createdAt: string;
    lastLoginAt: string;
    emailVerified: boolean;
  };
}

export interface UserIndex {
  emails: Record<string, string>;
  usernames: Record<string, string>;
}

// Generate UUID for user
export function generateUserId(): string {
  return uuidv4();
}

// Generate username from email
export function generateUsername(email: string): string {
  const localPart = email.split('@')[0];
  // Remove special chars, keep only alphanumeric and underscore
  let username = localPart.replace(/[^a-zA-Z0-9_]/g, '');
  // Ensure it starts with a letter
  if (!/^[a-zA-Z]/.test(username)) {
    username = 'user_' + username;
  }
  return username.toLowerCase();
}

// Load user index
function loadUserIndex(): UserIndex {
  const indexPath = join(process.cwd(), 'data', 'users', 'index.yaml');
  
  if (!existsSync(indexPath)) {
    return { emails: {}, usernames: {} };
  }

  try {
    const content = readFileSync(indexPath, 'utf-8');
    return yaml.load(content) as UserIndex;
  } catch (error) {
    console.error('[Users] Error loading index:', error);
    return { emails: {}, usernames: {} };
  }
}

// Save user index
function saveUserIndex(index: UserIndex): void {
  const indexPath = join(process.cwd(), 'data', 'users', 'index.yaml');
  const yamlContent = yaml.dump(index);
  writeFileSync(indexPath, yamlContent, 'utf-8');
}

// Check if username is available
export function checkUsernameAvailable(username: string): boolean {
  const index = loadUserIndex();
  return !index.usernames[username.toLowerCase()];
}

// Create new user
export function createUser(email: string, data?: Partial<UserProfile>): UserProfile {
  const normalizedEmail = email.toLowerCase().trim();
  const index = loadUserIndex();

  // Check if email already exists
  if (index.emails[normalizedEmail]) {
    throw new Error('Email already registered');
  }

  const userId = generateUserId();
  let username = data?.username || generateUsername(normalizedEmail);

  // Ensure username is unique
  let counter = 1;
  while (index.usernames[username.toLowerCase()]) {
    username = `${generateUsername(normalizedEmail)}${counter}`;
    counter++;
  }

  const user: UserProfile = {
    id: userId,
    username,
    email: normalizedEmail,
    profile: {
      firstName: data?.profile?.firstName || '',
      lastName: data?.profile?.lastName || '',
      jobTitle: data?.profile?.jobTitle || '',
      organization: data?.profile?.organization || '',
      bio: data?.profile?.bio || '',
      avatar: data?.profile?.avatar || '',
    },
    social: {
      twitter: data?.social?.twitter || '',
      linkedin: data?.social?.linkedin || '',
      github: data?.social?.github || '',
      facebook: data?.social?.facebook || '',
      instagram: data?.social?.instagram || '',
      youtube: data?.social?.youtube || '',
      website: data?.social?.website || '',
      blog: data?.social?.blog || '',
      custom: data?.social?.custom || [],
    },
    settings: {
      theme: data?.settings?.theme || 'system',
      notifications: {
        newPosts: data?.settings?.notifications?.newPosts ?? true,
        replies: data?.settings?.notifications?.replies ?? true,
        mentions: data?.settings?.notifications?.mentions ?? true,
      },
      privacy: {
        profileVisible: data?.settings?.privacy?.profileVisible ?? true,
        emailVisible: data?.settings?.privacy?.emailVisible ?? false,
      },
      language: data?.settings?.language || 'en',
      timezone: data?.settings?.timezone || 'UTC',
    },
    metadata: {
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      emailVerified: true,
    },
  };

  // Save user file
  const userPath = join(process.cwd(), 'data', 'users', `${userId}.yaml`);
  writeFileSync(userPath, yaml.dump(user), 'utf-8');

  // Update index
  index.emails[normalizedEmail] = userId;
  index.usernames[username.toLowerCase()] = userId;
  saveUserIndex(index);

  return user;
}

// Get user by ID
export function getUserById(userId: string): UserProfile | null {
  const userPath = join(process.cwd(), 'data', 'users', `${userId}.yaml`);

  if (!existsSync(userPath)) {
    return null;
  }

  try {
    const content = readFileSync(userPath, 'utf-8');
    return yaml.load(content) as UserProfile;
  } catch (error) {
    console.error(`[Users] Error loading user ${userId}:`, error);
    return null;
  }
}

// Get user by email
export function getUserByEmail(email: string): UserProfile | null {
  const normalizedEmail = email.toLowerCase().trim();
  const index = loadUserIndex();
  const userId = index.emails[normalizedEmail];

  if (!userId) {
    return null;
  }

  return getUserById(userId);
}

// Get user by username
export function getUserByUsername(username: string): UserProfile | null {
  const normalizedUsername = username.toLowerCase();
  const index = loadUserIndex();
  const userId = index.usernames[normalizedUsername];

  if (!userId) {
    return null;
  }

  return getUserById(userId);
}

// Update user
export function updateUser(userId: string, updates: Partial<UserProfile>): UserProfile | null {
  const user = getUserById(userId);

  if (!user) {
    return null;
  }

  // Merge updates
  const updatedUser: UserProfile = {
    ...user,
    profile: { ...user.profile, ...updates.profile },
    social: { ...user.social, ...updates.social },
    settings: updates.settings ? {
      ...user.settings,
      ...updates.settings,
      notifications: { ...user.settings.notifications, ...updates.settings?.notifications },
      privacy: { ...user.settings.privacy, ...updates.settings?.privacy },
    } : user.settings,
  };

  // Handle username change
  if (updates.username && updates.username !== user.username) {
    const index = loadUserIndex();
    
    // Check if new username is available
    if (index.usernames[updates.username.toLowerCase()] && 
        index.usernames[updates.username.toLowerCase()] !== userId) {
      throw new Error('Username already taken');
    }

    // Remove old username from index
    delete index.usernames[user.username.toLowerCase()];
    // Add new username to index
    index.usernames[updates.username.toLowerCase()] = userId;
    saveUserIndex(index);

    updatedUser.username = updates.username;
  }

  // Save user file
  const userPath = join(process.cwd(), 'data', 'users', `${userId}.yaml`);
  writeFileSync(userPath, yaml.dump(updatedUser), 'utf-8');

  return updatedUser;
}

// Update last login
export function updateLastLogin(userId: string): void {
  const user = getUserById(userId);
  
  if (!user) {
    return;
  }

  user.metadata.lastLoginAt = new Date().toISOString();
  
  const userPath = join(process.cwd(), 'data', 'users', `${userId}.yaml`);
  writeFileSync(userPath, yaml.dump(user), 'utf-8');
}

// Delete user
export function deleteUser(userId: string): boolean {
  const user = getUserById(userId);

  if (!user) {
    return false;
  }

  // Remove from index
  const index = loadUserIndex();
  delete index.emails[user.email.toLowerCase()];
  delete index.usernames[user.username.toLowerCase()];
  saveUserIndex(index);

  // Delete user file
  const userPath = join(process.cwd(), 'data', 'users', `${userId}.yaml`);
  unlinkSync(userPath);

  return true;
}

// Get all users
export function getAllUsers(): UserProfile[] {
  const usersDir = join(process.cwd(), 'data', 'users');

  if (!existsSync(usersDir)) {
    return [];
  }

  const files = readdirSync(usersDir);
  const users: UserProfile[] = [];

  files.forEach((file) => {
    if (file === 'index.yaml' || !file.endsWith('.yaml')) {
      return;
    }

    const userId = file.replace('.yaml', '');
    const user = getUserById(userId);
    
    if (user) {
      users.push(user);
    }
  });

  return users;
}

// Get public profile (respects privacy settings)
export function getPublicProfile(user: UserProfile): Partial<UserProfile> {
  if (!user.settings.privacy.profileVisible) {
    return {
      username: user.username,
      profile: {
        firstName: user.profile.firstName,
      },
    };
  }

  return {
    id: user.id,
    username: user.username,
    email: user.settings.privacy.emailVisible ? user.email : undefined,
    profile: user.profile,
    social: user.social,
    metadata: {
      createdAt: user.metadata.createdAt,
      lastLoginAt: user.metadata.lastLoginAt,
      emailVerified: user.metadata.emailVerified,
    },
  };
}
