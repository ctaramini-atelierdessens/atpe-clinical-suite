import type { Metadata } from 'next'
import './globals.css'
import { AppNavigation } from '@/components/app-navigation'

export const metadata: Metadata = {
  title: 'ATPE Clinical Suite',
  description: 'Suite clinique ATPE',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
          <div className="lg:block">
            <AppNavigation />
          </div>

          <div className="min-w-0">{children}</div>
        </div>
      </body>
    </html>
  )
}