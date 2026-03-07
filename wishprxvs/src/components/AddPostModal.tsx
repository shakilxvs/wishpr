import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { addDoc, collection }  from 'firebase/firestore'
import { db, COLLECTIONS }     from '@/lib/firebase'
import { useAuthStore }        from '@/store/authStore'
import { useT }                from '@/lib/theme'
import { LIMITS }              from '@/constants/limits'
import { Post, ReactionKey }   from '@/types'
import { nanoid }              from 'nanoid'
import { getLocationInfo } from '@/lib/utils'
import { startRecording, stopRecording, VoiceEffect } from '@/lib/audio'
import { uploadAudio }         from '@/lib/cloudinary'
import { X, Send, Mic, Square, BarChart2, FileText, PlusCircle } from 'lucide-react'

type PostMode = 'post' | 'poll' | 'voice'
type PostType = 'post' | 'confession' | 'shoutout' | 'crush' | 'debate'

const VOICE_FX: { key: VoiceEffect; label: string }[] = [
  { key: 'none',     label: 'Normal'    },
  { key: 'deep',     label: 'Deep'      },
  { key: 'chipmunk', label: 'Chipmunk'  },
  { key: 'robot',    label: 'Robot'     },
  { key: 'ghost',    label: 'Ghost'     },
]

interface Props {
  onClose: () => void
  onPosted?: () => void
}

export default function AddPostModal({ onClose, onPosted }: Props) {
  const S = useT()
  const { wishprUser } = useAuthStore()

  const [mode, setMode]           = useState<PostMode>('post')
  const [type, setType]           = useState<PostType>('post')
  const [content, setContent]     = useState('')
  const [pollOptions, setPoll]    = useState(['', ''])
  const [debateA, setDebateA]     = useState('')
  const [debateB, setDebateB]     = useState('')
  const [vfx, setVfx]             = useState<VoiceEffect>('none')
  const [recording, setRecording] = useState(false)
  const [recSecs, setRecSecs]     = useState(0)
  const [blob, setBlob]           = useState<Blob | null>(null)
  const [blobUrl, setBlobUrl]     = useState<string | null>(null)
  const [posting, setPosting]     = useState(false)
  const [uploading, setUploading] = useState(false)

  const emptyReactions = { heart: 0, funny: 0, sad: 0, angry: 0, wow: 0 } as Record<ReactionKey, number>

  const canPost = !posting && (
    (mode === 'post'  && content.trim().length > 0) ||
    (mode === 'poll'  && content.trim().length > 0 && pollOptions.filter(o => o.trim()).length >= 2) ||
    (mode === 'voice' && blob != null)
  )

  async function submit() {
    if (!wishprUser || !canPost) return
    setPosting(true)
    try {
      let audioUrl: string | undefined
      if (mode === 'voice' && blob) {
        setUploading(true)
        audioUrl = await uploadAudio(blob, wishprUser.uid)
        setUploading(false)
      }

      const loc  = wishprUser.countryFlag
        ? { flag: wishprUser.countryFlag, city: wishprUser.cityLabel || '' }
        : getLocationInfo(wishprUser.address)
      const flag = loc.flag

      const base = {
        id: nanoid(),
        authorId:         wishprUser.uid,
        authorUsername:   wishprUser.username,
        authorFlag:       flag,
        authorCity:       loc.city,
        authorVisibility: wishprUser.usernameVisibility,
        authorStickerId:  wishprUser.stickerId || 'ghost_classic',
        reactions:        emptyReactions,
        reactedBy:        {},
        replyCount:       0,
        viewCount:        0,
        isExpired:        false,
        createdAt:        Date.now(),
      }

      if (mode === 'poll') {
        const opts = pollOptions.filter(o => o.trim()).map((o, i) => ({
          id: String(i), label: o.trim(), votes: 0, votedBy: [],
        }))
        await addDoc(collection(db, COLLECTIONS.POSTS), {
          ...base, type: 'poll', content: content.trim() || 'Poll', isVoice: false, pollOptions: opts,
        })
      } else if (mode === 'voice' && audioUrl) {
        await addDoc(collection(db, COLLECTIONS.POSTS), {
          ...base, type, content: '', isVoice: true, audioUrl,
        })
      } else {
        const extra: any = {}
        if (type === 'debate') {
          extra.debateSideA = 0; extra.debateSideB = 0
          extra.sideALabel  = debateA.trim() || 'Side A'
          extra.sideBLabel  = debateB.trim() || 'Side B'
        }
        await addDoc(collection(db, COLLECTIONS.POSTS), {
          ...base, type, content: content.trim(), isVoice: false, ...extra,
        })
      }
      onPosted?.(); onClose()
    } catch (e) { console.error(e) }
    finally { setPosting(false); setUploading(false) }
  }

  async function startRec() {
    setRecording(true); setRecSecs(0); setBlobUrl(null); setBlob(null)
    try {
      await startRecording(vfx, s => setRecSecs(s), b => {
        setRecording(false); setBlob(b); setBlobUrl(URL.createObjectURL(b))
      })
    } catch { alert('Microphone access denied.'); setRecording(false) }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    background: S.input, border: `1px solid ${S.border}`,
    color: S.text, fontSize: 14, outline: 'none', fontFamily: 'Manrope',
  }
  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '7px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', border: 'none', transition: 'all 0.18s',
    background: active ? '#7c4dff' : 'rgba(255,255,255,0.06)',
    color:      active ? '#fff'    : S.muted,
  })
  const typeBtn = (active: boolean): React.CSSProperties => ({
    padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
    cursor: 'pointer', border: `1px solid ${active ? 'rgba(124,77,255,0.5)' : S.border}`,
    background: active ? 'rgba(124,77,255,0.12)' : 'transparent',
    color: active ? '#c084fc' : S.faint, transition: 'all 0.15s',
  })

  return (
    <AnimatePresence>
      <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: S.overlay, zIndex: 200, backdropFilter: 'blur(4px)' }}
      />
      <motion.div key="sheet"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
          background: S.cardSolid, borderRadius: '20px 20px 0 0',
          padding: '0 16px 32px', maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.4)',
        }}>

        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: S.border }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, paddingTop: 4 }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: S.text }}>New Post</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: S.muted }}>
            <X size={20} />
          </button>
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button style={tabBtn(mode === 'post')}  onClick={() => setMode('post')}>
            <FileText size={13} style={{ display:'inline', marginRight:5 }} />Post
          </button>
          <button style={tabBtn(mode === 'poll')}  onClick={() => setMode('poll')}>
            <BarChart2 size={13} style={{ display:'inline', marginRight:5 }} />Poll
          </button>
          <button style={tabBtn(mode === 'voice')} onClick={() => setMode('voice')}>
            <Mic size={13} style={{ display:'inline', marginRight:5 }} />Voice
          </button>
        </div>

        {/* Category (only for post/voice mode) */}
        {mode !== 'poll' && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {(['post','confession','shoutout','crush','debate'] as PostType[]).map(t => (
              <button key={t} style={typeBtn(type === t)} onClick={() => setType(t)}>
                {{ post:'Post', confession:'Confession', shoutout:'Shoutout', crush:'Crush', debate:'Debate' }[t]}
              </button>
            ))}
          </div>
        )}

        {/* ── POST / CONFESSION / SHOUTOUT / CRUSH ── */}
        {mode === 'post' && type !== 'debate' && (
          <textarea value={content} onChange={e => setContent(e.target.value)}
            placeholder={{ post:'Share something anonymously…', confession:'Confess something…', shoutout:'Give someone a shoutout without naming them…', crush:'Describe your crush anonymously…', debate:'' }[type]}
            rows={4} maxLength={LIMITS.MAX_POST_LENGTH}
            style={{ ...inputStyle, resize: 'none', lineHeight: 1.65 }}
          />
        )}

        {/* ── DEBATE ── */}
        {mode === 'post' && type === 'debate' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="What's being debated?" rows={2} maxLength={200}
              style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={debateA} onChange={e => setDebateA(e.target.value)} placeholder="Side A label"
                style={{ ...inputStyle, flex: 1 }} />
              <input value={debateB} onChange={e => setDebateB(e.target.value)} placeholder="Side B label"
                style={{ ...inputStyle, flex: 1 }} />
            </div>
          </div>
        )}

        {/* ── POLL ── */}
        {mode === 'poll' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={content} onChange={e => setContent(e.target.value)} placeholder="Poll question (optional)"
              style={inputStyle} />
            {pollOptions.map((opt, i) => (
              <div key={i} style={{ display: 'flex', gap: 8 }}>
                <input value={opt} onChange={e => { const n = [...pollOptions]; n[i] = e.target.value; setPoll(n) }}
                  placeholder={`Option ${i + 1}`} style={{ ...inputStyle, flex: 1 }} />
                {pollOptions.length > 2 && (
                  <button onClick={() => setPoll(pollOptions.filter((_,j) => j !== i))}
                    style={{ padding: '0 10px', borderRadius: 9, background: 'rgba(239,68,68,0.08)', border: 'none', color: S.danger, cursor: 'pointer' }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            {pollOptions.length < 5 && (
              <button onClick={() => setPoll([...pollOptions, ''])}
                style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#7c4dff', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                <PlusCircle size={14} /> Add option
              </button>
            )}
          </div>
        )}

        {/* ── VOICE ── */}
        {mode === 'voice' && (
          <div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {VOICE_FX.map(f => (
                <button key={f.key} onClick={() => setVfx(f.key)}
                  style={{ padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
                    background: vfx === f.key ? 'rgba(124,77,255,0.22)' : 'rgba(255,255,255,0.05)',
                    color:      vfx === f.key ? '#c084fc' : S.muted }}>
                  {f.label}
                </button>
              ))}
            </div>
            {!blobUrl ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                {!recording ? (
                  <button onClick={startRec}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 auto', padding: '14px 28px', borderRadius: 16, background: 'rgba(124,77,255,0.12)', border: '1px solid rgba(124,77,255,0.3)', color: '#c084fc', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                    <Mic size={20} /> Record (max {LIMITS.MAX_VOICE_SECONDS}s)
                  </button>
                ) : (
                  <div>
                    <motion.button onClick={() => { stopRecording(); setRecording(false) }}
                      animate={{ scale: [1,1.05,1] }} transition={{ duration: 0.6, repeat: Infinity }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 auto', padding: '14px 28px', borderRadius: 16, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: S.danger, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                      <Square size={16} fill={S.danger} /> Stop ({recSecs}s)
                    </motion.button>
                    <div style={{ width: '100%', height: 4, background: S.border, borderRadius: 2, marginTop: 14, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: S.brand, borderRadius: 2, width: `${(recSecs/LIMITS.MAX_VOICE_SECONDS)*100}%`, transition: 'width 1s linear' }} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <audio controls src={blobUrl} style={{ width: '100%', marginBottom: 10 }} />
                <button onClick={() => { setBlob(null); setBlobUrl(null) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, color: S.danger, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>
                  <X size={12} /> Re-record
                </button>
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        <button onClick={submit} disabled={!canPost}
          style={{ marginTop: 18, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 14, background: S.brand, color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: !canPost ? 'not-allowed' : 'pointer', opacity: !canPost ? 0.5 : 1 }}>
          <Send size={16} />
          {uploading ? 'Uploading…' : posting ? 'Posting…' : 'Post anonymously'}
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
