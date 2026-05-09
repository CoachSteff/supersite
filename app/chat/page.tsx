import CenterChatLayout from '@/components/CenterChatLayout';
import { getSiteConfig, getActiveTheme, getPrimaryUser } from '@/lib/config';

export const dynamic = 'force-dynamic';

export default function ChatPage() {
  const config = getSiteConfig();
  const theme = getActiveTheme();
  const primaryUser = theme.structure.hero.type === 'profile' ? getPrimaryUser() : null;

  return (
    <CenterChatLayout
      config={config}
      user={primaryUser}
      themeName={theme.themeFolder || 'base'}
    />
  );
}
