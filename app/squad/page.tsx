'use client'

import { useEffect, useRef } from 'react'

export default function SquadPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Prevent parent styles from leaking
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <iframe
      ref={iframeRef}
      src="/squad/index.html"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        border: 'none',
        margin: 0,
        padding: 0,
      }}
      title="Squad Dashboard"
    />
  )
}
