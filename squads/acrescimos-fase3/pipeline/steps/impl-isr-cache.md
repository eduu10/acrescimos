---
agent: performance-engineer
execution: inline
model_tier: powerful
---

# Cache ISR nas Paginas

## Objetivo
Implementar Incremental Static Regeneration para reduzir carga no banco e melhorar TTFB.

## Instrucoes

1. **Pagina de artigo** (`app/article/[slug]/page.tsx`):
   - Remover `export const dynamic = 'force-dynamic'`
   - Adicionar `export const revalidate = 300` (5 minutos)
   - Artigos publicados mudam raramente, ISR e ideal

2. **Pagina home** (`app/page.tsx`):
   - Adicionar `export const revalidate = 60` (1 minuto)
   - Home muda com frequencia mas nao precisa ser real-time

3. **Paginas de categoria** (`app/categoria/[slug]/page.tsx`):
   - Adicionar `export const revalidate = 120` (2 minutos)

4. **Placar e classificacao** — manter dynamic (dados ao vivo)

5. **RSS Feed** (`app/feed.xml/route.ts`):
   - Adicionar `export const revalidate = 3600` (1 hora)

## Veto Conditions
- Placar e classificacao NAO devem ter cache (dados ao vivo)
- Artigos devem revalidar em ate 5 minutos
- Home deve revalidar em ate 1 minuto
