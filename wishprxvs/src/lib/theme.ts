import { useAuthStore } from '@/store/authStore'

const DARK = {
  bg:           '#0d0d14',
  card:         'rgba(19,19,30,0.88)',
  cardSolid:    '#13131e',
  border:       '#252535',
  brand:        'linear-gradient(135deg,#7c4dff,#4f46e5)',
  brandSolid:   '#7c4dff',
  text:         '#f0f0f8',
  muted:        '#9898b8',
  faint:        '#55557a',
  input:        'rgba(26,26,40,0.85)',
  navBg:        'rgba(10,10,18,0.96)',
  danger:       '#f87171',
  success:      '#34d399',
  overlay:      'rgba(0,0,0,0.7)',
}

const LIGHT = {
  bg:           '#f2f2fa',
  card:         'rgba(255,255,255,0.95)',
  cardSolid:    '#ffffff',
  border:       '#e0e0f0',
  brand:        'linear-gradient(135deg,#7c4dff,#4f46e5)',
  brandSolid:   '#7c4dff',
  text:         '#1a1a2e',
  muted:        '#5050a0',
  faint:        '#9090b8',
  input:        'rgba(240,240,255,0.9)',
  navBg:        'rgba(242,242,250,0.97)',
  danger:       '#ef4444',
  success:      '#10b981',
  overlay:      'rgba(0,0,0,0.4)',
}

export type StyleTokens = typeof DARK

export function useT(): StyleTokens {
  const theme = useAuthStore(s => s.theme)
  return theme === 'light' ? LIGHT : DARK
}
