'use client'

import { useState } from 'react'
import ApiKeyPrompt from '@/components/ApiKeyPrompt'

export default function UploadPage() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [status, setStatus] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [rawText, setRawText] = useState('')

  async function handleUpload() {
    if (!files?.length && !rawText.trim()) return

    const key = window.localStorage.getItem('openrouter_api_key')
    const model = window.localStorage.getItem('openrouter_model') || 'anthropic/claude-3-haiku'
    const esUrl = window.localStorage.getItem('es_url') || ''
    const esKey = window.localStorage.getItem('es_key') || ''
    if (!key) {
      setStatus('missing openrouter key')
      return
    }

    setStatus('uploading...')
    const uploads = files?.length ? Array.from(files) : [null]
    const nextResults: any[] = []

    for (const file of uploads) {
      const form = new FormData()
      if (file) form.append('file', file)
      if (!file && rawText.trim()) form.append('raw_text', rawText)

      const res = await fetch('/api/contracts/upload', {
        method: 'POST',
        headers: {
          'x-openrouter-key': key,
          'x-openrouter-model': model,
          ...(esUrl ? { 'x-es-url': esUrl } : {}),
          ...(esKey ? { 'x-es-key': esKey } : {})
        },
        body: form
      })

      const raw = await res.text()
      let json: any = null
      try {
        json = raw ? JSON.parse(raw) : null
      } catch {
        json = { error: raw || 'upload failed' }
      }
      if (!res.ok) {
        setStatus(json?.error || 'upload failed')
        return
      }

      nextResults.push(json)
    }

    setResults(nextResults)
    setStatus('done')
  }

  return (
    <main className="flex flex-col gap-6">
      <ApiKeyPrompt />
      <section className="card p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/50">intake</p>
        <h1 className="mt-3 text-2xl font-semibold text-ink">upload contracts</h1>
        <p className="mt-2 text-sm text-ink/70">
          pdfs are parsed with `pdf-parse`. if a scan fails, paste text and keep moving.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="block w-full rounded-2xl border border-ink/10 bg-white p-4 text-sm"
            />
            <textarea
              placeholder="paste contract text if pdf extraction fails"
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full rounded-2xl border border-ink/10 bg-white p-4 text-sm"
            />
            <button
              onClick={handleUpload}
              className="rounded-full bg-ink px-6 py-2 text-sm font-semibold text-paper"
            >
              upload & extract
            </button>
            {status ? <p className="text-sm text-ink/70">{status}</p> : null}
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white/80 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">what happens</p>
            <ol className="mt-4 space-y-3 text-sm text-ink/70">
              <li>1. pdf parsed or text pasted.</li>
              <li>2. openrouter extracts structured fields + clauses.</li>
              <li>3. document indexed into elasticsearch.</li>
              <li>4. ready for compliance scan.</li>
            </ol>
          </div>
        </div>
      </section>

      {results.length ? (
        <section className="card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-ink/50">latest ingestion</p>
          <div className="mt-4 space-y-4">
            {results.map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-ink/10 bg-white p-5">
                <p className="text-sm font-semibold text-ink">contract id: {item.contract_id}</p>
                <pre className="mt-4 whitespace-pre-wrap text-xs text-ink/70">
                  {JSON.stringify(item.extracted, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}
