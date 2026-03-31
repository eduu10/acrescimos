---
agent: growth-engineer
execution: inline
---

# impl-polls: Enquetes nos Artigos

## Objetivo
Adicionar enquetes simples e interativas dentro dos artigos (ex: "Quem ganha o clássico?").

## Schema do banco
```sql
CREATE TABLE polls (
  id SERIAL PRIMARY KEY,
  article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- [{ id: 1, text: "Atlético-MG", votes: 0 }]
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## APIs

### `GET /api/polls?article_id=X`
- Retorna a enquete do artigo (se existir)

### `POST /api/polls`
- Admin: cria enquete `{ article_id, question, options: string[] }`

### `POST /api/polls/[id]/vote`
- Público: vota em uma opção `{ option_id: number }`
- Sem autenticação — 1 voto por IP por enquete (checar via rate limit)
- Incrementa `options[i].votes` no JSONB

## Componente no artigo

`components/article-poll.tsx` (client component):
- Exibe pergunta e opções como botões
- Antes de votar: mostra opções clicáveis
- Após votar: mostra barra de progresso com % de cada opção
- Salva voto no `localStorage` para não votar duas vezes no mesmo device
- Design: cards com cores do portal (navy/amarelo)

## Integração no artigo
Em `app/article/[slug]/page.tsx`:
- Buscar enquete via `getArticlePoll(article.id)`
- Se existir, renderizar `<ArticlePoll poll={poll} />` após o corpo do artigo (antes do share bar)

## Admin: criar enquete
Em `app/admin/articles/[id]/page.tsx`:
- Seção "Enquete" no final do formulário
- Campo de pergunta + até 4 opções
- Botão "Salvar Enquete"
- Se já tem enquete: mostrar resultados atuais

## lib/db.ts
- `createPoll(articleId, question, options[])` 
- `getArticlePoll(articleId)`
- `votePoll(pollId, optionId)` — UPDATE JSONB no array
