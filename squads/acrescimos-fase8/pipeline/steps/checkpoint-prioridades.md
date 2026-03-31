# Checkpoint: Prioridades da Fase 8

## O que será implementado nesta fase:

1. **Cobertura ao vivo de jogos** — tabela `live_coverage`, API de eventos, página `/ao-vivo/[id]/cobertura` com polling automático
2. **Prévias automáticas** — cron diário que detecta jogos em 24h e gera artigo de prévia com IA
3. **Resumo automático de rodada** — cron pós-rodada que detecta rodada concluída e gera resumo
4. **Alertas de transferências** — scraping de fontes de mercado, detecção de keywords, geração de artigos
5. **Minuto a minuto** — página de cobertura em tempo real com eventos (gol, cartão, substituição) + comentário de IA

## Contexto técnico
- API-Sports já integrada em `/api/football`
- Grok AI já integrado em `/api/generate` e `/api/import-url`
- Cron jobs já existem: `/api/cron/scrape` e `/api/cron/publish-scheduled`
- Scrapers já existem para GE, ESPN, UOL, Lance!, TNT em `lib/scrapers.ts`

## Pergunta para o usuário
Implementar tudo ou priorizar algum item específico?
