# Step: Prévias Automáticas

**Agente:** ✍️ Content Engineer

## Objetivo
Cron que roda diariamente, detecta jogos nas próximas 24h e gera artigo de prévia para cada um.

## Tarefas

### 1. Atualizar `/api/cron/scrape` ou criar `/api/cron/previews`
- GET `/api/football?type=upcoming&league=71&next=5` → jogos do Brasileirão nas próximas 24h
- Para cada jogo: verificar se já existe artigo de prévia (buscar por slug `previa-{team1}-x-{team2}`)
- Se não existe: chamar `/api/generate` com `type=preview`

### 2. Melhorar o prompt de prévia em `/api/generate/route.ts`
- Incluir dados de forma dos times (últimos 5 jogos da API-Sports)
- Incluir confronto direto (head2head endpoint)
- Incluir artilheiro da competição
- Prompt estruturado: introdução, contexto da competição, forma recente, confronto direto, expectativa

### 3. Adicionar ao `vercel.json` (cron)
```json
{ "path": "/api/cron/previews", "schedule": "0 8 * * *" }
```
Roda todo dia às 8h — detecta jogos do dia + amanhã

### 4. Admin: botão manual em `/admin/generate`
- Seção "Prévias do Dia" já existe parcialmente
- Adicionar botão "Gerar Todas as Prévias de Amanhã"
