'use client';

import { useState } from 'react';
import { Check, Copy, Link2 } from 'lucide-react';

interface SocialShareBarProps {
  title: string;
  slug: string;
  articleId?: number;
}

const BASE_URL = 'https://acrescimos.com.br';

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.558 4.139 1.535 5.876L.057 23.7a.5.5 0 00.611.611l5.816-1.486A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.952 0-3.775-.541-5.33-1.479l-.38-.228-3.452.882.896-3.456-.243-.388A9.945 9.945 0 012 12C2 6.478 6.478 2 12 2s10 4.478 10 10-4.478 10-10 10z"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.820 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

const SHARE_PLATFORMS = [
  { id: 'whatsapp', label: 'WhatsApp', icon: WhatsAppIcon, color: 'bg-green-500 hover:bg-green-600' },
  { id: 'twitter', label: 'X', icon: XIcon, color: 'bg-black hover:bg-gray-800' },
  { id: 'facebook', label: 'Facebook', icon: FacebookIcon, color: 'bg-blue-600 hover:bg-blue-700' },
  { id: 'telegram', label: 'Telegram', icon: TelegramIcon, color: 'bg-sky-500 hover:bg-sky-600' },
];

export function SocialShareBar({ title, slug, articleId }: SocialShareBarProps) {
  const [copied, setCopied] = useState(false);
  const articleUrl = `${BASE_URL}/article/${slug}`;

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(articleUrl);
    const encodedTitle = encodeURIComponent(title);
    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ⚽ ${articleUrl}`)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title.slice(0, 200)} #futebol #acrescimos`)}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }

    // Track analytics
    if (articleId) {
      fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article_id: articleId, platform, title, slug }),
      }).catch(() => {});
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {SHARE_PLATFORMS.map(({ id, label, icon: Icon, color }) => (
        <button
          key={id}
          onClick={() => handleShare(id)}
          title={`Compartilhar no ${label}`}
          aria-label={`Compartilhar no ${label}`}
          className={`${color} text-white p-2.5 rounded-full transition-all hover:scale-110 active:scale-95 min-w-[40px] min-h-[40px] flex items-center justify-center`}
        >
          <Icon />
        </button>
      ))}
      <button
        onClick={handleCopy}
        title="Copiar link"
        aria-label="Copiar link"
        className={`${copied ? 'bg-[#F2E205] text-[#1B2436]' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'} p-2.5 rounded-full transition-all hover:scale-110 active:scale-95 min-w-[40px] min-h-[40px] flex items-center justify-center`}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
