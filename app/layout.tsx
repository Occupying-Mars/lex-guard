import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'lexguard',
  description: 'legal contract compliance scanner'
}

const navItems = [
  { href: '/', label: 'overview' },
  { href: '/upload', label: 'upload' },
  { href: '/contracts', label: 'contracts' },
  { href: '/scan', label: 'scan' },
  { href: '/violations', label: 'violations' },
  { href: '/settings', label: 'settings' }
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@400;600&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen gradient-veil">
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6">
          <header className="card mb-6 flex flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-ink/50">lexguard crm</p>
              <p className="h-serif text-lg font-semibold text-ink">contract compliance center</p>
            </div>
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/70 transition hover:border-ink/40"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </header>
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  )
}
