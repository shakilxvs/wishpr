import Head                   from 'next/head'
import { GetServerSideProps } from 'next'
import { useState }           from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore'
import { db, COLLECTIONS }    from '@/lib/firebase'
import { LIMITS }             from '@/constants/limits'
import { WishprUser }         from '@/types'
import { nanoid }             from 'nanoid'
import { Ghost, Send, CheckCircle, Mic, Square, X, Volume2, Smile } from 'lucide-react'
import { Avatar }             from '@/components/Avatars'
import { startRecording, stopRecording } from '@/lib/audio'
import { uploadAudio }        from '@/lib/cloudinary'

const S = {
  bg: '#0d0d14', card: 'rgba(19,19,30,0.92)', border: 'rgba(37,37,53,0.8)',
  input: 'rgba(26,26,40,0.8)', brand: 'linear-gradient(135deg,#7c4dff,#4f46e5)',
  text: '#f0f0f8', muted: '#9898b8', faint: '#55557a', danger: '#f87171',
}

interface LinkUser {
  uid?: string; username?: string; displayName?: string; photoURL?: string | null
  stickerId?: string | null; linkSlug?: string; address?: string | null; bio?: string | null
  linkMode?: 'text' | 'poll' | 'quiz'
  linkQuestion?: string | null
  linkPollOptions?: { id: string; label: string }[] | null
  linkQuizOptions?: { id: string; label: string }[] | null
  linkQuizAnswer?: number | null
}

interface Props { user: LinkUser | null }

// User-content stickers (not UI elements)
const STICKER_EMOJIS = ['👻','😂','😍','🔥','💀','😭','💯','🫶','👀','💅','🫠','🤯','😤','🥺','✨','🙈']

export default function SendPage({ user }: Props) {
  const [msg, setMsg]               = useState('')
  const [sent, setSent]             = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [pickedSticker, setSticker] = useState<string | null>(null)
  const [showStickers, setShowStickers] = useState(false)
  const [selectedPoll, setSelectedPoll] = useState<string | null>(null)
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null)
  const [isRecording, setIsRecording]   = useState(false)
  const [recSecs, setRecSecs]           = useState(0)
  const [audioBlob, setAudioBlob]       = useState<Blob | null>(null)
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null)
  const [uploadingAudio, setUploadingAudio] = useState(false)

  if (!user) {
    return (
      <main style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Ghost size={48} color="#252535" style={{ margin: '0 auto 16px', display: 'block' }} />
          <p style={{ color: S.faint }}>This link doesn&apos;t exist or has expired.</p>
        </div>
      </main>
    )
  }

  const mode = user.linkMode || 'text'

  async function startRec() {
    setIsRecording(true); setRecSecs(0); setAudioBlobUrl(null); setAudioBlob(null)
    try {
      await startRecording('none', s => setRecSecs(s), b => {
        setIsRecording(false); setAudioBlob(b); setAudioBlobUrl(URL.createObjectURL(b))
      })
    } catch { alert('Mic access denied'); setIsRecording(false) }
  }

  async function handleSend() {
    setLoading(true); setError('')
    try {
      if (mode === 'poll') {
        if (!selectedPoll) { setError('Please choose an option'); setLoading(false); return }
        const label = user.linkPollOptions?.find(o => o.id === selectedPoll)?.label || selectedPoll
        await addDoc(collection(db, COLLECTIONS.MESSAGES), {
          id: nanoid(), toUserId: user.uid,
          content: `Voted: "${label}"`,
          isPollVote: true, selectedOption: selectedPoll,
          isVoice: false, isBurnAfterRead: false, isRead: false, type: 'poll_vote',
          createdAt: Date.now(),
        })
      } else if (mode === 'quiz') {
        if (selectedQuiz === null) { setError('Please pick an answer'); setLoading(false); return }
        const isCorrect = selectedQuiz === user.linkQuizAnswer
        const label = user.linkQuizOptions?.[selectedQuiz]?.label || String(selectedQuiz)
        await addDoc(collection(db, COLLECTIONS.MESSAGES), {
          id: nanoid(), toUserId: user.uid,
          content: `Quiz: "${label}" — ${isCorrect ? 'Correct' : 'Wrong'}`,
          isQuizAnswer: true, answerIndex: selectedQuiz, isCorrect,
          isVoice: false, isBurnAfterRead: false, isRead: false, type: 'quiz_answer',
          createdAt: Date.now(),
        })
      } else {
        let audioUrl: string | undefined
        if (audioBlob) {
          setUploadingAudio(true)
          try { audioUrl = await uploadAudio(audioBlob, 'anon_' + (user.uid || 'x')) } catch {}
          setUploadingAudio(false)
        }
        if (!msg.trim() && !pickedSticker && !audioUrl) {
          setError('Write something, pick a sticker, or record a voice message')
          setLoading(false); return
        }
        if (msg.length > LIMITS.MAX_MESSAGE_LENGTH) {
          setError(`Max ${LIMITS.MAX_MESSAGE_LENGTH} characters`); setLoading(false); return
        }
        await addDoc(collection(db, COLLECTIONS.MESSAGES), {
          id: nanoid(), toUserId: user.uid,
          content: pickedSticker
            ? `${pickedSticker}${msg.trim() ? ' ' + msg.trim() : ''}`
            : msg.trim(),
          audioUrl,
          isVoice: !!audioUrl,
          isBurnAfterRead: false, isRead: false,
          type: pickedSticker && !audioUrl ? 'sticker' : audioUrl ? 'voice' : 'text',
          createdAt: Date.now(),
        })
      }
      setSent(true)
    } catch { setError('Failed to send. Try again.') }
    finally { setLoading(false) }
  }

  const question = user.linkQuestion

  return (
    <>
      <Head>
        <title>Send to @{user.username} — Wishpr Xvs</title>
        <meta name="description" content={`Send @${user.username} an anonymous message`} />
      </Head>
      <main style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px' }}>
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 500, height: 500, top: -100, left: '50%', transform: 'translateX(-50%)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,77,255,0.2) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        </div>

        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div key="form" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ width: '100%', maxWidth: 440, background: S.card, border: `1px solid ${S.border}`, borderRadius: 24, padding: '28px 24px', backdropFilter: 'blur(20px)', position: 'relative' }}>

              {/* User info */}
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <Avatar stickerId={user.stickerId} size={64} />
                </div>
                <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 20, color: S.text }}>@{user.username}</h1>
                {user.bio && (
                  <p style={{ color: S.muted, fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{user.bio}</p>
                )}
                <p style={{ color: S.faint, fontSize: 12, marginTop: 8 }}>100% anonymous · they&apos;ll never know it&apos;s you</p>
              </div>

              {/* Question / prompt from link owner */}
              {question && (
                <div style={{ background: 'rgba(124,77,255,0.07)', border: '1px solid rgba(124,77,255,0.2)', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
                  <p style={{ color: '#c084fc', fontWeight: 600, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{question}</p>
                </div>
              )}

              {/* POLL mode */}
              {mode === 'poll' && user.linkPollOptions && (
                <div style={{ marginBottom: 16 }}>
                  {user.linkPollOptions.map(opt => (
                    <button key={opt.id} onClick={() => setSelectedPoll(opt.id)}
                      style={{ display: 'block', width: '100%', marginBottom: 8, padding: '12px 14px', borderRadius: 12, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                        border: `1.5px solid ${selectedPoll === opt.id ? 'rgba(124,77,255,0.6)' : S.border}`,
                        background: selectedPoll === opt.id ? 'rgba(124,77,255,0.12)' : 'rgba(255,255,255,0.02)',
                        color: selectedPoll === opt.id ? '#c084fc' : S.text, fontSize: 14,
                        fontWeight: selectedPoll === opt.id ? 600 : 400 }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {/* QUIZ mode */}
              {mode === 'quiz' && user.linkQuizOptions && (
                <div style={{ marginBottom: 16 }}>
                  {user.linkQuizOptions.map((opt, i) => (
                    <button key={opt.id} onClick={() => setSelectedQuiz(i)}
                      style={{ display: 'block', width: '100%', marginBottom: 8, padding: '12px 14px', borderRadius: 12, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                        border: `1.5px solid ${selectedQuiz === i ? 'rgba(124,77,255,0.6)' : S.border}`,
                        background: selectedQuiz === i ? 'rgba(124,77,255,0.12)' : 'rgba(255,255,255,0.02)',
                        color: selectedQuiz === i ? '#c084fc' : S.text, fontSize: 14,
                        fontWeight: selectedQuiz === i ? 600 : 400 }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {/* TEXT mode */}
              {mode === 'text' && (
                <>
                  {audioBlobUrl ? (
                    <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(124,77,255,0.05)', border: '1px solid rgba(124,77,255,0.2)', borderRadius: 12, padding: '10px 12px' }}>
                      <Volume2 size={16} color="#7c4dff" />
                      <audio controls src={audioBlobUrl} style={{ flex: 1, height: 32 }} />
                      <button onClick={() => { setAudioBlob(null); setAudioBlobUrl(null) }}
                        style={{ background: 'none', border: 'none', color: S.faint, cursor: 'pointer', padding: 4 }}>
                        <X size={15} />
                      </button>
                    </div>
                  ) : isRecording ? (
                    <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 12, padding: '12px 14px' }}>
                      <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
                        <Mic size={18} color="#f87171" />
                      </motion.div>
                      <span style={{ color: '#f87171', fontSize: 13, flex: 1 }}>Recording… {recSecs}s</span>
                      <button onClick={() => { stopRecording(); setIsRecording(false) }}
                        style={{ padding: '6px 12px', borderRadius: 9, background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Square size={11} fill="#f87171" /> Stop
                      </button>
                    </div>
                  ) : (
                    <textarea value={msg} onChange={e => setMsg(e.target.value)}
                      placeholder={`Tell @${user.username} something anonymously…`}
                      rows={4} maxLength={LIMITS.MAX_MESSAGE_LENGTH}
                      style={{ width: '100%', padding: '13px 14px', borderRadius: 12, background: S.input, border: `1px solid ${S.border}`, color: S.text, fontSize: 14, outline: 'none', resize: 'none', lineHeight: 1.6, fontFamily: 'Manrope', marginBottom: 10, boxSizing: 'border-box' }} />
                  )}

                  {/* Sticker + voice toolbar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <button onClick={() => setShowStickers(!showStickers)} title="Add sticker"
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 11px', borderRadius: 10, background: pickedSticker ? 'rgba(124,77,255,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${pickedSticker ? 'rgba(124,77,255,0.35)' : S.border}`, color: pickedSticker ? '#c084fc' : S.faint, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      <Smile size={14} />
                      {pickedSticker || 'Sticker'}
                    </button>
                    {!audioBlobUrl && (
                      <button onClick={isRecording ? () => { stopRecording(); setIsRecording(false) } : startRec}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 11px', borderRadius: 10, background: isRecording ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isRecording ? 'rgba(248,113,113,0.3)' : S.border}`, color: isRecording ? '#f87171' : S.faint, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        <Mic size={14} /> {isRecording ? 'Stop' : 'Voice'}
                      </button>
                    )}
                    <span style={{ marginLeft: 'auto', color: msg.length > LIMITS.MAX_MESSAGE_LENGTH * 0.9 ? '#f87171' : S.faint, fontSize: 11, fontFamily: 'monospace' }}>
                      {msg.length}/{LIMITS.MAX_MESSAGE_LENGTH}
                    </span>
                  </div>

                  <AnimatePresence>
                    {showStickers && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14, padding: '12px', background: 'rgba(124,77,255,0.05)', borderRadius: 14, border: '1px solid rgba(124,77,255,0.15)' }}>
                        {STICKER_EMOJIS.map(s => (
                          <button key={s} onClick={() => { setSticker(pickedSticker === s ? null : s); setShowStickers(false) }}
                            style={{ width: 38, height: 38, borderRadius: 10, border: `1.5px solid ${pickedSticker === s ? '#7c4dff' : 'rgba(255,255,255,0.08)'}`, background: pickedSticker === s ? 'rgba(124,77,255,0.15)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              <motion.button onClick={handleSend} disabled={loading || uploadingAudio} whileTap={{ scale: 0.97 }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 14, background: S.brand, color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading || uploadingAudio ? 0.6 : 1, boxShadow: '0 0 24px rgba(124,77,255,0.3)' }}>
                <Send size={16} />
                {uploadingAudio ? 'Uploading…' : loading ? 'Sending…' : mode === 'poll' ? 'Vote' : mode === 'quiz' ? 'Submit Answer' : 'Send anonymously'}
              </motion.button>

              {error && <p style={{ color: '#fca5a5', fontSize: 13, textAlign: 'center', marginTop: 10 }}>{error}</p>}

              <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: S.faint }}>
                <a href="/auth/signup" style={{ color: '#7c4dff' }}>Get your own link →</a>
              </p>
            </motion.div>
          ) : (
            <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ width: '100%', maxWidth: 420, background: S.card, border: `1px solid ${S.border}`, borderRadius: 24, padding: 40, textAlign: 'center', backdropFilter: 'blur(20px)' }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }} style={{ marginBottom: 20 }}>
                <CheckCircle size={60} color="#7c4dff" style={{ margin: '0 auto', display: 'block' }} />
              </motion.div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 26, color: S.text, marginBottom: 12 }}>
                {mode === 'poll' ? 'Voted!' : mode === 'quiz' ? 'Answered!' : 'Sent!'}
              </h2>
              <p style={{ color: S.muted, marginBottom: 28, lineHeight: 1.6 }}>Delivered anonymously. They have no idea who you are.</p>
              <button onClick={() => { setMsg(''); setSticker(null); setAudioBlob(null); setAudioBlobUrl(null); setSelectedPoll(null); setSelectedQuiz(null); setSent(false) }}
                style={{ padding: '12px 28px', borderRadius: 14, background: 'rgba(124,77,255,0.12)', border: '1px solid rgba(124,77,255,0.3)', color: '#c084fc', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Send another
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string
  try {
    const q    = query(collection(db, COLLECTIONS.USERS), where('linkSlug', '==', slug))
    const snap = await getDocs(q)
    if (snap.empty) return { props: { user: null } }
    const u = snap.docs[0].data() as any
    return {
      props: {
        user: {
          uid:             u.uid,
          username:        u.username,
          displayName:     u.displayName,
          photoURL:        u.photoURL        ?? null,
          stickerId:       u.stickerId       ?? null,
          linkSlug:        u.linkSlug,
          bio:             u.bio             ?? null,
          linkMode:        u.linkMode        || 'text',
          linkQuestion:    u.linkQuestion    ?? null,
          linkPollOptions: u.linkPollOptions ?? null,
          linkQuizOptions: u.linkQuizOptions ?? null,
          linkQuizAnswer:  u.linkQuizAnswer  ?? null,
        },
      },
    }
  } catch { return { props: { user: null } } }
}
