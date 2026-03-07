import type { AppProps } from 'next/app'
import { useEffect }     from 'react'
import { useAuthStore }  from '@/store/authStore'
import { useAuthListener } from '@/hooks/useAuthListener'
import BottomNav         from '@/components/BottomNav'
import '@/styles/globals.css'

function ThemeInit() {
  const { setTheme } = useAuthStore()
  useEffect(() => {
    const saved = (localStorage.getItem('wishpr_theme') as 'dark' | 'light') || 'dark'
    setTheme(saved)
  }, [setTheme])
  return null
}

function AppContent({ Component, pageProps }: AppProps) {
  useAuthListener()
  const theme = useAuthStore(s => s.theme)

  useEffect(() => {
    document.body.style.background = theme === 'light' ? '#f2f2fa' : '#0d0d14'
    document.body.style.color      = theme === 'light' ? '#1a1a2e'  : '#f0f0f8'
  }, [theme])

  return (
    <>
      <Component {...pageProps} />
      <BottomNav />
    </>
  )
}

export default function App(props: AppProps) {
  return (
    <>
      <ThemeInit />
      <AppContent {...props} />
    </>
  )
}
