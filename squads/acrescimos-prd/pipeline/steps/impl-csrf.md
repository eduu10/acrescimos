---
agent: security-engineer
execution: inline
model_tier: powerful
outputFile: squads/acrescimos-prd/output/security/csrf-report.md
---

# Implementar CSRF Protection

## Objetivo
Adicionar protecao CSRF nos formularios e endpoints do painel administrativo.

## Instrucoes

1. **Ler** os arquivos relevantes:
   - `app/api/auth/route.ts`
   - `app/admin/layout.tsx`
   - `middleware.ts` (se existir)

2. **Criar** utilitario CSRF em `lib/csrf.ts`:
   - Funcao `generateCsrfToken()`: gerar token aleatorio com `crypto.randomUUID()`
   - Funcao `validateCsrfToken(token: string, cookieToken: string): boolean`
   - Pattern: Double Submit Cookie
     - Token armazenado em cookie httpOnly (`csrf_token`)
     - Mesmo token enviado no header `X-CSRF-Token` ou body do formulario
     - Validar que ambos sao iguais

3. **Criar** endpoint `/api/csrf` (GET):
   - Gerar novo token
   - Setar cookie `csrf_token` (httpOnly, secure, sameSite: 'strict')
   - Retornar token no body para o frontend usar

4. **Integrar** nos endpoints admin (POST/PUT/DELETE):
   - Verificar CSRF token em todas as mutacoes do admin
   - Se invalido: retornar 403 Forbidden

5. **Criar** hook React `hooks/use-csrf.ts`:
   - Buscar token do endpoint `/api/csrf` ao montar
   - Incluir header `X-CSRF-Token` em todas as requests de mutacao

## Veto Conditions
- Token DEVE ser gerado com crypto seguro (crypto.randomUUID ou equivalente)
- Cookie csrf_token DEVE ser httpOnly e sameSite strict
- TODOS os endpoints de mutacao do admin devem validar CSRF
- NAO pode quebrar funcionalidades existentes do admin
