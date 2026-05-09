'use client';

import { ReactNode, useEffect, useState } from 'react';

/**
 * Render children only if the visitor is signed in AND matches the
 * configured primary user. Used as a lightweight admin gate until the
 * framework grows a real role system.
 *
 * Resolution: GET /api/auth/me → user.username, GET /api/config →
 * branding.primaryUser. Both fail-closed on network or auth errors.
 */
export default function AdminOnly({ children }: { children: ReactNode }) {
  const [allowed, setAllowed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch('/api/config').then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ])
      .then(([authData, configData]) => {
        if (cancelled) return;
        const username = authData?.user?.username;
        const primaryUser = configData?.branding?.primaryUser;
        setAllowed(!!username && !!primaryUser && username === primaryUser);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded || !allowed) return null;
  return <>{children}</>;
}
