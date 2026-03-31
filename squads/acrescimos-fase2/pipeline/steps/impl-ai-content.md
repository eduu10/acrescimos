---
agent: scraping-engineer
execution: inline
model_tier: powerful
---

# Geracao de Conteudo Original por IA

## Objetivo
Criar endpoint para gerar artigos 100% originais usando IA (previas de jogos, resumos de rodada).

## Instrucoes

1. **Criar** `app/api/generate/route.ts`:
   - POST protegido por admin cookie
   - Aceitar `type`: "preview" (previa de jogo) ou "roundup" (resumo de rodada)
   - Usar Grok AI para gerar conteudo original

2. **Previa de jogo** (type: "preview"):
   - Receber `team1`, `team2`, `competition`, `date`
   - Buscar dados da API-Sports (classificacao, ultimos jogos)
   - Prompt para IA gerar artigo de previa com:
     - Analise de forma recente dos times
     - Historico de confrontos
     - Provaveis escalacoes
     - Palpite

3. **Resumo de rodada** (type: "roundup"):
   - Receber `competition`, `round`
   - Buscar resultados da rodada via API-Sports
   - Prompt para IA gerar resumo com:
     - Todos os resultados
     - Destaques (goleadas, viradas)
     - Mudancas na classificacao
     - Artilheiro da rodada

4. **Integrar no admin** — Adicionar botao "Gerar conteudo IA" no dashboard admin

## Veto Conditions
- Conteudo gerado DEVE ser factual (baseado em dados reais da API)
- DEVE usar dados da API-Sports, nao inventar resultados
- DEVE salvar como rascunho para revisao antes de publicar
