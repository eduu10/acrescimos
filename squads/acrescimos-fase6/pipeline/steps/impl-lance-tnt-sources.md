---
agent: automation-engineer
execution: inline
---

# impl-lance-tnt-sources: Fontes Lance! e TNT Sports

## Objetivo
Adicionar Lance! e TNT Sports ao `lib/scrapers.ts` seguindo o padrão existente.

## Lance! (`lance.com.br`)
- URL de busca: `https://www.lance.com.br/futebol/`
- Pattern de URLs: `/href="(https:\/\/www\.lance\.com\.br\/[^"]*\/[^"]*\.html)"/g`
- Extração: título via `og:title`, imagem via `og:image`, parágrafos via `<p>` genérico

## TNT Sports (`tntsports.com.br`)
- URL de busca: `https://www.tntsports.com.br/futebol/`
- Pattern de URLs: artigos de futebol
- Extração: OG meta + parágrafos genéricos

## Implementação

### Em `lib/scrapers.ts`:
1. Adicionar funções `scrapeLance()` e `scrapeTNT()` no mesmo padrão de `scrapeESPN()` e `scrapeUOL()`
2. Adicionar ao `scrapers` record em `discoverArticleUrls()`
3. Adicionar suporte a `source: 'lance' | 'tnt'` no tipo

### Em `app/admin/page.tsx`:
- Adicionar opções "Lance!" e "TNT Sports" no dropdown de fontes

### Em `/api/scrape` (POST):
- O tipo já aceita qualquer string — confirmar que passa corretamente para `discoverArticleUrls()`

## Considerações
- Fallback gracioso se fonte retornar 0 URLs (sites às vezes bloqueiam crawlers)
- Manter máximo de 20 URLs por fonte
