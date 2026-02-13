import './globals.css';
import type { Metadata } from 'next';
import AdminToolbar from '@/components/AdminToolbar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import { ChatProvider } from '@/components/ChatProvider';
import ChatButton from '@/components/ChatButton';
import ChatWindow from '@/components/ChatWindow';
import CenterChatLayout from '@/components/CenterChatLayout';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import Hero from '@/components/Hero';
import AnonymousCookieNotice from '@/components/AnonymousCookieNotice';
import { ThemeProvider } from '@/components/ThemeLoader';
import { ThemeContextProvider } from '@/components/ThemeContext';
import { getSiteConfig, getActiveTheme, getPrimaryUser } from '@/lib/config';
import { getLayoutComponent, shouldShowSidebar } from '@/lib/layout-renderer';
import { getAllCategories, getAllTags, getRecentBlogPosts } from '@/lib/markdown';

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = getSiteConfig();
  const theme = getActiveTheme();
  
  // Get structure settings from the full theme
  const { header, footer, hero, layout } = theme.structure;
  const features = theme.meta.features;
  
  // Check if auth is enabled in site config
  const authEnabled = config.auth?.enabled ?? false;
  
  // Get primary user for profile hero type (Influencer theme)
  let primaryUser = null;
  if (hero.type === 'profile') {
    primaryUser = getPrimaryUser();
  }
  
  // Determine if sidebar should be shown
  const showSidebar = shouldShowSidebar(theme);
  
  // Fetch sidebar data if needed
  let sidebarData = null;
  if (showSidebar) {
    try {
      const [categories, tags, recentPosts] = await Promise.all([
        getAllCategories(),
        getAllTags(),
        getRecentBlogPosts(5),
      ]);
      sidebarData = { categories, tags, recentPosts };
    } catch (error) {
      console.error('Error loading sidebar data:', error);
      sidebarData = { categories: [], tags: [], recentPosts: [] };
    }
  }
  
  // Get layout component based on theme
  const LayoutComponent = getLayoutComponent(layout.type as any);
  const { maxWidth, contentWidth, sidebarWidth } = layout;
  
  // Check if chat should be in center layout mode
  // Priority: site config overrides > theme default
  const chatInCenter = (config.chat?.window?.layout ?? theme.structure.chatLayout) === 'center';
  
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
      <body style={{ paddingTop: config.admin?.toolbar ? '42px' : '0' }}>
        <ThemeProvider theme={theme}>
          <ThemeContextProvider theme={theme}>
            <ChatProvider>
              {chatInCenter ? (
                // Center chat layout (ChatGPT-style)
                <>
                  <AdminToolbar enabled={config.admin?.toolbar ?? false} />
                  <KeyboardShortcuts enabled={config.chat.shortcuts?.enabled ?? true} />
                  <CenterChatLayout config={config} user={primaryUser} themeName={theme.themeFolder || 'base'}>
                    {children}
                  </CenterChatLayout>
                </>
              ) : (
                // Standard layout with floating/popup chat
                <>
                  <AdminToolbar enabled={config.admin?.toolbar ?? false} />
                  <KeyboardShortcuts enabled={config.chat.shortcuts?.enabled ?? true} />
                  <Header 
                    style={header.style}
                    sticky={header.sticky}
                    showLogo={header.logo}
                    showSearch={header.search && features.search}
                    showAuth={authEnabled}
                  />
                  {hero.enabled && (
                    <Hero 
                      type={hero.type as any}
                      height={hero.height}
                      config={config}
                      user={primaryUser}
                    />
                  )}
                  <LayoutComponent
                    maxWidth={maxWidth}
                    contentWidth={contentWidth}
                    sidebarWidth={sidebarWidth}
                    sidebar={showSidebar && sidebarData ? (
                      <Sidebar 
                        widgets={theme.blocks.sidebar}
                        categories={sidebarData.categories}
                        tags={sidebarData.tags}
                        recentPosts={sidebarData.recentPosts}
                        socialLinks={config.social}
                      />
                    ) : undefined}
                  >
                    {children}
                  </LayoutComponent>
                  <Footer style={footer.style} />
                  {features.chat && <ChatButton />}
                  {features.chat && <ChatWindow />}
                  <AnonymousCookieNotice />
                </>
              )}
            </ChatProvider>
          </ThemeContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
