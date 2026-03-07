import Head                      from 'next/head'
import Link                      from 'next/link'
import { useRouter }             from 'next/router'
import { useEffect, useState }  from 'react'
import { motion }                from 'framer-motion'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
}                                from 'firebase/auth'
import { auth }                  from '@/lib/firebase'
import { ROUTES }                from '@/constants/routes'
import { useAuthStore }          from '@/store/authStore'
import { Ghost, Eye, EyeOff }    from 'lucide-react'

const S = {
  bg: '#0d0d14', card: 'rgba(19,19,30,0.92)', border: 'rgba(37,37,53,0.8)',
  input: 'rgba(26,26,40,0.8)', brand: 'linear-gradient(135deg,#7c4dff,#4f46e5)',
  text: '#f0f0f8', muted: '#9898b8', faint: '#55557a',
}

const googleProvider = new GoogleAuthProvider()

export default function SignIn() {
  const router = useRouter()
  const { wishprUser, isLoading } = useAuthStore()

  // If already logged in, redirect to dashboard immediately
  useEffect(() => {
    if (!isLoading && wishprUser) router.replace(ROUTES.DASHBOARD)
  }, [wishprUser, isLoading, router])

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleGoogle() {
    setLoading(true); setError('')
    try {
      await signInWithPopup(auth, googleProvider)
      router.push(ROUTES.DASHBOARD)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function handleEmail() {
    if (!email || !password) { setError('Fill in all fields'); return }
    setLoading(true); setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push(ROUTES.DASHBOARD)
    } catch (e: any) {
      setError(e.message.includes('user-not-found') || e.message.includes('wrong-password') ? 'Wrong email or password' : e.message)
    } finally { setLoading(false) }
  }

  return (
    <>
      <Head><title>Sign in — Wishpr Xvs</title></Head>
      <main style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(124,77,255,0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
          <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 24, padding: 32, backdropFilter: 'blur(20px)' }}>

            <Link href={ROUTES.HOME} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32, textDecoration: 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: S.brand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ghost size={16} color="white" /></div>
              <span style={{ fontFamily: 'Syne', fontWeight: 700, color: S.text }}>Wishpr <span style={{ color: '#7c4dff' }}>Xvs</span></span>
            </Link>

            <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 24, color: S.text, marginBottom: 8 }}>Welcome back</h1>
            <p style={{ color: S.muted, fontSize: 14, marginBottom: 28 }}>Sign in to your Wishpr account</p>

            <button onClick={handleGoogle} disabled={loading}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: S.text, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 20 }}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/><path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/><path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/></svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: '#252535' }} />
              <span style={{ color: S.faint, fontSize: 12 }}>or</span>
              <div style={{ flex: 1, height: 1, background: '#252535' }} />
            </div>

            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, background: S.input, border: `1px solid ${S.border}`, color: S.text, fontSize: 14, outline: 'none', marginBottom: 12 }} />

            <div style={{ position: 'relative', marginBottom: 20 }}>
              <input type={showPw ? 'text' : 'password'} placeholder="Password" value={password}
                onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEmail()}
                style={{ width: '100%', padding: '14px 48px 14px 16px', borderRadius: 12, background: S.input, border: `1px solid ${S.border}`, color: S.text, fontSize: 14, outline: 'none' }} />
              <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: S.faint }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button onClick={handleEmail} disabled={loading}
              style={{ width: '100%', padding: '14px', borderRadius: 14, background: S.brand, color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: loading ? 0.6 : 1, boxShadow: '0 0 20px rgba(124,77,255,0.3)' }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

            {error && (
              <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: 13 }}>
                {error}
              </div>
            )}

            <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: S.faint }}>
              No account?{' '}
              <Link href={ROUTES.SIGN_UP} style={{ color: S.muted }}>Sign up free</Link>
            </p>
          </div>
        </motion.div>
      </main>
    </>
  )
}
