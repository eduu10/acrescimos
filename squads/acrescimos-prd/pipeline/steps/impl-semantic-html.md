---
agent: geo-engineer
execution: inline
model_tier: powerful
outputFile: squads/acrescimos-prd/output/geo/semantic-html-report.md
---

# Implementar HTML Semantico

## Objetivo
Converter o markup dos artigos para HTML semantico rico, melhorando acessibilidade e GEO.

## Instrucoes

1. **Ler** os componentes de artigo:
   - `app/article/[slug]/page.tsx`
   - Componentes relacionados na pasta `components/`

2. **Substituir** elementos genericos por HTML semantico:

   - `<div>` wrapper do artigo → `<article>`
   - `<div>` de secoes → `<section>`
   - `<div>` do sidebar → `<aside>`
   - `<div>` de imagem + legenda → `<figure>` + `<figcaption>`
   - Datas → `<time datetime="ISO8601">`
   - Autor → `<address>` ou `<span>` com itemprop
   - Navegacao de breadcrumb → `<nav aria-label="Breadcrumb">`

3. **Adicionar** atributos de acessibilidade:
   - `role` onde apropriado
   - `aria-label` em navegacoes
   - `alt` descritivo em todas as imagens

4. **Verificar** hierarquia de headings:
   - Apenas um `<h1>` por pagina
   - `<h2>` para secoes principais
   - `<h3>` para sub-secoes
   - Sem pular niveis (h1 → h3 sem h2)

## Veto Conditions
- Pagina de artigo DEVE usar `<article>` como wrapper principal
- TODAS as datas devem usar `<time>` com atributo datetime
- TODAS as imagens devem ter alt text descritivo
- Hierarquia de headings deve ser correta (sem pular niveis)
