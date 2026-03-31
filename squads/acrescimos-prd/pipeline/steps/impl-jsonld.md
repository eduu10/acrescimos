---
agent: seo-engineer
execution: inline
model_tier: powerful
outputFile: squads/acrescimos-prd/output/seo/jsonld-report.md
---

# Implementar Structured Data (JSON-LD)

## Objetivo
Adicionar Schema.org JSON-LD em paginas relevantes para rich snippets no Google.

## Instrucoes

1. **Ler** os seguintes arquivos para entender a estrutura atual:
   - `app/layout.tsx` (layout raiz)
   - `app/page.tsx` (home)
   - `app/article/[slug]/page.tsx` (pagina de artigo)

2. **Criar** componente `components/json-ld.tsx` reutilizavel que renderiza `<script type="application/ld+json">`:
   - Aceitar qualquer schema como props
   - Serializar com `JSON.stringify`

3. **Implementar schemas**:

   a. **Organization** (layout.tsx ou page.tsx da home):
      ```json
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Acrescimos",
        "url": "https://acrescimos.com.br",
        "logo": "https://acrescimos.com.br/icon.svg",
        "sameAs": []
      }
      ```

   b. **WebSite com SearchAction** (home):
      ```json
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Acrescimos",
        "url": "https://acrescimos.com.br",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://acrescimos.com.br/busca?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
      ```

   c. **NewsArticle** (pagina de artigo):
      ```json
      {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": "{title}",
        "image": "{image}",
        "datePublished": "{created_at}",
        "dateModified": "{updated_at}",
        "author": { "@type": "Person", "name": "{author}" },
        "publisher": {
          "@type": "Organization",
          "name": "Acrescimos",
          "logo": { "@type": "ImageObject", "url": "https://acrescimos.com.br/icon.svg" }
        },
        "description": "{excerpt}",
        "mainEntityOfPage": { "@type": "WebPage", "@id": "https://acrescimos.com.br/article/{slug}" }
      }
      ```

   d. **BreadcrumbList** (pagina de artigo):
      ```json
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://acrescimos.com.br" },
          { "@type": "ListItem", "position": 2, "name": "{category}", "item": "https://acrescimos.com.br/categoria/{category-slug}" },
          { "@type": "ListItem", "position": 3, "name": "{title}" }
        ]
      }
      ```

## Veto Conditions
- DEVE incluir todos os 4 schemas: Organization, WebSite, NewsArticle, BreadcrumbList
- JSON-LD DEVE ser valido (parseable por JSON.parse)
- NewsArticle DEVE ter todos os campos obrigatorios do Google (headline, image, datePublished, author, publisher)
