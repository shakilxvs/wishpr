import Head                      from 'next/head'
import Link                      from 'next/link'
import { useRouter }             from 'next/router'
import { useEffect, useState }  from 'react'
import { motion }                from 'framer-motion'
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
}                                from 'firebase/auth'
import { doc, setDoc, getDoc }   from 'firebase/firestore'
import { auth, db, COLLECTIONS } from '@/lib/firebase'
import { useAuthStore }          from '@/store/authStore'
import { ROUTES }                from '@/constants/routes'
import { LIMITS }                from '@/constants/limits'
import { WishprUser }            from '@/types'
import { nanoid }                from 'nanoid'
import { Ghost, Eye, EyeOff, ArrowLeft } from 'lucide-react'

const S = {
  bg: '#0d0d14', card: 'rgba(19,19,30,0.92)', border: 'rgba(37,37,53,0.8)',
  input: 'rgba(26,26,40,0.8)', brand: 'linear-gradient(135deg,#7c4dff,#4f46e5)',
  text: '#f0f0f8', muted: '#9898b8', faint: '#55557a',
}

const googleProvider = new GoogleAuthProvider()

export default function SignUp() {
  const router = useRouter()
  // KEY: Get setWishprUser so we manually update store right after saving profile
  const { setWishprUser, wishprUser, isLoading } = useAuthStore()

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!isLoading && wishprUser) router.replace(ROUTES.DASHBOARD)
  }, [wishprUser, isLoading, router])

  const [step, setStep]         = useState<'method' | 'email' | 'username'>('method')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function saveProfile(uid: string, emailVal: string | null, name: string) {
    const slug = nanoid(10)
    const profile: WishprUser = {
      stickerId:          'ghost_classic',
      followingCount:     0,
      usernameVisibility: 'nobody',
      messagePrivacy:     'everyone',
      uid,
      username:      name.toLowerCase(),
      displayName:   name,
      email:         emailVal ?? '',
      photoURL:      null,
      createdAt:     Date.now(),
      isGhostMode:   false,
      followerCount:      0,
      messageCount:       0,
      linkSlug:      slug,
    }
    await setDoc(doc(db, COLLECTIONS.USERS, uid), profile)
    await setDoc(doc(db, COLLECTIONS.USERNAMES, name.toLowerCase()), { uid, createdAt: Date.now() })
    // KEY FIX: Set zustand store right now — dashboard checks this
    setWishprUser(profile)
  }

  async function handleGoogle() {
    setLoading(true); setError('')
    try {
      const { user } = await signInWithPopup(auth, googleProvider)
      const existing = await getDoc(doc(db, COLLECTIONS.USERS, user.uid))
      if (existing.exists()) {
        // Returning user — set store and go straight to dashboard
        setWishprUser(existing.data() as WishprUser)
        router.push(ROUTES.DASHBOARD)
        return
      }
      setEmail(user.email ?? '')
      setStep('username')
    } catch (e: any) {
      setError(e.message?.replace('Firebase: ', '') ?? 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleFinish() {
    const name = username.trim()
    if (name.length < LIMITS.USERNAME_MIN_LENGTH) { setError(`Min ${LIMITS.USERNAME_MIN_LENGTH} characters`); return }
    if (!LIMITS.USERNAME_REGEX.test(name))         { setError('Letters, numbers & underscores only'); return }

    setLoading(true); setError('')
    try {
      const taken = await getDoc(doc(db, COLLECTIONS.USERNAMES, name.toLowerCase()))
      if (taken.exists()) { setError('Username taken — try another'); setLoading(false); return }

      const current = auth.currentUser
      if (current) {
        await saveProfile(current.uid, current.email, name)
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, email, password)
        await saveProfile(user.uid, email, name)
      }
      router.push(ROUTES.DASHBOARD)
    } catch (e: any) {
      const msg = e.message || ''
      setError(msg.includes('email-already-in-use') ? 'Email already registered — sign in instead.' : msg.replace('Firebase: ', ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head><title>Sign up — Wishpr Xvs</title></Head>
      <main style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(124,77,255,0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
          <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 24, padding: 32, backdropFilter: 'blur(20px)' }}>

            <Link href={ROUTES.HOME} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32, textDecoration: 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: S.brand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ghost size={16} color="white" /></div>
              <span style={{ fontFamily: 'Syne', fontWeight: 700, color: S.text }}>Wishpr <span style={{ color: '#7c4dff' }}>Xvs</span></span>
            </Link>

            <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
              {['method', 'username'].map((s, i) => (
                <div key={s} style={{ flex: 1, height: 3, borderRadius: 3, transition: 'background 0.3s',
                  background: (i === 0 && step !== 'method') || step === s ? '#7c4dff' : '#252535' }} />
              ))}
            </div>

            {step === 'method' && (
              <motion.div key="method" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 24, color: S.text, marginBottom: 8 }}>Create account</h1>
                <p style={{ color: S.muted, fontSize: 14, marginBottom: 28 }}>Your identity stays private. Always.</p>

                <button onClick={handleGoogle} disabled={loading}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: S.text, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 16, opacity: loading ? 0.6 : 1 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/><path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/><path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/></svg>
                  {loading ? 'Connecting…' : 'Continue with Google'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                  <div style={{ flex: 1, height: 1, background: '#252535' }} />
                  <span style={{ color: S.faint, fontSize: 12 }}>or</span>
                  <div style={{ flex: 1, height: 1, background: '#252535' }} />
                </div>

                <button onClick={() => setStep('email')}
                  style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'rgba(124,77,255,0.08)', border: '1px solid rgba(124,77,255,0.25)', color: '#c084fc', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Continue with Email
                </button>
              </motion.div>
            )}

            {step === 'email' && (
              <motion.div key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <button onClick={() => { setStep('method'); setError('') }} style={{ display: 'flex', alignItems: 'center', gap: 4, color: S.muted, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20 }}>
                  <ArrowLeft size={14} /> Back
                </button>
                <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 24, color: S.text, marginBottom: 24 }}>Your email</h1>

                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 12, background: S.input, border: `1px solid ${S.border}`, color: S.text, fontSize: 14, outline: 'none', marginBottom: 12 }} />

                <div style={{ position: 'relative', marginBottom: 20 }}>
                  <input type={showPw ? 'text' : 'password'} placeholder="Password (min 8 chars)" value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '14px 48px 14px 16px', borderRadius: 12, background: S.input, border: `1px solid ${S.border}`, color: S.text, fontSize: 14, outline: 'none' }} />
                  <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: S.faint }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <button onClick={() => {
                  if (!email) { setError('Enter your email'); return }
                  if (password.length < 8) { setError('Password must be at least 8 characters'); return }
                  setError(''); setStep('username')
                }} style={{ width: '100%', padding: '14px', borderRadius: 14, background: S.brand, color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                  Continue
                </button>
              </motion.div>
            )}

            {step === 'username' && (
              <motion.div key="username" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 24, color: S.text, marginBottom: 8 }}>Pick a username</h1>
                <p style={{ color: S.muted, fontSize: 14, marginBottom: 24 }}>Your identity on Wishpr. Used to find your anonymous link.</p>

                <div style={{ display: 'flex', alignItems: 'center', background: S.input, border: `1px solid ${S.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 8 }}>
                  <span style={{ padding: '0 12px', color: S.faint, fontSize: 13, whiteSpace: 'nowrap' }}>@</span>
                  <input type="text" placeholder="yourname" value={username} autoFocus
                    onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    maxLength={LIMITS.USERNAME_MAX_LENGTH}
                    onKeyDown={e => e.key === 'Enter' && handleFinish()}
                    style={{ flex: 1, padding: '14px 16px 14px 0', background: 'transparent', border: 'none', color: S.text, fontSize: 15, outline: 'none' }} />
                </div>
                <p style={{ color: S.faint, fontSize: 12, marginBottom: 20 }}>Letters, numbers & underscores only. Min 3 chars.</p>

                <button onClick={handleFinish} disabled={loading || username.length < LIMITS.USERNAME_MIN_LENGTH}
                  style={{ width: '100%', padding: '14px', borderRadius: 14, background: S.brand, color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: loading || username.length < 3 ? 0.5 : 1, boxShadow: '0 0 20px rgba(124,77,255,0.3)' }}>
                  {loading ? 'Creating your account…' : 'Start whispering →'}
                </button>
              </motion.div>
            )}

            {error && (
              <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: 13 }}>
                {error}
              </div>
            )}

            <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: S.faint }}>
              Already have an account?{' '}
              <Link href={ROUTES.SIGN_IN} style={{ color: S.muted }}>Sign in</Link>
            </p>
          </div>
        </motion.div>
      </main>
    </>
  )
}
