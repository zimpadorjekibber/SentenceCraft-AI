import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: {
    default: 'SentenceCraft AI - Learn English Grammar with AI',
    template: '%s | SentenceCraft AI',
  },
  description: 'Master English grammar and tenses with AI-powered sentence generation. Practice 12 tenses, voice conversion, questions, modals, and more. Hindi to English tense helper included.',
  keywords: ['English grammar', 'AI sentence generator', 'learn tenses', 'Hindi to English', 'grammar practice', 'English learning'],
  authors: [{ name: 'SentenceCraft AI' }],
  openGraph: {
    title: 'SentenceCraft AI - Learn English Grammar with AI',
    description: 'Master English grammar and tenses with AI-powered sentence generation.',
    type: 'website',
    locale: 'en_US',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e8edf2' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1f36' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
