---
agent: fullstack-engineer
execution: inline
model_tier: powerful
---

# Pagina 404 Personalizada

## Objetivo
Criar pagina de erro amigavel com sugestoes de artigos e busca.

## Instrucoes

1. **Criar** `app/not-found.tsx` (Next.js App Router convention):
   - Header do site
   - Mensagem amigavel: "Oops! Página não encontrada"
   - Ilustracao ou icone grande (usar emoji ou Lucide icon)
   - Input de busca para o usuario tentar encontrar o que procura
   - Links para artigos recentes/populares (buscar do banco)
   - Links rapidos: Home, Placar, Classificacao
   - Footer do site
   - Design consistente com o site (navy, amarelo)

2. **Metadata**: title "Página não encontrada - Acréscimos"

## Veto Conditions
- DEVE ter busca funcional
- DEVE ter links para paginas principais
- DEVE manter o design system do site
