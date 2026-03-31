# Step: Resumo Automático de Rodada

**Agente:** ✍️ Content Engineer

## Objetivo
Cron pós-rodada que detecta quando a rodada foi concluída e gera artigo de resumo.

## Tarefas

### 1. Criar `/api/cron/roundup`
- GET `/api/football?type=today` → jogos do dia
- Se todos os jogos da rodada tiverem `status=FT` (full time): gerar resumo
- Verificar se já existe resumo da rodada (evitar duplicar)
- Chamar `/api/generate` com `type=roundup` e dados reais dos resultados

### 2. Melhorar prompt de roundup em `/api/generate/route.ts`
- Incluir todos os resultados da rodada (placares reais)
- Incluir goleador da rodada, time da rodada, jogador em destaque
- Estrutura: introdução, resultados jogo a jogo, destaque da rodada, olho no próximo
- Categoria: Brasileirão / Copa do Brasil / Libertadores baseado na competição

### 3. Adicionar ao `vercel.json`
```json
{ "path": "/api/cron/roundup", "schedule": "0 23 * * *" }
```
Roda às 23h — detecta jogos que terminaram no dia

### 4. Admin: botão manual em `/admin/generate`
- Botão "Gerar Resumo da Rodada Atual"
- Dropdown para escolher competição (Brasileirão, Copa do Brasil, Libertadores)
