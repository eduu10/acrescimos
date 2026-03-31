---
agent: fullstack-engineer
execution: inline
model_tier: powerful
---

# Newsletter — Captura de Email

## Objetivo
Criar sistema de captura de emails para newsletter.

## Instrucoes

1. **Criar** tabela de assinantes (migration script `scripts/migrate-newsletter.mjs`):
   ```sql
   CREATE TABLE IF NOT EXISTS newsletter_subscribers (
     id SERIAL PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     confirmed BOOLEAN DEFAULT false,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. **Adicionar** funcoes no `lib/db.ts`:
   - `subscribeNewsletter(email: string): Promise<boolean>`
   - `getSubscriberCount(): Promise<number>`

3. **Criar** `app/api/newsletter/route.ts`:
   - POST: receber `email`, validar formato, salvar no banco
   - Retornar sucesso ou erro (email ja cadastrado)

4. **Criar** `components/newsletter-form.tsx` (Client Component):
   - Input de email + botao "Inscrever-se"
   - Validacao de formato de email
   - Feedback: sucesso, erro, loading
   - Design: box escuro com amarelo, estilo editorial

5. **Integrar** no footer da home e na pagina de artigo:
   - Antes do footer, adicionar o componente de newsletter
   - "Receba as melhores noticias esportivas no seu email"

## Veto Conditions
- Email DEVE ser validado (formato)
- DEVE ter feedback visual de sucesso/erro
- NAO pode aceitar emails duplicados (retornar mensagem amigavel)
