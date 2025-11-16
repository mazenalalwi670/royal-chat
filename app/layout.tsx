import type { Metadata } from 'next';
import './globals.css';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { ContactsProvider } from './contexts/ContactsContext';
import { GamificationProvider } from './contexts/GamificationContext';
import { ErrorBoundary } from './components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Royal Chat - تطبيق الدردشة المميز',
  description: 'تطبيق دردشة حديث مع ميزات متقدمة',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Permissions for camera and microphone */}
        <meta httpEquiv="Permissions-Policy" content="camera=*, microphone=*" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased overflow-x-hidden touch-pan-y" suppressHydrationWarning>
        <ErrorBoundary>
          <AuthProvider>
            <ThemeProvider>
              <LanguageProvider>
                <UserProvider>
                  <ContactsProvider>
                    <GamificationProvider>
                      <WebSocketProvider>
                        {children}
                      </WebSocketProvider>
                    </GamificationProvider>
                  </ContactsProvider>
                </UserProvider>
              </LanguageProvider>
            </ThemeProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

