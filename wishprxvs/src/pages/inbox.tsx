import Head                    from 'next/head'
import Link                    from 'next/link'
import { useRouter }           from 'next/router'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  collection, query, where, getDocs,
  updateDoc, doc, deleteDoc,
}                              from 'firebase/firestore'
import { db, COLLECTIONS }     from '@/lib/firebase'
import { useAuthStore }        from '@/store/authStore'
import { ROUTES }              from '@/constants/routes'
import { Message }             from '@/types'
import {
  Ghost, ArrowLeft, Inbox, Trash2, Eye, Volume2,
  MessageCircle, RefreshCw, Share2, X, Download,
} from 'lucide-react'

const S = {
  bg: '#0d0d14', card: 'rgba(19,19,30,0.85)', border: '#252535',
  brand: 'linear-gradient(135deg,#7c4dff,#4f46e5)',
  text: '#f0f0f8', muted: '#9898b8', faint: '#55557a',
}

interface ShareModalProps {
  message: Message & { _docId: string }
  username: string
  onClose: () => void
}

function ShareModal({ message, username, onClose }: ShareModalProps) {
  const [reply, setReply] = useState('')
  const [generating, setGenerating] = useState(false)
  const [cardGenerated, setCardGenerated] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number) {
    const words = text.split(' ')
    let line = ''
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, y)
        line = word
        y += lineH
      } else {
        line = test
      }
    }
    if (line) ctx.fillText(line, x, y)
  }

  function drawCard(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = 800, H = 460
    canvas.width = W; canvas.height = H

    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, '#0d0d14'); grad.addColorStop(0.5, '#12102a'); grad.addColorStop(1, '#0d0d14')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)

    const glow = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 300)
    glow.addColorStop(0, 'rgba(124,77,255,0.2)'); glow.addColorStop(1, 'rgba(124,77,255,0)')
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H)

    ctx.strokeStyle = 'rgba(124,77,255,0.4)'; ctx.lineWidth = 2
    roundRect(ctx, 16, 16, W-32, H-32, 24); ctx.stroke()

    ctx.fillStyle = 'rgba(255,255,255,0.04)'; roundRect(ctx, 48, 55, W-96, 170, 16); ctx.fill()
    ctx.strokeStyle = 'rgba(124,77,255,0.2)'; ctx.lineWidth = 1; roundRect(ctx, 48, 55, W-96, 170, 16); ctx.stroke()

    ctx.fillStyle = '#7c4dff'; ctx.font = 'bold 11px system-ui'; ctx.fillText('ANONYMOUS MESSAGE', 68, 82)
    ctx.fillStyle = '#f0f0f8'; ctx.font = '15px system-ui'
    wrapText(ctx, message.content, 68, 110, W-136, 26)

    ctx.strokeStyle = 'rgba(124,77,255,0.18)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(48, 245); ctx.lineTo(W-48, 245); ctx.stroke()

    ctx.fillStyle = 'rgba(124,77,255,0.09)'; roundRect(ctx, 48, 258, W-96, 140, 16); ctx.fill()
    ctx.strokeStyle = 'rgba(124,77,255,0.3)'; ctx.lineWidth = 1; roundRect(ctx, 48, 258, W-96, 140, 16); ctx.stroke()

    ctx.fillStyle = '#c084fc'; ctx.font = 'bold 11px system-ui'; ctx.fillText(`@${username.toUpperCase()} REPLIED`, 68, 284)
    ctx.fillStyle = '#f0f0f8'; ctx.font = '600 15px system-ui'
    wrapText(ctx, reply, 68, 312, W-136, 26)

    ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.font = '12px system-ui'
    // subtle bottom accent line only — no domain branding
    ctx.strokeStyle = 'rgba(124,77,255,0.3)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(W/2 - 30, H - 28); ctx.lineTo(W/2 + 30, H - 28); ctx.stroke()
  }

  function generateCard() {
    if (!reply.trim()) return
    setGenerating(true)
    setTimeout(() => {
      if (canvasRef.current) { drawCard(canvasRef.current); setCardGenerated(true) }
      setGenerating(false)
    }, 50)
  }

  function downloadCard() {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `wishpr-reply-${Date.now()}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  async function shareCard() {
    if (!canvasRef.current) return
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return
      const file = new File([blob], 'wishpr-reply.png', { type: 'image/png' })
      if (navigator.share && (navigator as any).canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: 'My Wishpr reply' }) } catch {}
      } else { downloadCard() }
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 520, background: '#13131e', border: '1px solid rgba(124,77,255,0.3)', borderRadius: 24, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Share2 size={18} color="#7c4dff" />
            <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: S.text }}>Reply & Share</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: S.faint, cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <div style={{ background: 'rgba(124,77,255,0.06)', border: '1px solid rgba(124,77,255,0.2)', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
          <p style={{ color: '#7c4dff', fontSize: 11, fontWeight: 700, marginBottom: 8 }}>👻 ANONYMOUS SAID</p>
          <p style={{ color: S.text, fontSize: 14, lineHeight: 1.65 }}>{message.content}</p>
        </div>

        <label style={{ color: S.faint, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8 }}>✨ YOUR REPLY</label>
        <textarea
          value={reply}
          onChange={e => { setReply(e.target.value); setCardGenerated(false) }}
          placeholder="Write your reply here…"
          rows={3} maxLength={300}
          style={{ width: '100%', padding: '13px 14px', borderRadius: 12, background: 'rgba(26,26,40,0.8)', border: '1px solid #252535', color: S.text, fontSize: 14, outline: 'none', resize: 'none', lineHeight: 1.6, fontFamily: 'Manrope', marginBottom: 4 }}
        />
        <p style={{ color: S.faint, fontSize: 11, textAlign: 'right', marginBottom: 16 }}>{reply.length}/300</p>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {cardGenerated && canvasRef.current && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 16 }}>
            <p style={{ color: S.faint, fontSize: 11, marginBottom: 8 }}>Card preview — ready to share</p>
            <img
              src={canvasRef.current.toDataURL()}
              alt="Share card preview"
              style={{ width: '100%', borderRadius: 12, border: '1px solid rgba(124,77,255,0.2)' }}
            />
          </motion.div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          {!cardGenerated ? (
            <button onClick={generateCard} disabled={!reply.trim() || generating}
              style={{ flex: 1, padding: '12px', borderRadius: 13, background: S.brand, color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: !reply.trim() ? 'not-allowed' : 'pointer', opacity: !reply.trim() ? 0.5 : 1 }}>
              {generating ? 'Generating…' : '🎨 Generate Share Card'}
            </button>
          ) : (
            <>
              <button onClick={shareCard} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px', borderRadius: 13, background: S.brand, color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
                <Share2 size={15} /> Share
              </button>
              <button onClick={downloadCard} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px 16px', borderRadius: 13, background: 'rgba(124,77,255,0.12)', border: '1px solid rgba(124,77,255,0.3)', color: '#c084fc', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                <Download size={15} />
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function InboxPage() {
  const router = useRouter()
  const { wishprUser, firebaseUser, isLoading } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [fetching, setFetching] = useState(true)
  const [filter, setFilter]     = useState<'all' | 'unread'>('all')
  const [shareMsg, setShareMsg] = useState<(Message & { _docId: string }) | null>(null)

  useEffect(() => {
    if (!isLoading && !firebaseUser) { router.replace(ROUTES.SIGN_IN); return }
    if (!wishprUser) return
    fetchMessages()
  }, [wishprUser, firebaseUser, isLoading])

  async function fetchMessages() {
    if (!wishprUser) return
    setFetching(true)
    try {
      const q    = query(collection(db, COLLECTIONS.MESSAGES), where('toUserId', '==', wishprUser.uid))
      const snap = await getDocs(q)
      const msgs = snap.docs.map(d => ({ ...d.data(), _docId: d.id } as Message & { _docId: string }))
      msgs.sort((a, b) => b.createdAt - a.createdAt)
      setMessages(msgs)
    } catch (err) { console.error('Inbox fetch error:', err) }
    finally { setFetching(false) }
  }

  async function markRead(docId: string) {
    try {
      await updateDoc(doc(db, COLLECTIONS.MESSAGES, docId), { isRead: true })
      setMessages(prev => prev.map(m => (m as any)._docId === docId ? { ...m, isRead: true } : m))
    } catch {}
  }

  async function deleteMessage(docId: string) {
    try {
      await deleteDoc(doc(db, COLLECTIONS.MESSAGES, docId))
      setMessages(prev => prev.filter(m => (m as any)._docId !== docId))
    } catch {}
  }

  function timeAgo(ts: number) {
    const diff = Date.now() - ts
    const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000)
    if (m < 1) return 'just now'; if (m < 60) return `${m}m ago`; if (h < 24) return `${h}h ago`; return `${d}d ago`
  }

  if (isLoading || (firebaseUser && !wishprUser)) {
    return (
      <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <Ghost size={36} color="#7c4dff" />
        </motion.div>
      </div>
    )
  }

  const displayed = filter === 'unread' ? messages.filter(m => !m.isRead) : messages
  const unreadCount = messages.filter(m => !m.isRead).length

  return (
    <>
      <Head><title>Inbox — Wishpr Xvs</title></Head>
      <main style={{ minHeight: '100vh', background: S.bg, padding: '24px 16px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
            <Link href={ROUTES.DASHBOARD} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 10, background: S.card, border: `1px solid ${S.border}`, color: S.muted, textDecoration: 'none', flexShrink: 0 }}>
              <ArrowLeft size={18} />
            </Link>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Inbox size={20} color="#7c4dff" />
                <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 20, color: S.text }}>Inbox</h1>
                {unreadCount > 0 && (
                  <span style={{ padding: '2px 10px', borderRadius: 999, background: '#7c4dff', color: '#fff', fontSize: 12, fontWeight: 700 }}>{unreadCount} new</span>
                )}
              </div>
              <p style={{ color: S.faint, fontSize: 13, marginTop: 3 }}>👻 Anonymous messages · totally private</p>
            </div>
            <button onClick={fetchMessages} title="Refresh" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 10, background: S.card, border: `1px solid ${S.border}`, color: S.muted, cursor: 'pointer' }}>
              <RefreshCw size={16} />
            </button>
          </div>

          {wishprUser && (
            <div style={{ background: 'rgba(124,77,255,0.07)', border: '1px solid rgba(124,77,255,0.2)', borderRadius: 14, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div>
                <p style={{ color: '#c084fc', fontSize: 12, fontWeight: 600, marginBottom: 2 }}>Your anonymous link</p>
                <p style={{ color: S.faint, fontSize: 11 }}>Share it to get anonymous messages</p>
              </div>
              <Link href={ROUTES.SEND_MESSAGE(wishprUser.linkSlug)} target="_blank"
                style={{ padding: '8px 16px', borderRadius: 10, background: 'rgba(124,77,255,0.15)', border: '1px solid rgba(124,77,255,0.3)', color: '#c084fc', fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Preview →
              </Link>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {(['all', 'unread'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '7px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                  background: filter === f ? '#7c4dff' : 'rgba(255,255,255,0.05)',
                  color: filter === f ? '#fff' : S.muted }}>
                {f === 'all' ? `All (${messages.length})` : `Unread (${unreadCount})`}
              </button>
            ))}
          </div>

          {fetching ? (
            <div style={{ textAlign: 'center', paddingTop: 80 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <RefreshCw size={28} color="#7c4dff" style={{ margin: '0 auto' }} />
              </motion.div>
              <p style={{ color: S.faint, marginTop: 16, fontSize: 14 }}>Loading messages…</p>
            </div>
          ) : displayed.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 80 }}>
              <MessageCircle size={48} color="#252535" style={{ margin: '0 auto 16px', display: 'block' }} />
              <p style={{ color: S.muted, fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                {filter === 'unread' ? 'No unread messages' : 'No messages yet'}
              </p>
              <p style={{ color: S.faint, fontSize: 14, marginBottom: 24 }}>Share your anonymous link to start receiving messages.</p>
              <Link href={ROUTES.DASHBOARD} style={{ textDecoration: 'none' }}>
                <button style={{ padding: '10px 22px', borderRadius: 12, background: 'rgba(124,77,255,0.12)', border: '1px solid rgba(124,77,255,0.3)', color: '#c084fc', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Go to dashboard
                </button>
              </Link>
            </div>
          ) : (
            <AnimatePresence>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {displayed.map((m: any, i) => (
                  <motion.div key={m._docId}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.03 }}
                    style={{ background: m.isRead ? S.card : 'rgba(124,77,255,0.07)', border: `1px solid ${m.isRead ? S.border : 'rgba(124,77,255,0.28)'}`, borderRadius: 16, padding: '18px 18px 14px', position: 'relative' }}>

                    {!m.isRead && <div style={{ position: 'absolute', top: 18, right: 18, width: 8, height: 8, borderRadius: '50%', background: '#7c4dff' }} />}

                    {m.isVoice && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, background: 'rgba(124,77,255,0.15)', marginBottom: 10 }}>
                        <Volume2 size={12} color="#7c4dff" />
                        <span style={{ color: '#7c4dff', fontSize: 11, fontWeight: 600 }}>VOICE MESSAGE</span>
                      </div>
                    )}

                    {m.isVoice && m.audioUrl ? (
                      <audio controls src={m.audioUrl} style={{ width: '100%', marginBottom: 10 }} />
                    ) : (
                      <p style={{ color: S.text, fontSize: 15, lineHeight: 1.65, marginBottom: 12, paddingRight: 16 }}>{m.content}</p>
                    )}

                    {m.reactionEmoji && <p style={{ fontSize: 28, marginBottom: 8 }}>{m.reactionEmoji}</p>}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                      <p style={{ color: S.faint, fontSize: 12 }}>{timeAgo(m.createdAt)} · 👻 Anonymous</p>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {!m.isVoice && m.content && (
                          <button onClick={() => setShareMsg(m)}
                            title="Reply & share"
                            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 8, background: 'rgba(124,77,255,0.12)', border: '1px solid rgba(124,77,255,0.3)', color: '#c084fc', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            <Share2 size={12} /> Reply & Share
                          </button>
                        )}
                        {!m.isRead && (
                          <button onClick={() => markRead(m._docId)} title="Mark as read"
                            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: `1px solid ${S.border}`, color: S.muted, fontSize: 12, cursor: 'pointer' }}>
                            <Eye size={13} />
                          </button>
                        )}
                        <button onClick={() => deleteMessage(m._docId)} title="Delete"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', cursor: 'pointer' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </main>

      <AnimatePresence>
        {shareMsg && wishprUser && (
          <ShareModal message={shareMsg} username={wishprUser.username} onClose={() => setShareMsg(null)} />
        )}
      </AnimatePresence>
    </>
  )
}
