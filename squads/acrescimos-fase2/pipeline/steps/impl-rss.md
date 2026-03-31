---
agent: frontend-engineer
execution: inline
model_tier: powerful
---

# RSS Feed

## Objetivo
Criar feed RSS/Atom para que agregadores de noticias possam consumir o conteudo do Acrescimos.

## Instrucoes

1. **Criar** `app/feed.xml/route.ts` (Route Handler):
   - Buscar ultimos 20 artigos publicados do banco
   - Gerar XML RSS 2.0 valido
   - Retornar com Content-Type `application/rss+xml`

   Estrutura RSS:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
     <channel>
       <title>Acréscimos - A Notícia Além do Tempo</title>
       <link>https://acrescimos.com.br</link>
       <description>Portal de notícias esportivas</description>
       <language>pt-br</language>
       <atom:link href="https://acrescimos.com.br/feed.xml" rel="self" type="application/rss+xml"/>
       <item>
         <title>{article.title}</title>
         <link>https://acrescimos.com.br/article/{slug}</link>
         <description>{excerpt}</description>
         <pubDate>{RFC 822 date}</pubDate>
         <guid>https://acrescimos.com.br/article/{slug}</guid>
         <category>{category}</category>
       </item>
     </channel>
   </rss>
   ```

2. **Adicionar** link do RSS no layout:
   - `<link rel="alternate" type="application/rss+xml" title="Acréscimos RSS" href="/feed.xml" />`

3. **Adicionar** link visual do RSS no footer

## Veto Conditions
- XML DEVE ser valido (parseable por qualquer leitor RSS)
- DEVE incluir pelo menos 20 artigos
- Datas DEVEM estar em formato RFC 822
- Content-Type DEVE ser application/rss+xml
