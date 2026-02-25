'use client'

import { useEffect, useState } from 'react'

export default function ApiKeyPrompt() {
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    const key = window.localStorage.getItem('openrouter_api_key')
    setMissing(!key)
  }, [])

  if (!missing) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-ink">openrouter key required</h2>
        <p className="mt-2 text-sm text-ink/70">
          add your key in settings. it stays in your browser and is sent only to openrouter.
        </p>
        <a
          href="/settings"
          className="mt-4 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper"
        >
          go to settings
        </a>
      </div>
    </div>
  )
}
