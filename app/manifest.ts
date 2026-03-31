import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Acréscimos - A Notícia Além do Tempo',
    short_name: 'Acréscimos',
    description: 'Portal de notícias esportivas focado no futebol brasileiro',
    start_url: '/',
    display: 'standalone',
    background_color: '#1B2436',
    theme_color: '#F2E205',
    orientation: 'portrait',
    categories: ['news', 'sports'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  }
}
