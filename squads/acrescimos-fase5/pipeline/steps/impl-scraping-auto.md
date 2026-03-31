---
agent: automation-engineer
execution: inline
---

# impl-scraping-auto: Scraping Automático via Cron

## Objetivo
Tornar o scraping do GE Globo totalmente automático, rodando a cada 6h via Vercel Cron, sem precisar de ação manual no painel admin.

## O que implementar

### 1. API route `/api/cron/scrape`
- Método GET com autenticação por `CRON_SECRET` header Bearer
- Busca URLs do GE Globo que ainda não foram scraped (usando `scraped_urls` do settings)
- Para cada URL nova (máx 3 por execução para não exceder timeout do Vercel):
  - Extrai conteúdo (título, imagem, parágrafos)
  - Reescreve com Groq
  - Busca imagem no Pexels
  - Salva como artigo publicado automaticamente
- Retorna JSON com `{ processed: number, errors: string[] }`

### 2. Vercel Cron
- Em `vercel.json`, adicionar cron: `0 */6 * * *` (a cada 6h) → `/api/cron/scrape`
- Atenção: Hobby plan só suporta crons diários. Usar `0 8 * * *` se necessário.

### 3. Log de execução
- Salvar último resultado do cron em `site_settings` com key `last_scrape_result`
- Exibir no admin dashboard: "Último scraping: X artigos em Y"

### 4. Admin settings
- Adicionar toggle "Scraping automático ativo" em `/admin/settings`
- Quando desativado, a API do cron retorna 200 sem processar

## Considerações
- Reutilizar a lógica existente de scraping em `/api/scrape`
- Não duplicar artigos — checar slug antes de salvar
- Timeout máximo do Vercel Serverless: 10s (Hobby) — processar 2-3 artigos por execução
