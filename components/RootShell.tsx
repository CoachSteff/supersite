'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface RootShellProps {
  header: ReactNode;
  hero: ReactNode;
  body: ReactNode;
  footer: ReactNode;
  popupChat: ReactNode;
  /**
   * v0.5+: when the active theme uses `header.style: "embedded-in-hero"`,
   * the page-level hero owns the top of the screen and the root header
   * must not render on the home page (`/`). On other routes the page
   * doesn't render the hero, so the root header is still needed.
   */
  suppressHeaderOnHome?: boolean;
}

export default function RootShell({
  header,
  hero,
  body,
  footer,
  popupChat,
  suppressHeaderOnHome = false,
}: RootShellProps) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isChat = pathname === '/chat';

  if (isChat) {
    return <>{body}</>;
  }

  const showHeader = !(suppressHeaderOnHome && isHome);

  return (
    <>
      {showHeader && header}
      {isHome && hero}
      {body}
      {footer}
      {popupChat}
    </>
  );
}
