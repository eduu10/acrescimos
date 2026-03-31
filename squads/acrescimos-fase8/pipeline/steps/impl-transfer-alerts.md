# Step: Alertas de Transferências

**Agente:** ⚙️ Automation Engineer

## Objetivo
Monitorar fontes de mercado da bola e gerar artigos automáticos quando transferências são detectadas.

## Tarefas

### 1. Migration: tabela `transfer_alerts`
Arquivo: `scripts/migrate-transfer-alerts.mjs`
```sql
CREATE TABLE IF NOT EXISTS transfer_alerts (
  id SERIAL PRIMARY KEY,
  url TEXT UNIQUE NOT NULL,
  title TEXT,
  player TEXT,
  from_club TEXT,
  to_club TEXT,
  status TEXT DEFAULT 'detected', -- 'detected', 'published', 'skipped'
  article_id INTEGER REFERENCES articles(id),
  detected_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Função `scrapeTransferNews()` em `lib/scrapers.ts`
- Scraping específico de seções de mercado:
  - `https://www.ge.globo.com/futebol/mercado/`
  - `https://www.lance.com.br/mercado-da-bola/`
  - `https://www.espn.com.br/futebol/transferencias/`
- Keywords para detectar transferências: "assina", "contrata", "acerta", "renova", "emprestado", "negocia", "acerto", "fechado"
- Retornar: `{ url, title, player?, fromClub?, toClub? }`

### 3. Cron `/api/cron/transfers`
- Chama `scrapeTransferNews()`
- Filtra URLs já processadas (tabela `transfer_alerts`)
- Para novas transferências: salva na tabela + gera artigo via IA
- Categoria automática: "Mercado da Bola"

### 4. Admin: painel de alertas em `/admin/transfers`
- Lista de transferências detectadas com status
- Botões: "Publicar Artigo", "Pular"
- Badge de quantidade no menu admin lateral
