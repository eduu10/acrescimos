---
agent: frontend-engineer
execution: inline
model_tier: powerful
---

# Busca Full-Text Funcional

## Objetivo
Implementar busca real de artigos com full-text search do PostgreSQL.

## Instrucoes

1. **Adicionar** funcao no `lib/db.ts`:
   ```typescript
   async function searchArticles(query: string, page: number, limit: number): Promise<{ articles: Article[]; total: number }>
   ```
   - Usar `to_tsvector('portuguese', title || ' ' || content)` e `plainto_tsquery('portuguese', query)`
   - Ordenar por relevancia (ts_rank)
   - Fallback para ILIKE se tsvector nao disponivel

2. **Criar** `app/api/search/route.ts`:
   - GET com query params: `q` (termo), `page`, `limit`
   - Retornar artigos + total

3. **Criar** `app/busca/page.tsx`:
   - Input de busca com form submit
   - Resultados com destaque do termo buscado
   - Paginacao
   - Metadata: "Busca: {termo} - Acréscimos"
   - Estado vazio: sugestoes de categorias

4. **Integrar** busca no header:
   - Icone de lupa no header existente
   - Ao clicar, abre input de busca
   - Ao submeter, redireciona para /busca?q=termo

5. **Criar** indice de busca (migration script):
   ```sql
   CREATE INDEX idx_articles_search ON articles 
   USING gin(to_tsvector('portuguese', title || ' ' || content));
   ```

## Veto Conditions
- DEVE usar full-text search do PostgreSQL (nao LIKE simples)
- DEVE ter paginacao nos resultados
- DEVE integrar com o header existente
