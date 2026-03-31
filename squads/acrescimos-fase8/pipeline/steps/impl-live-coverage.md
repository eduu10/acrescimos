# Step: Cobertura ao Vivo — Tabela e API

**Agente:** 📡 Live Engineer

## Objetivo
Criar a infraestrutura de cobertura ao vivo: tabela no banco, API de eventos e polling.

## Tarefas

### 1. Migration: tabela `live_coverage`
Arquivo: `scripts/migrate-live-coverage.mjs`
```sql
CREATE TABLE IF NOT EXISTS live_coverage (
  id SERIAL PRIMARY KEY,
  fixture_id INTEGER NOT NULL,
  minute INTEGER,
  event_type TEXT NOT NULL, -- 'goal', 'card', 'substitution', 'var', 'commentary', 'kickoff', 'halftime', 'fulltime'
  team TEXT,
  player TEXT,
  detail TEXT,
  ai_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_live_coverage_fixture ON live_coverage (fixture_id, created_at DESC);
```

### 2. DB functions em `lib/db.ts`
- `getLiveCoverage(fixtureId): Promise<LiveEvent[]>`
- `addLiveEvent(data): Promise<LiveEvent>`
- `clearLiveCoverage(fixtureId): Promise<void>`

### 3. API `/api/live-coverage`
- GET `?fixture_id=X` → retorna todos os eventos ordenados por minuto
- POST (admin) → adiciona evento manual + gera comentário IA via Grok
- Revalidate = 0

### 4. Cron `/api/cron/live-poll`
- Consulta API-Sports para fixtures `inplay=true`
- Para cada jogo ao vivo: busca eventos novos e persiste
- Gera comentário de IA para cada evento significativo (gol, cartão)
- Executar a cada 1 minuto via Vercel Cron (ou 60s se Hobby plan)
