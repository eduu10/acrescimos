---
agent: performance-engineer
execution: inline
---

# impl-amp-pages: Versões AMP dos Artigos

## Objetivo
Criar versões AMP (Accelerated Mobile Pages) de cada artigo para carregamento instantâneo no Google, aumentando CTR e visibilidade no Discover.

## O que implementar

### 1. Rota `/amp/article/[slug]`
- Server component (sem 'use client')
- HTML estático válido AMP
- `<html ⚡>` ou `<html amp>`

### 2. Estrutura HTML AMP obrigatória
```html
<!doctype html>
<html ⚡ lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <link rel="canonical" href="https://acrescimos.com.br/article/{slug}">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <style amp-boilerplate>...</style>
  <noscript><style amp-boilerplate>...</style></noscript>
  <style amp-custom>
    /* CSS customizado — máx 75KB */
    /* Paleta: navy #1B2436, amarelo #F2E205 */
  </style>
  <!-- JSON-LD NewsArticle -->
</head>
<body>
  <!-- Header simples com logo -->
  <!-- amp-img para imagem hero -->
  <!-- Conteúdo do artigo -->
  <!-- Footer simples -->
</body>
</html>
```

### 3. Imagem AMP
- Usar `<amp-img>` em vez de `<img>` ou `next/image`
- Atributos obrigatórios: `src`, `width`, `height`, `layout="responsive"`, `alt`

### 4. Link canonical ↔ AMP
- Na página principal `/article/[slug]`: adicionar `<link rel="amphtml" href="/amp/article/{slug}">`
- Na página AMP: `<link rel="canonical" href="/article/{slug}">`
- Adicionar no `generateMetadata` do artigo: `alternates: { types: { 'application/vnd.amp.html': ampUrl } }`

### 5. CSS AMP customizado
- Mínimo necessário para legibilidade
- Cores do portal: navy, amarelo
- Fonte: system-ui (sem Google Fonts — evita script externo)
- Responsivo

### 6. Conteúdo AMP
- Título (h1)
- Autor, data, tempo de leitura
- Imagem hero (amp-img)
- Corpo do artigo (HTML sanitizado — sem scripts, iframes)
- Link "Ler versão completa" → `/article/{slug}`

## Considerações
- NÃO usar next/image, Link, ou qualquer componente React com JS no AMP
- O AMP exige HTML puro — sem useState, useEffect, etc.
- Validar em https://validator.ampproject.org/
- Não incluir Google Analytics no AMP (usar amp-analytics se necessário)
