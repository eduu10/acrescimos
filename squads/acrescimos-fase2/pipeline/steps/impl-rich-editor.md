---
agent: frontend-engineer
execution: inline
model_tier: powerful
---

# Editor de Texto Rico (Tiptap)

## Objetivo
Substituir o textarea simples do admin por um editor WYSIWYG com Tiptap.

## Instrucoes

1. **Instalar** dependencias:
   ```bash
   npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder
   ```

2. **Criar** `components/admin/rich-editor.tsx` (Client Component):
   - Usar `useEditor` do Tiptap
   - Toolbar com: Bold, Italic, Heading (H2, H3), BulletList, OrderedList, Link, Image, Blockquote, HorizontalRule
   - Botoes estilizados com o design system (navy, amarelo)
   - Placeholder "Escreva o conteúdo do artigo..."
   - Exportar HTML via `editor.getHTML()`
   - Importar HTML via `editor.commands.setContent(html)`

3. **Integrar** nas paginas de artigo do admin:
   - `app/admin/articles/new/page.tsx` — substituir textarea por RichEditor
   - `app/admin/articles/[id]/page.tsx` — substituir textarea por RichEditor
   - Ao salvar: enviar HTML do editor como `content`

4. **Estilizar** o editor:
   - Usar classes Tailwind para o container
   - Prose styles para o conteudo renderizado
   - Toolbar fixa no topo do editor

5. **Atualizar** renderizacao na pagina publica de artigos:
   - Em `app/article/[slug]/page.tsx`, detectar se conteudo e HTML
   - Se HTML: renderizar com `dangerouslySetInnerHTML` dentro de div com classes prose
   - Se texto plano: manter renderizacao atual por paragrafos

## Veto Conditions
- Editor DEVE ser Client Component ('use client')
- DEVE suportar no minimo: bold, italic, headings, links, imagens
- NAO pode quebrar artigos existentes (texto plano deve continuar funcionando)
- DEVE usar o design system existente para a toolbar
