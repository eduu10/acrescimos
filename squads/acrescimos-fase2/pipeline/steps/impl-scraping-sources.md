---
agent: scraping-engineer
execution: inline
model_tier: powerful
---

# Adicionar Fontes de Scraping (ESPN + UOL)

## Objetivo
Refatorar o endpoint de scraping para suportar multiplas fontes alem do GE Globo.

## Instrucoes

1. **Ler** `app/api/scrape/route.ts` para entender o fluxo atual
2. **Criar** `lib/scrapers.ts` com funcoes separadas por fonte:

   ```typescript
   interface ScrapedArticle {
     title: string
     content: string
     image: string
     url: string
     source: string
   }
   
   async function scrapeGE(): Promise<ScrapedArticle[]>
   async function scrapeESPN(): Promise<ScrapedArticle[]>
   async function scrapeUOL(): Promise<ScrapedArticle[]>
   ```

3. **ESPN Brasil** (`espn.com.br`):
   - Buscar homepage `https://www.espn.com.br/`
   - Extrair URLs de artigos com pattern de noticias ESPN
   - Extrair titulo (og:title), imagem (og:image), conteudo (paragrafos)

4. **UOL Esporte** (`uol.com.br/esporte`):
   - Buscar `https://www.uol.com.br/esporte/futebol/`
   - Extrair URLs de artigos
   - Extrair titulo, imagem, conteudo

5. **Refatorar** `app/api/scrape/route.ts`:
   - Aceitar parametro `source` (ge, espn, uol, all)
   - Default: `all` (tenta todas as fontes em ordem)
   - Manter fluxo existente de reescrita por IA e preview

## Veto Conditions
- DEVE manter compatibilidade com o fluxo existente do GE
- Cada scraper DEVE ter User-Agent e headers adequados
- DEVE ter tratamento de erro por fonte (uma fonte falhando nao deve travar as outras)
