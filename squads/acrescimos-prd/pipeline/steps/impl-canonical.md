---
agent: seo-engineer
execution: inline
model_tier: powerful
outputFile: squads/acrescimos-prd/output/seo/canonical-report.md
---

# Implementar Canonical URLs

## Objetivo
Adicionar canonical URLs em todas as paginas para evitar conteudo duplicado.

## Instrucoes

1. **Ler** os arquivos de metadata existentes:
   - `app/layout.tsx`
   - `app/page.tsx`
   - `app/article/[slug]/page.tsx`
   - `app/placar/page.tsx`
   - `app/classificacao/page.tsx`

2. **Adicionar `alternates.canonical`** no metadata de cada pagina:
   - Home (`/`): `https://acrescimos.com.br`
   - Artigo: `https://acrescimos.com.br/article/{slug}`
   - Placar: `https://acrescimos.com.br/placar`
   - Classificacao: `https://acrescimos.com.br/classificacao`

3. **Configurar `metadataBase`** no layout raiz se ainda nao estiver configurado:
   ```typescript
   export const metadata: Metadata = {
     metadataBase: new URL('https://acrescimos.com.br'),
     // ...existing metadata
   }
   ```

## Veto Conditions
- TODAS as paginas publicas devem ter canonical URL
- Canonical URLs devem ser absolutas (com dominio completo)
- metadataBase deve estar configurado no layout raiz
