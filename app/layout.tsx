import './globals.css';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ChatProvider } from '@/components/ChatProviderEnhanced';
import ChatButton from '@/components/ChatButton';
import ChatWindow from '@/components/ChatWindowEnhanced';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import { ThemeProvider } from '@/components/ThemeLoader';
import { getSiteConfig, getActiveTheme } from '@/lib/config';

export async function generateMetadata(): Promise<Metadata> {
  const config = getSiteConfig();
  
  return {
    title: config.seo.defaultTitle,
    description: config.seo.defaultDescription,
    openGraph: {
      title: config.seo.defaultTitle,
      description: config.seo.defaultDescription,
      url: config.site.url,
      siteName: config.site.name,
      images: [{ url: `${config.site.url}${config.seo.ogImage}` }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.seo.defaultTitle,
      description: config.seo.defaultDescription,
      images: [`${config.site.url}${config.seo.ogImage}`],
      creator: config.seo.twitterHandle,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = getSiteConfig();
  const theme = getActiveTheme();
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href={config.site.favicon} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var mode = localStorage.getItem('theme-mode') || 'system';
                  var resolved = mode;
                  if (mode === 'system') {
                    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.setAttribute('data-theme', resolved);
                  if (resolved === 'dark') {
                    document.documentElement.style.colorScheme = 'dark';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <ChatProvider>
            <KeyboardShortcuts enabled={config.chat.shortcuts?.enabled ?? true} />
            <Header />
            <main className="main-content">
              {children}
            </main>
            <Footer />
            <ChatButton />
            <ChatWindow />
          </ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
