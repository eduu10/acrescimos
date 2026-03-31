import type { MetadataRoute } from 'next'
import { getArticles } from '@/lib/db'

const BASE_URL = 'https://acrescimos.com.br'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publishedArticles = await getArticles({ published: true })

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/placar`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/classificacao`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  const articlePages: MetadataRoute.Sitemap = publishedArticles.map((article) => ({
    url: `${BASE_URL}/article/${article.slug}`,
    lastModified: new Date(article.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...articlePages]
}
