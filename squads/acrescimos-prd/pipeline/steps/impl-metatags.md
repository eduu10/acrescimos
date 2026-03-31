---
agent: seo-engineer
execution: inline
model_tier: powerful
outputFile: squads/acrescimos-prd/output/seo/metatags-report.md
---

# Implementar Meta Tags Completas

## Objetivo
Adicionar Open Graph e Twitter Cards completos em TODAS as paginas publicas (nao apenas artigos).

## Instrucoes

1. **Ler** os metadados atuais de cada pagina publica:
   - `app/page.tsx` (home)
   - `app/article/[slug]/page.tsx` (artigo)
   - `app/placar/page.tsx` (placar)
   - `app/classificacao/page.tsx` (classificacao)

2. **Para cada pagina**, garantir que o metadata inclua:

   **Open Graph:**
   - `openGraph.type`: 'website' (paginas) ou 'article' (artigos)
   - `openGraph.title`: titulo da pagina
   - `openGraph.description`: descricao da pagina
   - `openGraph.url`: URL canonica
   - `openGraph.siteName`: 'Acrescimos'
   - `openGraph.images`: imagem relevante
   - `openGraph.locale`: 'pt_BR'
   - Para artigos: `openGraph.publishedTime`, `openGraph.authors`

   **Twitter Cards:**
   - `twitter.card`: 'summary_large_image'
   - `twitter.title`: titulo
   - `twitter.description`: descricao
   - `twitter.images`: imagem

3. **Verificar** que paginas sem metadata personalizado herdam do layout raiz

## Veto Conditions
- TODAS as 4 paginas publicas devem ter Open Graph completo
- TODAS devem ter Twitter Cards (summary_large_image)
- locale DEVE ser 'pt_BR'
