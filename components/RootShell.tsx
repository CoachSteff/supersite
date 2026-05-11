'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface RootShellProps {
  header: ReactNode;
  hero: ReactNode;
  body: ReactNode;
  footer: ReactNode;
  popupChat: ReactNode;
}

export default function RootShell({ header, hero, body, footer, popupChat }: RootShellProps) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isChat = pathname === '/chat';

  if (isChat) {
    return <>{body}</>;
  }

  return (
    <>
      {header}
      {isHome && hero}
      {body}
      {footer}
      {popupChat}
    </>
  );
}
