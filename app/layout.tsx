import type { Metadata, Viewport } from 'next';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { ToastContainer } from '@/components/Toast';
import './globals.css';

export const metadata: Metadata = {
  title: "Max & Mina's Ice Cream - Never Miss a Flavor Drop",
  description:
    "Track 15,000+ legendary ice cream flavors from Max & Mina's in Flushing, Queens. Get alerts when rare flavors appear!",
  manifest: '/manifest.json',
  keywords: [
    'ice cream',
    'Max and Minas',
    'Flushing',
    'Queens',
    'flavor drops',
    'rare flavors',
  ],
  authors: [{ name: "Max & Mina's Ice Cream" }],
  openGraph: {
    title: "Max & Mina's Ice Cream",
    description: "Never miss a flavor drop - 15,000+ flavors since 1997",
    type: 'website',
    locale: 'en_US',
    siteName: "Max & Mina's Ice Cream",
  },
  twitter: {
    card: 'summary_large_image',
    title: "Max & Mina's Ice Cream",
    description: "Never miss a flavor drop - 15,000+ flavors since 1997",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "Max & Mina's",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#9B59B6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-psychedelic-pattern min-h-screen antialiased">
        <Header />
        <main className="pb-20 md:pb-8">{children}</main>
        <Navigation />
        <ToastContainer />
      </body>
    </html>
  );
}
