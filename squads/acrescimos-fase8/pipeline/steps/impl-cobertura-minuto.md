# Step: Página de Cobertura Minuto a Minuto

**Agente:** 📡 Live Engineer

## Objetivo
Página `/ao-vivo/[id]/cobertura` com eventos em tempo real e comentários de IA.

## Tarefas

### 1. Criar `app/ao-vivo/[id]/cobertura/page.tsx`
- Server component com `revalidate = 0`
- Busca dados do jogo via API-Sports (fixture, lineups, events)
- Renderiza `LiveCoverageClient` (client component)

### 2. Criar `components/live-coverage-client.tsx`
- Polling a cada 30s via `setInterval` + `fetch('/api/live-coverage?fixture_id=X')`
- Lista de eventos em ordem cronológica reversa (mais recente no topo)
- Ícones por tipo de evento: ⚽ gol, 🟨 cartão amarelo, 🟥 cartão vermelho, 🔄 substituição, 📺 VAR
- Comentário IA em itálico abaixo de cada evento
- Placar atualizado em destaque no topo
- Auto-scroll para o topo em novo evento

### 3. Link na página `/ao-vivo/[id]`
- Botão "Cobertura ao Vivo" que aparece quando jogo está em andamento (`status=1N` ou `2N`)
- Badge pulsante vermelho "AO VIVO"

### 4. Melhorar `/api/cron/live-poll`
- Para cada evento novo (gol, cartão, substituição):
  - Chamar Grok com contexto do jogo + minuto + evento
  - Prompt: "Comente o evento em 1-2 frases, tom jornalístico esportivo brasileiro"
  - Salvar `ai_comment` na tabela `live_coverage`
