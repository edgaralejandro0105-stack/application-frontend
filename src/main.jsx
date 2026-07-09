import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/components/theme-provider'
import AppRouter from './AppRouter'
import { Toaster } from 'sonner'
import '@/src/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <AppRouter />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
