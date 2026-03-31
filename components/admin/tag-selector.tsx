'use client';

import { useEffect, useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface TagSelectorProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

export function TagSelector({ selectedIds, onChange }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState('');
  const [creating, setCreating] = useState(false);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    fetch('/api/tags')
      .then(res => res.json())
      .then(setTags)
      .catch(() => {});
  }, []);

  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(i => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleCreate = async () => {
    if (!newTag.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTag.trim() }),
      });
      if (res.ok) {
        const tag: Tag = await res.json();
        setTags(prev => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)));
        onChange([...selectedIds, tag.id]);
        setNewTag('');
        setShowInput(false);
      }
    } catch {
      // silently fail
    }
    setCreating(false);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => {
          const active = selectedIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                active
                  ? 'bg-[#F2E205] text-[#1B2436] border-[#F2E205]'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-[#F2E205]'
              }`}
            >
              {active && <X className="w-3 h-3 inline mr-1" />}
              {tag.name}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setShowInput(v => !v)}
          className="px-3 py-1 rounded-full text-xs font-medium border border-dashed border-gray-300 text-gray-400 hover:border-[#F2E205] hover:text-[#1B2436] transition-colors flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Nova tag
        </button>
      </div>

      {showInput && (
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleCreate())}
            placeholder="Nome da tag..."
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#F2E205] focus:border-transparent"
            autoFocus
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !newTag.trim()}
            className="px-3 py-1.5 bg-[#F2E205] text-[#1B2436] rounded-lg text-sm font-bold hover:bg-yellow-300 disabled:opacity-50 flex items-center gap-1"
          >
            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Criar
          </button>
        </div>
      )}
    </div>
  );
}
