---
agent: growth-engineer
execution: inline
---

# impl-social-auto-post: Auto-Post no X/Twitter

## Objetivo
Postar automaticamente no X/Twitter quando um artigo é publicado, usando a API do X v2.

## Abordagem: Webhook na publicação de artigo

### 1. Settings no admin (`/admin/settings`)
Adicionar seção "Redes Sociais":
- Campo: `twitter_api_key` (API Key)
- Campo: `twitter_api_secret` (API Key Secret)
- Campo: `twitter_access_token` (Access Token)
- Campo: `twitter_access_secret` (Access Token Secret)
- Toggle: "Postar automaticamente no X/Twitter ao publicar"

### 2. `lib/twitter.ts` — helper para postar tweet
```ts
import crypto from 'crypto';

export async function postTweet(text: string, credentials: TwitterCredentials): Promise<boolean>
```
- Usa OAuth 1.0a para autenticar (X API v2 com User Auth)
- POST para `https://api.twitter.com/2/tweets`
- Body: `{ text: "Título do artigo + URL curta" }`
- Retorna `true` se sucesso, `false` se erro (não deve bloquear a publicação)

### 3. Tweet format
```
{titulo_artigo} 🟨⚽

👉 https://acrescimos.com.br/article/{slug}

#futebol #brasileirao #acrescimos
```
- Máx 280 caracteres — truncar título se necessário

### 4. Integrar na publicação
Em `/api/articles` (POST) e `/api/articles/[id]` (PUT):
- Quando `published: true` (e não era publicado antes), chamar `postTweet()`
- Fire-and-forget: não aguardar resposta para não atrasar o save

### 5. Log de posts
- Salvar resultado em `site_settings` key `last_twitter_post` (timestamp + status)

## Considerações
- Se credenciais não configuradas: skip silencioso
- OAuth 1.0a implementado manualmente (sem biblioteca) para manter zero dependências externas
- Não postar duas vezes o mesmo artigo (checar se já foi postado via campo `tweeted_at` ou via settings)
