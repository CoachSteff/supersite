import './globals.css';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ChatProvider } from '@/components/ChatProvider';
import ChatButton from '@/components/ChatButton';
import ChatWindow from '@/components/ChatWindow';
import ThemeLoader from '@/components/ThemeLoader';
import { getSiteConfig } from '@/lib/config';

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
  
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={config.site.favicon} />
      </head>
      <body>
        <ThemeLoader branding={config.branding} />
        <ChatProvider>
          <Header />
          <main className="main-content">
            {children}
          </main>
          <Footer />
          <ChatButton />
          <ChatWindow />
        </ChatProvider>
      </body>
    </html>
  );
}
