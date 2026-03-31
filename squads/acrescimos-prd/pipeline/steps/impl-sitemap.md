---
agent: seo-engineer
execution: inline
model_tier: powerful
outputFile: squads/acrescimos-prd/output/seo/sitemap-report.md
---

# Implementar sitemap.xml Dinamico

## Objetivo
Criar um sitemap.xml dinamico usando Next.js App Router que lista todos os artigos publicados do banco de dados.

## Instrucoes

1. **Ler** o arquivo `app/layout.tsx` para entender o metadataBase atual
2. **Ler** o arquivo `app/api/articles/route.ts` para entender como artigos sao buscados do banco
3. **Criar** o arquivo `app/sitemap.ts` usando a convencao do Next.js App Router:
   - Importar a conexao com o banco de dados (Neon PostgreSQL)
   - Buscar todos os artigos publicados (published = true)
   - Gerar entradas do sitemap com:
     - URL base: `https://acrescimos.com.br`
     - Paginas estaticas: `/`, `/placar`, `/classificacao`
     - Paginas dinamicas: `/article/{slug}` para cada artigo publicado
     - `lastModified`: usar `updated_at` do artigo
     - `changeFrequency`: 'daily' para home, 'weekly' para artigos
     - `priority`: 1.0 para home, 0.8 para artigos

4. **Verificar** que o arquivo exporta uma funcao `default` do tipo `MetadataRoute.Sitemap`

## Contexto do Projeto
- Database: Neon PostgreSQL com `DATABASE_URL` env var
- Tabela `articles`: id, title, slug, content, image, category, author, published, featured, clicks, created_at, updated_at
- Framework: Next.js 15 App Router
- Dominio: acrescimos.com.br

## Veto Conditions
- O sitemap NAO pode ter URLs hardcoded de artigos
- O sitemap DEVE buscar artigos do banco de dados
- O sitemap DEVE incluir as paginas estaticas (/, /placar, /classificacao)
