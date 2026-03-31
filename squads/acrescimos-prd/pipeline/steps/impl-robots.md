---
agent: seo-engineer
execution: inline
model_tier: powerful
outputFile: squads/acrescimos-prd/output/seo/robots-report.md
---

# Implementar robots.txt

## Objetivo
Criar um robots.txt usando Next.js App Router que permite crawlers e aponta para o sitemap.

## Instrucoes

1. **Criar** o arquivo `app/robots.ts` usando a convencao do Next.js App Router:
   - Permitir todos os user agents (`*`)
   - Bloquear `/admin/*` e `/api/*` de crawling
   - Apontar para o sitemap: `https://acrescimos.com.br/sitemap.xml`

2. O arquivo deve exportar uma funcao `default` do tipo `MetadataRoute.Robots`

## Contexto do Projeto
- Framework: Next.js 15 App Router
- Dominio: acrescimos.com.br
- Rotas admin: /admin/*
- Rotas API: /api/*

## Veto Conditions
- DEVE bloquear /admin/* e /api/* de crawling
- DEVE incluir referencia ao sitemap.xml
- DEVE permitir crawling das paginas publicas
