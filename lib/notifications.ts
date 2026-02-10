import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import yaml from 'js-yaml';

const DATA_DIR = join(process.cwd(), 'data');
const USERS_DIR = join(DATA_DIR, 'users');

export interface Notification {
  id: string;
  type: 'system' | 'interaction' | 'content' | 'admin' | 'custom';
  title: string;
  message: string;
  link?: string;
  createdAt: string;
  read: boolean;
  metadata?: {
    actor?: string;
    context?: Record<string, any>;
  };
}

interface NotificationsFile {
  notifications: Notification[];
}

function getUserNotificationsPath(userId: string): string {
  return join(USERS_DIR, userId, 'notifications.yaml');
}

function ensureUserDirectory(userId: string): void {
  const userDir = join(USERS_DIR, userId);
  if (!existsSync(userDir)) {
    mkdirSync(userDir, { recursive: true });
  }
}

function loadNotificationsFile(userId: string): NotificationsFile {
  const filePath = getUserNotificationsPath(userId);
  
  if (!existsSync(filePath)) {
    return { notifications: [] };
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const data = yaml.load(content) as NotificationsFile;
    return data || { notifications: [] };
  } catch (error) {
    console.error(`[Notifications] Error loading file for user ${userId}:`, error);
    return { notifications: [] };
  }
}

function saveNotificationsFile(userId: string, data: NotificationsFile): void {
  ensureUserDirectory(userId);
  const filePath = getUserNotificationsPath(userId);
  const yamlContent = yaml.dump(data);
  writeFileSync(filePath, yamlContent, 'utf-8');
}

export interface GetNotificationsOptions {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}

export function getUserNotifications(
  userId: string,
  options: GetNotificationsOptions = {}
): { notifications: Notification[]; total: number } {
  const { limit = 20, offset = 0, unreadOnly = false } = options;
  
  const data = loadNotificationsFile(userId);
  let notifications = data.notifications || [];

  notifications.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (unreadOnly) {
    notifications = notifications.filter(n => !n.read);
  }

  const total = notifications.length;
  const paginatedNotifications = notifications.slice(offset, offset + limit);

  return {
    notifications: paginatedNotifications,
    total,
  };
}

export function getUnreadCount(userId: string): number {
  const data = loadNotificationsFile(userId);
  return data.notifications.filter(n => !n.read).length;
}

export function createNotification(
  userId: string,
  notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'>
): Notification {
  const data = loadNotificationsFile(userId);
  
  const notification: Notification = {
    id: uuidv4(),
    ...notificationData,
    createdAt: new Date().toISOString(),
    read: false,
  };

  data.notifications.push(notification);
  saveNotificationsFile(userId, data);

  return notification;
}

export function markAsRead(userId: string, notificationIds: string[]): number {
  const data = loadNotificationsFile(userId);
  let markedCount = 0;

  data.notifications.forEach(notification => {
    if (notificationIds.includes(notification.id) && !notification.read) {
      notification.read = true;
      markedCount++;
    }
  });

  if (markedCount > 0) {
    saveNotificationsFile(userId, data);
  }

  return markedCount;
}

export function markAllAsRead(userId: string): number {
  const data = loadNotificationsFile(userId);
  let markedCount = 0;

  data.notifications.forEach(notification => {
    if (!notification.read) {
      notification.read = true;
      markedCount++;
    }
  });

  if (markedCount > 0) {
    saveNotificationsFile(userId, data);
  }

  return markedCount;
}

export function deleteNotification(userId: string, notificationId: string): boolean {
  const data = loadNotificationsFile(userId);
  const initialLength = data.notifications.length;

  data.notifications = data.notifications.filter(n => n.id !== notificationId);

  if (data.notifications.length < initialLength) {
    saveNotificationsFile(userId, data);
    return true;
  }

  return false;
}
