'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Quote, Minus } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface RichEditorProps {
  content: string
  onChange: (html: string) => void
  theme?: 'light' | 'dark'
}

function markdownToHtml(text: string): string {
  if (!text) return ''
  // Already HTML — check for real block-level tags
  if (/<(p|h[1-6]|ul|ol|blockquote|div)\b/i.test(text)) return text

  // Normalize line endings
  let s = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // Ensure headings are on their own lines (## inline inside paragraph)
  s = s.replace(/([^\n])(#{1,3} )/g, '$1\n\n$2')

  // Bold: **text**
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  // Italic: *text* (not list markers)
  s = s.replace(/(?<!\n)\*(?!\s)(.+?)(?<!\s)\*/g, '<em>$1</em>')

  // Split into blocks by blank lines
  const blocks = s.split(/\n{2,}/)
  const html: string[] = []

  for (const raw of blocks) {
    const block = raw.trim()
    if (!block) continue

    // H3
    if (/^### (.+)/.test(block)) {
      html.push(`<h3>${block.replace(/^### /, '')}</h3>`)
    // H2
    } else if (/^## (.+)/.test(block)) {
      html.push(`<h2>${block.replace(/^## /, '')}</h2>`)
    // H1
    } else if (/^# (.+)/.test(block)) {
      html.push(`<h2>${block.replace(/^# /, '')}</h2>`)
    // Unordered list
    } else if (/^[\*\-] /m.test(block)) {
      const items = block
        .split('\n')
        .filter(l => /^[\*\-] /.test(l.trim()))
        .map(l => `<li>${l.replace(/^[\*\-] /, '').trim()}</li>`)
        .join('')
      html.push(`<ul>${items}</ul>`)
    // Blockquote
    } else if (/^> /.test(block)) {
      const inner = block.replace(/^> /gm, '')
      html.push(`<blockquote><p>${inner}</p></blockquote>`)
    // Regular paragraph
    } else {
      html.push(`<p>${block.replace(/\n/g, ' ')}</p>`)
    }
  }

  return html.join('\n')
}

export function RichEditor({ content, onChange, theme = 'light' }: RichEditorProps) {
  const isDark = theme === 'dark'
  const lastContent = useRef<string>('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Escreva o conteúdo do artigo...' }),
    ],
    content: markdownToHtml(content),
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML()
      lastContent.current = html
      onChange(html)
    },
  })

  // Re-sync editor when content prop changes externally (e.g. after AI import)
  useEffect(() => {
    if (!editor) return
    const incoming = markdownToHtml(content)
    // Only update if it's a meaningful external change (not our own onChange emission)
    if (incoming && incoming !== lastContent.current && incoming !== editor.getHTML()) {
      lastContent.current = incoming
      editor.commands.setContent(incoming, false)
    }
  }, [content, editor])

  if (!editor) return null

  const ToolbarButton = ({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title: string }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded transition-colors ${
        active
          ? 'bg-[#F2E205] text-[#1B2436]'
          : isDark
          ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  )

  const addLink = () => {
    const url = window.prompt('URL do link:')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  const addImage = () => {
    const url = window.prompt('URL da imagem:')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  const toolbarClass = isDark
    ? 'flex flex-wrap items-center gap-1 p-2 border-b border-gray-600 bg-gray-900'
    : 'flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50'

  const wrapperClass = isDark
    ? 'border border-gray-600 rounded-lg overflow-hidden bg-gray-800'
    : 'border border-gray-200 rounded-lg overflow-hidden bg-white'

  const dividerClass = isDark ? 'w-px h-6 bg-gray-600 mx-1' : 'w-px h-6 bg-gray-200 mx-1'

  const editorClass = isDark
    ? 'prose prose-invert max-w-none p-4 min-h-[300px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-500 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0'
    : 'prose max-w-none p-4 min-h-[300px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px] [&_.ProseMirror]:text-gray-900 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0'

  return (
    <div className={wrapperClass}>
      <div className={toolbarClass}>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Negrito">
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Itálico">
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <div className={dividerClass} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Título H2">
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Subtítulo H3">
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
        <div className={dividerClass} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista">
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista numerada">
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Citação">
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Linha horizontal">
          <Minus className="w-4 h-4" />
        </ToolbarButton>
        <div className={dividerClass} />
        <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="Link">
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Imagem">
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} className={editorClass} />
    </div>
  )
}
