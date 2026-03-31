---
agent: scraping-engineer
execution: inline
model_tier: powerful
---

# Implementar Scraping Automatico via Cron

## Objetivo
Criar um endpoint de scraping automatico que roda periodicamente via Vercel Cron.

## Instrucoes

1. **Criar** `app/api/cron/scrape/route.ts`:
   - Endpoint GET protegido por `CRON_SECRET` env var
   - Verificar header `Authorization: Bearer {CRON_SECRET}`
   - Buscar artigos de TODAS as fontes (GE, ESPN, UOL)
   - Para cada artigo nao-scraped encontrado:
     - Reescrever com Grok AI
     - Buscar imagem no Pexels
     - Salvar como rascunho (published: false)
     - Marcar URL como scraped
   - Limitar a 5 artigos por execucao (evitar timeout)
   - Retornar resumo: quantos artigos importados, erros

2. **Criar** `vercel.json` (ou atualizar se existir) com cron config:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/scrape",
         "schedule": "0 */3 * * *"
       }
     ]
   }
   ```
   (A cada 3 horas)

3. **Adicionar** logging basico para monitoramento

## Contexto
- CRON_SECRET deve ser configurado como env var na Vercel
- Vercel Cron limita a 1 execucao por vez
- Timeout maximo de 60s em plano hobby, 300s em pro

## Veto Conditions
- DEVE verificar CRON_SECRET no header Authorization
- DEVE limitar artigos por execucao para evitar timeout
- NAO pode publicar automaticamente (apenas rascunho)
- DEVE ter tratamento de erro por artigo individual
