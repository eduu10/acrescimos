---
agent: automation-engineer
execution: inline
---

# impl-espn-uol-sources: Fontes ESPN Brasil e UOL Esporte

## Objetivo
Diversificar as fontes de scraping para além do GE Globo, adicionando ESPN Brasil e UOL Esporte.

## O que implementar

### 1. Adaptar `/api/scrape` para múltiplas fontes
- Adicionar parâmetro `?source=ge|espn|uol` (default: `ge`)
- Cada fonte tem sua própria lógica de extração de URLs e conteúdo

### 2. ESPN Brasil (`espn.com.br/futebol`)
- URL de busca: `https://www.espn.com.br/futebol/`
- Extrair links de artigos via seletor CSS (h1 a, h2 a com href `/futebol/historia/`)
- Extração de conteúdo: título via `h1`, parágrafos via `article p`, imagem via `og:image`

### 3. UOL Esporte (`esporte.uol.com.br`)
- URL de busca: `https://esporte.uol.com.br/futebol/`
- Extrair links de artigos mais recentes
- Extração similar: título OG, parágrafos, imagem OG

### 4. Admin UI
- Em `/admin/settings`, seção "Fontes de Scraping":
  - Checkboxes: [x] GE Globo  [ ] ESPN Brasil  [ ] UOL Esporte
  - Salvar seleção em `site_settings` key `scraping_sources`
- O cron automático respeita as fontes ativas

### 5. Scraping manual
- Em `/admin` (dashboard), adicionar selector de fonte no formulário de scraping manual
- Dropdown: "Fonte: GE Globo / ESPN Brasil / UOL Esporte"

## Considerações
- Fallback gracioso se uma fonte estiver inacessível
- Rate limiting: máx 1 requisição por fonte por execução do cron
- Respeitar robots.txt das fontes
