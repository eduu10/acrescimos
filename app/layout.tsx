import type {Metadata, Viewport} from 'next';
import {Inter, Oswald} from 'next/font/google';
import {JsonLd} from '@/components/json-ld';
import {Analytics} from '@vercel/analytics/next';
import {SpeedInsights} from '@vercel/speed-insights/next';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://acrescimos.com.br'),
  title: {
    default: 'Acréscimos - A Notícia Além do Tempo',
    template: '%s | Acréscimos',
  },
  description: 'Portal de notícias esportivas focado no futebol brasileiro. Placares ao vivo, classificações, mercado da bola e muito mais.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Acréscimos',
    url: 'https://acrescimos.com.br',
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#F2E205',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${oswald.variable}`}>
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Acréscimos',
            url: 'https://acrescimos.com.br',
            logo: 'https://acrescimos.com.br/icon.svg',
            description: 'Portal de notícias esportivas focado no futebol brasileiro',
            sameAs: [],
          }}
        />
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Acréscimos',
            url: 'https://acrescimos.com.br',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://acrescimos.com.br/busca?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
