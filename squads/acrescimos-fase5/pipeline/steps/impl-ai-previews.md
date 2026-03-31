---
agent: content-engineer
execution: inline
---

# impl-ai-previews: Geração Automática de Prévias de Jogos

## Objetivo
Gerar automaticamente artigos de prévia antes de cada rodada, usando dados da API-Sports + Groq.

## O que implementar

### 1. API `/api/generate` — expandir para `type: 'preview-auto'`
- Recebe `{ fixture_id: number }` — ID do jogo da API-Sports
- Busca dados do jogo: times, liga, rodada, histórico de confrontos
- Gera artigo de prévia com Groq:
  ```
  Prompt: "Escreva uma prévia jornalística do jogo {timeA} x {timeB} pela {liga}.
  Mencione a importância do jogo, momento dos times e o que esperar.
  Tom: jornalístico esportivo PT-BR. 4-5 parágrafos."
  ```
- Salva como rascunho (published: false) com categoria correta

### 2. UI no Admin `/admin/generate`
- Adicionar seção "Prévia de Jogo"
- Campo de busca por time/liga para encontrar próximos jogos
- Lista de fixtures dos próximos 3 dias (via API-Sports `type=upcoming`)
- Botão "Gerar Prévia" por jogo → chama a API → redireciona para edição do rascunho

### 3. API `/api/football` — adicionar `type=upcoming`
- `fixtures?next=10` da API-Sports — próximos 10 jogos
- Filtrar por ligas brasileiras (ID 71 Brasileirão, 72 Copa do Brasil, 13 Libertadores)

### 4. Geração em lote (opcional)
- Botão "Gerar todas as prévias da rodada" — gera prévias para todos os jogos do dia seguinte

## Estrutura do artigo gerado
- Título: "Preview: {TimeA} x {TimeB} — {Liga} {Rodada}"
- Categoria: detectada automaticamente (Brasileirão, Copa do Brasil, etc.)
- Imagem: buscada no Pexels com "{TimeA} {TimeB} futebol"
- Slug: gerado automaticamente do título
