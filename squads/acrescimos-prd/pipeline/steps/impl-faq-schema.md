---
agent: geo-engineer
execution: inline
model_tier: powerful
outputFile: squads/acrescimos-prd/output/geo/faq-schema-report.md
---

# Implementar FAQ Schema para GEO

## Objetivo
Adicionar FAQPage schema (JSON-LD) nas paginas de artigos para melhorar visibilidade em AI Overviews e featured snippets.

## Instrucoes

1. **Ler** a pagina de artigo: `app/article/[slug]/page.tsx`

2. **Criar** componente `components/faq-schema.tsx`:
   - Receber array de perguntas e respostas como props
   - Gerar JSON-LD FAQPage valido:
     ```json
     {
       "@context": "https://schema.org",
       "@type": "FAQPage",
       "mainEntity": [
         {
           "@type": "Question",
           "name": "{pergunta}",
           "acceptedAnswer": {
             "@type": "Answer",
             "text": "{resposta}"
           }
         }
       ]
     }
     ```

3. **Gerar FAQs automaticamente** baseado no conteudo do artigo:
   - Criar funcao `generateArticleFAQs(article)` que extrai/gera 3-5 perguntas relevantes
   - Perguntas baseadas em: titulo, categoria, conteudo
   - Exemplos: "Quando sera o proximo jogo do {time}?", "Qual a classificacao do {time} no Brasileirao?"

4. **Integrar** o componente na pagina de artigo

## Veto Conditions
- FAQPage DEVE ter pelo menos 3 perguntas
- Perguntas devem ser relevantes ao conteudo do artigo
- JSON-LD DEVE ser valido
- NAO pode ter perguntas genericas identicas para todos os artigos
