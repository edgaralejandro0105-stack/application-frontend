import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/components/theme-provider'
import { QueryProvider } from '@/context/QueryProvider'
import { SocketProvider } from '@/context/SocketContext'
import ErrorBoundary from '@/components/error-boundary'
import AppRouter from './AppRouter'
import { Toaster } from 'sonner'
import '@/src/globals.css'

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      <p className="text-sm text-muted-foreground">Cargando...</p>
    </div>
  </div>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryProvider>
          <AuthProvider>
            <SocketProvider>
              <Suspense fallback={<LoadingFallback />}>
                <AppRouter />
              </Suspense>
              <Toaster richColors position="top-right" />
            </SocketProvider>
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
