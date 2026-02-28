'use client';

import { useEffect } from 'react';

export function ArticleTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    // Track page view
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'pageview' }),
    }).catch(() => {});

    // Track article click
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'click', articleId }),
    }).catch(() => {});
  }, [articleId]);

  return null;
}
