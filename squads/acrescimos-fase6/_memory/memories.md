# Squad Memory: Acrescimos Fase 6

## Estilo de Escrita
- Tom jornalístico esportivo, PT-BR
- Títulos diretos e informativos

## Design Visual
- Paleta: Navy #1B2436, Amarelo #F2E205
- Componentes com rounded-xl, border border-gray-100 dark:border-gray-700

## Estrutura de Conteúdo
- Enquetes integradas nos artigos após o corpo do texto, antes do share bar
- Ranking usa views como métrica primária (comentários secundário quando disponível)

## Proibições Explícitas
- Nunca usar acrescimos.com — somente acrescimos.com.br
- Não commitar sem deploy (`npx vercel --prod`)

## Técnico (específico do squad)
- Rate limiter: in-memory Map, 1 voto/IP/24h para polls, 5 tentativas/15min para login
- Twitter OAuth 1.0a manual via Node.js crypto (sem lib externa)
- Polls: tabela `polls` no Neon, options como JSONB array
- Power ranking: /ranking page, ISR 300s, baseado em views dos últimos 7 dias
- Fase 6 completada e deployada em 2026-03-31
