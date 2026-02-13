import type { ComponentMap } from './schemas';

/**
 * Theme Component Registry
 * Handles loading and resolving theme-specific component overrides
 */

interface ThemeComponentConfig {
  ChatSidebar?: React.ComponentType<any>;
  SettingsModal?: React.ComponentType<any>;
  ProfileModal?: React.ComponentType<any>;
  FavouritesModal?: React.ComponentType<any>;
  NotificationModal?: React.ComponentType<any>;
}

/**
 * Get a theme component by name
 * Returns the custom theme component if it exists, otherwise returns the fallback
 * 
 * @param components - Component map from theme
 * @param componentName - Name of the component to retrieve
 * @param fallback - Fallback component if theme component doesn't exist
 * @returns The component to render
 */
export function getThemeComponent<T extends React.ComponentType<any>>(
  components: ComponentMap | undefined,
  componentName: string,
  fallback: T
): T {
  if (!components) {
    return fallback;
  }

  const themeComponent = components[componentName];
  if (themeComponent) {
    return themeComponent as T;
  }

  return fallback;
}

/**
 * Check if a theme has a custom component
 * 
 * @param components - Component map from theme
 * @param componentName - Name of the component to check
 * @returns True if the theme has a custom component
 */
export function hasThemeComponent(
  components: ComponentMap | undefined,
  componentName: string
): boolean {
  return !!components && !!components[componentName];
}
