---
agent: content-engineer
execution: inline
---

# impl-power-ranking: Ranking Semanal de Times por IA

## Objetivo
Criar uma página `/ranking` com o power ranking semanal dos times do Brasileirão, gerado por IA com base nos resultados recentes.

## O que implementar

### 1. Página `/ranking`
- Server component com `revalidate = 3600` (1h)
- Título: "Power Ranking — Semana {N}"
- Lista dos top 20 times com:
  - Posição (#1, #2...)
  - Escudo (via API-Sports standings)
  - Nome do time
  - Pontos na tabela
  - Tendência (↑↓ vs semana anterior)
  - Breve análise textual gerada por IA (1-2 frases por time)

### 2. API `/api/ranking`
- GET: retorna o ranking atual (salvo em `site_settings` key `power_ranking`)
- POST (admin): gera novo ranking
  1. Busca tabela do Brasileirão via `/api/football?type=standings&league=71`
  2. Busca últimos 5 jogos de cada time (opcional: via `fixtures?team=X&last=5`)
  3. Envia dados para Groq:
     ```
     "Com base na tabela atual do Brasileirão e nos últimos resultados,
      crie um power ranking dos 10 principais times com uma análise de
      1-2 frases por time justificando sua posição. JSON: 
      [{ position, team, points, trend, analysis }]"
     ```
  4. Salva em `site_settings` key `power_ranking` + `power_ranking_updated_at`

### 3. Admin: botão "Gerar Ranking"
Em `/admin/generate`, nova seção "Power Ranking":
- Botão "Gerar Ranking desta Semana"
- Mostra data da última geração
- Ao gerar: chama POST `/api/ranking`

### 4. Link no menu
- Adicionar link "Ranking" no Header entre "Placar" e "Classificação"

### 5. SEO
- `generateMetadata` com título "Power Ranking Brasileirão — Semana X | Acréscimos"
- JSON-LD `ItemList` com os times

## Design da página
- Cards de time com bordas coloridas (top 3 = dourado/prata/bronze)
- Seta de tendência verde (↑) / vermelha (↓) / cinza (=)
- Texto da análise em itálico abaixo do nome do time
- Layout responsivo: lista única no mobile, grid 2 colunas no desktop
