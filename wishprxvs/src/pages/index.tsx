import Head           from 'next/head'
import Link           from 'next/link'
import { motion }     from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { ROUTES }     from '@/constants/routes'
import { Ghost, MessageCircle, Flame, Lock, Mic, Users, Zap, Eye, ArrowRight, ShieldCheck } from 'lucide-react'

const FEATURES = [
  { icon: <Ghost size={20} />,         title: 'Ghost Mode',      desc: 'Browse everything. Leave zero trace.',             accent: '#7c4dff' },
  { icon: <Lock size={20} />,          title: 'E2E Encrypted',   desc: 'Key lives only in your URL. Server sees nothing.',  accent: '#4f46e5' },
  { icon: <Mic size={20} />,           title: 'Voice Changer',   desc: '5-second voice clips with built-in effects.',       accent: '#9333ea' },
  { icon: <Flame size={20} />,         title: 'Burn After Read', desc: 'Messages that self-destruct after both go offline.',accent: '#ff6b35' },
  { icon: <Users size={20} />,         title: 'Community Feed',  desc: 'Confessions & debates tied to your city or school.',accent: '#06b6d4' },
  { icon: <Zap size={20} />,           title: 'Streaks',         desc: 'Keep anonymous conversations alive for days.',       accent: '#eab308' },
  { icon: <Eye size={20} />,           title: 'Timed Posts',     desc: 'Auto-delete after X hours or X views.',             accent: '#ec4899' },
  { icon: <MessageCircle size={20} />, title: 'Anonymous Polls', desc: '"Rate me 1–10" — results totally private.',         accent: '#10b981' },
]

const up = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }
const stagger = { visible: { transition: { staggerChildren: 0.1 } } }

export default function Home() {
  const { wishprUser } = useAuthStore()

  return (
    <>
      <Head>
        <title>Wishpr Xvs — Whisper Anonymously</title>
        <meta name="description" content="Anonymous messaging, confessions, polls, voice messages — free, private." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main style={{ background: '#0d0d14', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* Background glow orbs */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 600, height: 600, top: -200, left: -100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,77,255,0.2) 0%, transparent 70%)', filter: 'blur(80px)' }} />
          <div style={{ position: 'absolute', width: 400, height: 400, bottom: 100, right: -80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        </div>

        {/* ── NAVBAR — fixed mobile layout ─────────────────────────────────── */}
        <nav style={{
          position: 'relative', zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          // Prevent overflow on small screens
          flexWrap: 'nowrap', gap: 8,
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#7c4dff,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Ghost size={16} color="white" />
            </div>
            {/* Hide "Wishpr" text on very small screens, show icon only */}
            <span style={{ fontFamily: 'Syne', fontWeight: 700, color: '#f0f0f8', fontSize: 16, whiteSpace: 'nowrap' }}>
              Wishpr <span style={{ color: '#7c4dff' }}>Xvs</span>
            </span>
          </Link>

          {/* Buttons — always on one line, compact on mobile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {wishprUser ? (
              <Link href={ROUTES.DASHBOARD} style={{ textDecoration: 'none' }}>
                <button style={{ padding: '8px 16px', borderRadius: 12, background: 'linear-gradient(135deg,#7c4dff,#4f46e5)', color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Dashboard
                </button>
              </Link>
            ) : (
              <>
                <Link href={ROUTES.SIGN_IN} style={{ textDecoration: 'none' }}>
                  <button style={{ padding: '8px 12px', borderRadius: 12, background: 'transparent', color: '#9898b8', fontSize: 14, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Sign in
                  </button>
                </Link>
                <Link href={ROUTES.SIGN_UP} style={{ textDecoration: 'none' }}>
                  <button style={{ padding: '8px 16px', borderRadius: 12, background: 'linear-gradient(135deg,#7c4dff,#4f46e5)', color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 0 16px rgba(124,77,255,0.35)', whiteSpace: 'nowrap' }}>
                    Get started
                  </button>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero */}
        <section style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '60px 20px 80px' }}>
          <motion.div initial="hidden" animate="visible" variants={stagger}>

            <motion.div variants={up} style={{ marginBottom: 28 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: 'rgba(124,77,255,0.1)', border: '1px solid rgba(124,77,255,0.3)', color: '#c084fc', fontSize: 13, fontWeight: 500 }}>
                <ShieldCheck size={14} />
                100% anonymous · End-to-end encrypted
              </span>
            </motion.div>

            <motion.h1 variants={up} style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(36px, 8vw, 80px)', lineHeight: 1.05, color: '#f0f0f8', marginBottom: 24 }}>
              Your thoughts,{' '}
              <span style={{ background: 'linear-gradient(135deg,#c084fc 0%,#7c4dff 50%,#4f46e5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                no name
              </span>
              <br />attached.
            </motion.h1>

            <motion.p variants={up} style={{ fontSize: 17, color: '#9898b8', maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.7 }}>
              Send and receive anonymous messages, voice clips, confessions, and polls. Total privacy. Always free.
            </motion.p>

            <motion.div variants={up} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', padding: '0 16px' }}>
              <Link href={ROUTES.SIGN_UP} style={{ textDecoration: 'none' }}>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 16, background: 'linear-gradient(135deg,#7c4dff,#4f46e5)', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer', boxShadow: '0 0 28px rgba(124,77,255,0.45)' }}>
                  Start whispering <ArrowRight size={18} />
                </motion.button>
              </Link>
              <Link href={ROUTES.FEED} style={{ textDecoration: 'none' }}>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  style={{ padding: '13px 28px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f0f8', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>
                  Browse community
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Features grid */}
        <section style={{ position: 'relative', zIndex: 10, padding: '0 20px 80px' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            style={{ maxWidth: 1100, margin: '0 auto' }}>
            <motion.h2 variants={up} style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 'clamp(24px,5vw,36px)', textAlign: 'center', color: '#f0f0f8', marginBottom: 12 }}>
              Every feature anonymous.
            </motion.h2>
            <motion.p variants={up} style={{ textAlign: 'center', color: '#55557a', marginBottom: 44 }}>
              Built around one promise — your identity is always yours.
            </motion.p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
              {FEATURES.map((f) => (
                <motion.div key={f.title} variants={up}
                  whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300 } }}
                  style={{ background: 'rgba(19,19,30,0.8)', border: '1px solid rgba(37,37,53,0.8)', borderRadius: 20, padding: '22px 18px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${f.accent}1a`, color: f.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontFamily: 'Syne', fontWeight: 600, color: '#f0f0f8', marginBottom: 8, fontSize: 15 }}>{f.title}</h3>
                  <p style={{ color: '#9898b8', fontSize: 13, lineHeight: 1.6 }}>{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA */}
        <section style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '20px 20px 80px' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={up} style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(32px,6vw,52px)', marginBottom: 16, background: 'linear-gradient(135deg,#c084fc 0%,#7c4dff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Ready to whisper?
            </motion.h2>
            <motion.p variants={up} style={{ color: '#9898b8', fontSize: 17, marginBottom: 32 }}>
              Get your personal anonymous link in 30 seconds.
            </motion.p>
            <motion.div variants={up}>
              <Link href={ROUTES.SIGN_UP} style={{ textDecoration: 'none' }}>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  style={{ padding: '15px 40px', borderRadius: 16, background: 'linear-gradient(135deg,#7c4dff,#4f46e5)', color: '#fff', fontWeight: 700, fontSize: 17, border: 'none', cursor: 'pointer', boxShadow: '0 0 50px rgba(124,77,255,0.5)' }}>
                  Create your Wishpr link →
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer style={{ position: 'relative', zIndex: 10, borderTop: '1px solid #252535', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ghost size={15} color="#7c4dff" />
            <span style={{ fontFamily: 'Syne', fontWeight: 600, color: '#55557a', fontSize: 14 }}>Wishpr Xvs</span>
          </div>
          <p style={{ color: '#55557a', fontSize: 12 }}>Privacy first. Always anonymous.</p>
        </footer>

      </main>
    </>
  )
}
