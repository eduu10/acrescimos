---
agent: frontend-engineer
execution: inline
model_tier: powerful
---

# Paginas de Categoria com Paginacao

## Objetivo
Criar paginas de listagem por categoria em `/categoria/[slug]` com paginacao.

## Instrucoes

1. **Adicionar** funcao no `lib/db.ts`:
   ```typescript
   async function getArticlesByCategory(category: string, page: number, limit: number): Promise<{ articles: Article[]; total: number }>
   ```

2. **Criar** `app/categoria/[slug]/page.tsx`:
   - Server Component com metadata dinamico
   - Mapear slug para nome da categoria (brasileirao → Brasileirão)
   - Listar artigos publicados da categoria
   - Paginacao com query param `?page=2`
   - 12 artigos por pagina
   - Cards no estilo do design system existente
   - Breadcrumb: Home > Categoria
   - Se categoria nao existe: notFound()

3. **Metadata SEO** para cada categoria:
   - Title: "{Categoria} - Acréscimos"
   - Description dinamica
   - Canonical URL
   - Open Graph completo

4. **Componente de paginacao** `components/pagination.tsx`:
   - Botoes Anterior/Proximo
   - Indicador de pagina atual
   - Estilo consistente com o design system

5. **Adicionar** links de categoria no header e footer

## Categorias existentes
Brasileirão, Futebol Internacional, Copa do Brasil, Libertadores, Basquete, Fórmula 1, Tênis, Vôlei, Mercado da Bola, Opinião, Geral

## Veto Conditions
- DEVE ter metadata SEO completo
- DEVE ter paginacao funcional
- DEVE usar o design system existente (cores, fontes, cards)
- URL slug DEVE ser amigavel (brasileirao, nao brasileirão)
