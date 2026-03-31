---
agent: security-engineer
execution: inline
model_tier: powerful
outputFile: squads/acrescimos-prd/output/security/bcrypt-report.md
---

# Implementar Hash de Senhas com bcrypt

## Objetivo
Substituir o armazenamento de senhas em texto plano por hash bcrypt. SEVERIDADE: CRITICO.

## Instrucoes

1. **Instalar** bcrypt:
   ```bash
   npm install bcrypt
   npm install -D @types/bcrypt
   ```

2. **Ler** os seguintes arquivos:
   - `app/api/auth/route.ts` (endpoint de login)
   - `scripts/setup-db.mjs` (script de setup que cria admin padrao)

3. **Modificar o endpoint de login** (`app/api/auth/route.ts`):
   - Importar bcrypt
   - Substituir comparacao direta de senha por `bcrypt.compare()`
   - Manter o restante da logica de cookie intacta

4. **Modificar o script de setup** (`scripts/setup-db.mjs`):
   - Usar `bcrypt.hash()` com SALT_ROUNDS = 12 ao criar admin padrao
   - A senha padrao deve ser hasheada antes de inserir no banco

5. **Criar script de migracao** `scripts/migrate-passwords.mjs`:
   - Buscar todos os admin_users com senhas em texto plano
   - Hashear cada senha com bcrypt (SALT_ROUNDS = 12)
   - Atualizar no banco
   - Logar progresso

## Contexto
- Tabela: `admin_users` com campos: id, username, password
- Atualmente senhas sao comparadas diretamente: `password === storedPassword`
- Cookie: `admin_token` (base64, 24h expiracao)

## Veto Conditions
- SALT_ROUNDS DEVE ser >= 12
- Endpoint de login DEVE usar bcrypt.compare()
- Script de setup DEVE hashear a senha padrao
- NAO pode quebrar o fluxo de login existente
