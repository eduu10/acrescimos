---
agent: frontend-engineer
execution: inline
model_tier: powerful
---

# Sistema de Tags

## Objetivo
Implementar sistema de tags para artigos com tabelas no banco, UI no admin e paginas publicas.

## Instrucoes

1. **Criar** script de migracao `scripts/migrate-tags.mjs`:
   ```sql
   CREATE TABLE IF NOT EXISTS tags (
     id SERIAL PRIMARY KEY,
     name TEXT UNIQUE NOT NULL,
     slug TEXT UNIQUE NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   CREATE TABLE IF NOT EXISTS article_tags (
     article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
     tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
     PRIMARY KEY (article_id, tag_id)
   );
   
   CREATE INDEX idx_article_tags_article ON article_tags(article_id);
   CREATE INDEX idx_article_tags_tag ON article_tags(tag_id);
   ```

2. **Adicionar** funcoes no `lib/db.ts`:
   - `getTags()`: listar todas as tags
   - `getTagBySlug(slug)`: buscar tag por slug
   - `createTag(name)`: criar tag (gerar slug automatico)
   - `getArticleTags(articleId)`: tags de um artigo
   - `setArticleTags(articleId, tagIds[])`: definir tags de um artigo
   - `getArticlesByTag(tagSlug, page, limit)`: artigos de uma tag

3. **Criar** `app/tag/[slug]/page.tsx`:
   - Listar artigos da tag com paginacao
   - Metadata SEO completo
   - Design consistente com paginas de categoria

4. **Integrar no admin** de artigos:
   - Input de tags com autocomplete no formulario de criar/editar
   - Tags como chips removiveis

5. **Seed** tags iniciais: Atlético-MG, Cruzeiro, América-MG, Série A, Série B, Seleção Brasileira, Champions League, Premier League

## Veto Conditions
- Tabelas DEVEM ter ON DELETE CASCADE
- Tags DEVEM ter slug unico
- DEVE ter pagina publica por tag com SEO
