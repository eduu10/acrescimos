'use client'

import { useEffect, useRef, useCallback } from 'react'

let cachedToken: string | null = null

export function useCsrf() {
  const tokenRef = useRef<string | null>(cachedToken)

  useEffect(() => {
    if (tokenRef.current) return

    fetch('/api/csrf')
      .then((res) => res.json())
      .then((data) => {
        tokenRef.current = data.token
        cachedToken = data.token
      })
      .catch(() => {
        // CSRF fetch failed — will retry on next mutation
      })
  }, [])

  const csrfFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      // Refresh token if not cached
      if (!tokenRef.current) {
        const res = await fetch('/api/csrf')
        const data = await res.json()
        tokenRef.current = data.token
        cachedToken = data.token
      }

      const headers = new Headers(options.headers)
      headers.set('x-csrf-token', tokenRef.current || '')

      return fetch(url, { ...options, headers })
    },
    []
  )

  return { csrfFetch, token: tokenRef.current }
}
