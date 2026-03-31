---
agent: performance-engineer
execution: inline
model_tier: powerful
---

# Paginacao na Home

## Objetivo
Adicionar botao "Carregar mais" no feed de noticias da home para nao carregar todos os artigos de uma vez.

## Instrucoes

1. **Ler** `components/news-feed.tsx` para entender a renderizacao atual
2. **Criar** `app/api/articles/feed/route.ts`:
   - GET com query params: `page`, `limit` (default 6)
   - Retornar artigos publicados paginados + hasMore boolean

3. **Refatorar** `components/news-feed.tsx`:
   - Carregar apenas 6 artigos inicialmente (Server Component fetch)
   - Adicionar componente Client "LoadMore" que:
     - Botao "Carregar mais notícias"
     - Ao clicar, fetch `/api/articles/feed?page=2`
     - Append novos artigos a lista
     - Esconder botao quando nao ha mais artigos
   - Manter loading state com spinner

4. **Design** do botao:
   - Centralizado, estilo consistente
   - `bg-[#1B2436] text-white hover:bg-[#F2E205] hover:text-[#1B2436]`

## Veto Conditions
- Home DEVE carregar rapido (apenas 6 artigos iniciais)
- Botao DEVE desaparecer quando nao ha mais artigos
- NAO pode quebrar o layout existente da home
