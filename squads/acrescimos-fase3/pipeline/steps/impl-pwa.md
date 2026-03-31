---
agent: fullstack-engineer
execution: inline
model_tier: powerful
---

# PWA — Progressive Web App

## Objetivo
Transformar o Acrescimos em PWA com manifest.json e icones para instalacao no celular.

## Instrucoes

1. **Criar** `app/manifest.ts` (Next.js App Router convention):
   ```typescript
   import type { MetadataRoute } from 'next'
   
   export default function manifest(): MetadataRoute.Manifest {
     return {
       name: 'Acréscimos - A Notícia Além do Tempo',
       short_name: 'Acréscimos',
       description: 'Portal de notícias esportivas',
       start_url: '/',
       display: 'standalone',
       background_color: '#1B2436',
       theme_color: '#F2E205',
       icons: [
         { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
         { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
       ],
     }
   }
   ```

2. **Gerar** icones PWA:
   - Criar `public/icon-192.png` e `public/icon-512.png`
   - Usar SVG existente (`app/icon.svg`) como base
   - Se nao for possivel gerar PNG, criar placeholder com fundo navy e "AC" em amarelo

3. **Adicionar** meta tags no layout:
   - `theme-color` meta tag
   - `apple-mobile-web-app-capable`
   - `apple-mobile-web-app-status-bar-style`

## Veto Conditions
- manifest DEVE ter name, short_name, icons, start_url, display
- theme_color DEVE ser #F2E205 (amarelo do brand)
- background_color DEVE ser #1B2436 (navy do brand)
