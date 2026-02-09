import type { FullTheme } from './theme-system';
import FullWidthLayout from '@/components/layouts/FullWidthLayout';
import SidebarRightLayout from '@/components/layouts/SidebarRightLayout';
import SidebarLeftLayout from '@/components/layouts/SidebarLeftLayout';
import CenteredLayout from '@/components/layouts/CenteredLayout';

export type LayoutType = 'full-width' | 'sidebar-right' | 'sidebar-left' | 'centered';

export function getLayoutComponent(type: LayoutType) {
  switch (type) {
    case 'full-width':
      return FullWidthLayout;
    case 'sidebar-right':
      return SidebarRightLayout;
    case 'sidebar-left':
      return SidebarLeftLayout;
    case 'centered':
      return CenteredLayout;
    default:
      return FullWidthLayout;
  }
}

export function shouldShowSidebar(theme: FullTheme): boolean {
  const layoutType = theme.structure.layout.type;
  return layoutType === 'sidebar-right' || layoutType === 'sidebar-left';
}
