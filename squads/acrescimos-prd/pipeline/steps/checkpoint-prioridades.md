---
type: checkpoint
---

# Checkpoint: Prioridades da Fase 1

Vamos implementar a **Fase 1 do PRD** do Acrescimos. Esta fase cobre SEO/GEO avancado e Seguranca.

## Itens a implementar:

### SEO (🔍 SEO Engineer)
1. **sitemap.xml dinamico** — Gerar sitemap com todos os artigos publicados
2. **robots.txt** — Configurar para crawlers e apontar para sitemap
3. **Structured Data (JSON-LD)** — NewsArticle, Organization, WebSite, BreadcrumbList
4. **Canonical URLs** — Em todas as paginas
5. **Meta tags completas** — Twitter Cards e Open Graph em todas as paginas

### GEO (🤖 GEO Engineer)
6. **FAQ Schema** — FAQPage schema nos artigos
7. **HTML Semantico** — article, section, aside, figure, figcaption, time

### Seguranca (🔒 Security Engineer)
8. **Hash de senhas (bcrypt)** — Substituir texto plano por bcrypt
9. **Rate limiting no login** — Prevenir brute force
10. **CSRF protection** — Tokens CSRF nos formularios admin

Deseja prosseguir com todos os itens ou selecionar apenas alguns?

1. Implementar todos os itens da Fase 1
2. Apenas SEO e GEO (pular seguranca)
3. Apenas Seguranca (pular SEO/GEO)
