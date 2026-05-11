'use client'

import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from 'sonner'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <ThemeProvider attribute="class" forcedTheme="dark">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'rgba(14, 20, 33, 0.95)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#fff',
                borderRadius: '12px',
                fontSize: 'var(--f-base)',
              },
            }}
            theme="dark"
          />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}