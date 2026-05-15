import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/providers'
import { AppShell } from '@/components/layout/app-shell'

export const metadata: Metadata = {
  title: 'Mission Control Clem',
  description: 'Content creation, research, and video management for Clementine & Astra',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="font-sans antialiased gradient-mesh">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}