---
agent: security-engineer
execution: inline
model_tier: powerful
outputFile: squads/acrescimos-prd/output/security/rate-limit-report.md
---

# Implementar Rate Limiting no Login

## Objetivo
Proteger o endpoint de login contra ataques de forca bruta com rate limiting.

## Instrucoes

1. **Ler** o endpoint de login: `app/api/auth/route.ts`

2. **Criar** rate limiter em `lib/rate-limiter.ts`:
   - Implementar sliding window rate limiter in-memory
   - Configuracao: max 5 tentativas por IP a cada 15 minutos
   - Usar Map<string, { count: number, resetAt: number }>
   - Funcao `checkRateLimit(ip: string): { allowed: boolean, retryAfter: number }`
   - Limpar entradas expiradas periodicamente

3. **Integrar** no endpoint de login:
   - Extrair IP do request (headers x-forwarded-for ou x-real-ip)
   - Verificar rate limit ANTES de verificar credenciais
   - Se excedido: retornar 429 com header `Retry-After`
   - Se permitido: prosseguir com login normal
   - Incrementar contador apenas em tentativas de login (sucesso ou falha)

4. **NAO usar** bibliotecas externas — implementar in-memory para simplicidade no Vercel

## Veto Conditions
- DEVE retornar status 429 quando rate limit excedido
- DEVE incluir header Retry-After na resposta 429
- Limite DEVE ser por IP, nao global
- NAO pode bloquear requests legitimos apos login bem-sucedido
