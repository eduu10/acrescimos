---
agent: fullstack-engineer
execution: inline
model_tier: powerful
---

# Monitoramento — Vercel Analytics + Web Vitals

## Objetivo
Adicionar Vercel Analytics e tracking de Web Vitals.

## Instrucoes

1. **Instalar** Vercel Analytics:
   ```bash
   npm install @vercel/analytics @vercel/speed-insights
   ```

2. **Integrar** no layout raiz (`app/layout.tsx`):
   ```typescript
   import { Analytics } from '@vercel/analytics/next'
   import { SpeedInsights } from '@vercel/speed-insights/next'
   
   // Dentro do body:
   <Analytics />
   <SpeedInsights />
   ```

3. **Verificar** que nao duplica scripts

## Veto Conditions
- DEVE usar imports oficiais da Vercel
- NAO pode impactar performance (scripts sao lazy por padrao)
