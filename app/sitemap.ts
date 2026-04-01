import type { MetadataRoute } from 'next'
import { getArticles } from '@/lib/db'

const BASE_URL = 'https://acrescimos.com.br'

const CATEGORY_SLUGS = [
  'brasileirao', 'campeonato-mineiro', 'serie-b', 'copa-do-brasil',
  'libertadores', 'futebol-internacional', 'selecao-brasileira',
  'copa-do-mundo', 'futebol-feminino', 'mercado-da-bola',
  'basquete', 'formula-1', 'tenis', 'volei', 'opiniao', 'geral',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publishedArticles = await getArticles({ published: true })
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'hourly', priority: 1.0 },
    { url: `${BASE_URL}/placar`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/classificacao`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/ranking`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/ao-vivo`, lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
  ]

  const categoryPages: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: `${BASE_URL}/categoria/${slug}`,
    lastModified: now,
    changeFrequency: 'hourly' as const,
    priority: 0.8,
  }))

  // Featured articles get higher priority
  const articlePages: MetadataRoute.Sitemap = publishedArticles.map((article) => ({
    url: `${BASE_URL}/article/${article.slug}`,
    lastModified: new Date(article.updated_at),
    changeFrequency: 'weekly' as const,
    priority: article.featured ? 0.9 : 0.7,
  }))

  return [...staticPages, ...categoryPages, ...articlePages]
}
