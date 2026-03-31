---
agent: content-engineer
execution: inline
---

# impl-ai-roundup: Resumo Automático de Rodada

## Objetivo
Após os jogos, gerar automaticamente um artigo de resumo da rodada com resultados, destaques e artilharia.

## O que implementar

### 1. API `/api/generate` — expandir para `type: 'roundup'` (melhorar o existente)
- Receber `{ league_id: number, date?: string }` (default: hoje)
- Buscar todos os jogos do dia/rodada da liga especificada (já encerrados, status FT/AET/PEN)
- Para cada jogo, buscar eventos (gols, cartões) via `/api/football?type=events`
- Gerar resumo com Groq:
  ```
  Prompt: "Escreva um resumo jornalístico da rodada {N} do {campeonato}.
  Resultados: {lista de jogos com placar}.
  Destaques: {artilheiros, assistentes notáveis}.
  Tom: jornalístico esportivo PT-BR. 5-6 parágrafos com subseções."
  ```

### 2. UI no Admin `/admin/generate`
- Adicionar seção "Resumo de Rodada"
- Dropdown de liga (Brasileirão, Copa do Brasil, etc.)
- Seletor de data (default: ontem)
- Botão "Gerar Resumo" → artigo salvo como rascunho

### 3. Estrutura do resumo gerado
- Título: "Rodada {N}: Confira todos os resultados do {Campeonato}"
- Lead com placar de todos os jogos
- Seção "Destaques" com artilheiros
- Seção "Próxima rodada" com próximos confrontos
- Categoria: Brasileirão / Copa do Brasil / Libertadores (automático)

### 4. Cron automático (opcional)
- Cron diário às 23h gera resumo do dia para as ligas ativas
- Salva como rascunho para revisão do admin antes de publicar
