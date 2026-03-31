---
agent: security-engineer
execution: inline
---

# impl-rate-limiting: Rate Limiting nas APIs

## Objetivo
Proteger `/api/auth` contra brute force e APIs públicas contra abuso, usando uma solução compatível com Vercel serverless (sem Redis necessário).

## Abordagem: Upstash Rate Limit via KV ou in-memory com IP

No contexto Vercel Hobby sem Redis, usar uma solução simples baseada em headers e Vercel KV (se disponível) ou um middleware de rate limit em memória por IP com Map + timeout.

### 1. `lib/rate-limit.ts` — helper de rate limiting
```ts
// Simple sliding window rate limiter using a Map (resets per cold start)
// For Vercel Hobby: good enough to deter casual brute force
const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const record = attempts.get(key);
  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }
  if (record.count >= maxAttempts) return false; // blocked
  record.count++;
  return true;
}
```

### 2. Aplicar em `/api/auth` (POST — login)
- Key: IP do request (`request.headers.get('x-forwarded-for') || 'unknown'`)
- Limite: 5 tentativas por 15 minutos
- Se bloqueado: retornar 429 com `{ error: 'Muitas tentativas. Tente novamente em 15 minutos.' }`

### 3. Aplicar em `/api/scrape` (POST — admin only, mas proteger mesmo assim)
- Limite: 10 requisições por minuto por IP

### 4. Resposta padronizada 429
```json
{ "error": "Muitas requisições. Aguarde antes de tentar novamente.", "retryAfter": 900 }
```
Com header: `Retry-After: 900`

## Considerações
- A Map é per-instance, não persiste entre cold starts — suficiente para Hobby
- Para produção escalável: migrar para Upstash Redis (1 linha de mudança)
- Não expor qual campo causou o bloqueio (não dizer "senha errada X vezes")
