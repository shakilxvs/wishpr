import Head                    from 'next/head'
import { useRouter }           from 'next/router'
import React, { useEffect, useState, useRef } from 'react'
import { motion }              from 'framer-motion'
import {
  collection, query, where, onSnapshot,
  addDoc, orderBy, doc, getDoc, getDocs,
}                              from 'firebase/firestore'
import { db, COLLECTIONS }     from '@/lib/firebase'
import { useAuthStore }        from '@/store/authStore'
import { useT }                from '@/lib/theme'
import { ROUTES }              from '@/constants/routes'
import { WishprUser }          from '@/types'
import { nanoid }              from 'nanoid'
import { startRecording, stopRecording, VoiceEffect } from '@/lib/audio'
import { uploadAudio }         from '@/lib/cloudinary'
import {
  Ghost, Send, Search, MessageCircle, Lock,
  Mic, Square, X, ArrowLeft, Volume2,
} from 'lucide-react'
import { Avatar } from '@/components/Avatars'

interface DM {
  id: string; threadId: string; fromUserId: string; toUserId: string
  content: string; audioUrl?: string; isVoice: boolean; isRead: boolean; createdAt: number
}

export default function MessagesPage() {
  const router = useRouter()
  const S      = useT()
  const { wishprUser, firebaseUser, isLoading } = useAuthStore()

  const [threads, setThreads]     = useState<{ threadId: string; other: WishprUser | null; lastMsg: string; lastAt: number; unread: number }[]>([])
  const [active, setActive]       = useState<{ threadId: string; other: WishprUser | null } | null>(null)
  const [messages, setMessages]   = useState<DM[]>([])
  const [newMsg, setNewMsg]       = useState('')
  const [sending, setSending]     = useState(false)
  const [search, setSearch]       = useState('')
  const [searchRes, setSearchRes] = useState<WishprUser | null>(null)
  const [searchErr, setSearchErr] = useState('')
  const [searching, setSearching] = useState(false)
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [recSecs, setRecSecs]     = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null)
  const [vfx]                     = useState<VoiceEffect>('none')
  const [uploadingAudio, setUploadingAudio] = useState(false)
  // Mobile: show chat panel vs thread list
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoading && !firebaseUser) { router.replace(ROUTES.SIGN_IN); return }
    if (wishprUser) loadThreads()
  }, [wishprUser, firebaseUser, isLoading])

  useEffect(() => {
    const withUser = router.query.with as string
    if (withUser && wishprUser) openByUsername(withUser)
  }, [router.query.with, wishprUser])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadThreads() {
    if (!wishprUser) return
    setLoadingThreads(true)
    try {
      const [s1, s2] = await Promise.all([
        getDocs(query(collection(db, COLLECTIONS.DIRECT_MESSAGES), where('fromUserId', '==', wishprUser.uid))),
        getDocs(query(collection(db, COLLECTIONS.DIRECT_MESSAGES), where('toUserId',   '==', wishprUser.uid))),
      ])
      const allMsgs = [...s1.docs, ...s2.docs].map(d => d.data() as DM)
      const byThread: Record<string, DM[]> = {}
      allMsgs.forEach(m => {
        if (!byThread[m.threadId]) byThread[m.threadId] = []
        byThread[m.threadId].push(m)
      })
      const result = await Promise.all(
        Object.entries(byThread).map(async ([threadId, msgs]) => {
          msgs.sort((a, b) => b.createdAt - a.createdAt)
          const last    = msgs[0]
          const otherId = last.fromUserId === wishprUser.uid ? last.toUserId : last.fromUserId
          const unread  = msgs.filter(m => m.toUserId === wishprUser.uid && !m.isRead).length
          let other: WishprUser | null = null
          try {
            const u = await getDoc(doc(db, COLLECTIONS.USERS, otherId))
            if (u.exists()) other = u.data() as WishprUser
          } catch {}
          return { threadId, other, lastMsg: last.isVoice ? '🎤 Voice' : last.content, lastAt: last.createdAt, unread }
        })
      )
      result.sort((a, b) => b.lastAt - a.lastAt)
      setThreads(result)
    } catch (e) { console.error('loadThreads:', e) }
    finally { setLoadingThreads(false) }
  }

  function openThread(threadId: string, other: WishprUser | null) {
    setActive({ threadId, other })
    setMessages([])
    setMobileView('chat')
    const q = query(
      collection(db, COLLECTIONS.DIRECT_MESSAGES),
      where('threadId', '==', threadId),
      orderBy('createdAt', 'asc')
    )
    onSnapshot(q, snap => setMessages(snap.docs.map(d => d.data() as DM)), () => {})
  }

  async function openByUsername(username: string) {
    if (!wishprUser) return
    try {
      const q    = query(collection(db, COLLECTIONS.USERS), where('username', '==', username.toLowerCase()))
      const snap = await getDocs(q)
      if (!snap.empty) {
        const other    = snap.docs[0].data() as WishprUser
        const threadId = [wishprUser.uid, other.uid].sort().join('_')
        openThread(threadId, other)
      }
    } catch {}
  }

  async function handleSearch() {
    if (!search.trim() || !wishprUser) return
    setSearching(true); setSearchErr('')
    try {
      const q    = query(collection(db, COLLECTIONS.USERS), where('username', '==', search.trim().toLowerCase().replace('@', '')))
      const snap = await getDocs(q)
      if (snap.empty) { setSearchErr('User not found'); setSearchRes(null) }
      else {
        const u = snap.docs[0].data() as WishprUser
        if (u.uid === wishprUser.uid) { setSearchErr("That's you!"); setSearchRes(null) }
        else if (u.messagePrivacy === 'nobody') { setSearchErr('This user has disabled DMs'); setSearchRes(null) }
        else setSearchRes(u)
      }
    } catch { setSearchErr('Search failed') }
    finally { setSearching(false) }
  }

  async function sendMessage() {
    if (!wishprUser || !active || !active.other) return
    let audioUrl: string | undefined
    if (audioBlob) {
      setUploadingAudio(true)
      try { audioUrl = await uploadAudio(audioBlob, wishprUser.uid) } catch {}
      setUploadingAudio(false)
    }
    if (!audioBlob && !newMsg.trim()) return
    setSending(true)
    try {
      const dm: DM = {
        id: nanoid(), threadId: active.threadId,
        fromUserId: wishprUser.uid,
        toUserId: active.other.uid,
        content: newMsg.trim(),
        isVoice: !!audioUrl,
        audioUrl,
        isRead: false,
        createdAt: Date.now(),
      }
      await addDoc(collection(db, COLLECTIONS.DIRECT_MESSAGES), dm)
      setNewMsg(''); setAudioBlob(null); setAudioBlobUrl(null)
      loadThreads()
    } catch (e) { console.error('sendMessage:', e) }
    finally { setSending(false) }
  }

  async function startRec() {
    setIsRecording(true); setRecSecs(0); setAudioBlobUrl(null); setAudioBlob(null)
    try {
      await startRecording(vfx, s => setRecSecs(s), b => {
        setIsRecording(false); setAudioBlob(b); setAudioBlobUrl(URL.createObjectURL(b))
      })
    } catch { alert('Mic access denied'); setIsRecording(false) }
  }

  function timeAgo(ts: number) {
    const d = Date.now() - ts, m = Math.floor(d / 60000), h = Math.floor(d / 3600000)
    if (m < 1) return 'now'; if (m < 60) return `${m}m`; if (h < 24) return `${h}h`
    return new Date(ts).toLocaleDateString()
  }

  if (isLoading || (firebaseUser && !wishprUser)) {
    return (
      <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <Ghost size={32} color="#7c4dff" />
        </motion.div>
      </div>
    )
  }
  if (!wishprUser) return null

  // Online = lastSeen within 3 minutes
  function onlineStatus(user: WishprUser | null): 'online' | 'away' | 'offline' {
    if (!user) return 'offline'
    const ls = (user as any).lastSeen
    if (!ls) return 'offline'
    const diff = Date.now() - ls
    if (diff < 3 * 60 * 1000) return 'online'
    if (diff < 15 * 60 * 1000) return 'away'
    return 'offline'
  }

  const statusColors = { online: '#22c55e', away: '#f59e0b', offline: '#6b7280' }

  const inputS: React.CSSProperties = {
    flex: 1, padding: '11px 14px', borderRadius: 12,
    background: S.input, border: `1px solid ${S.border}`,
    color: S.text, fontSize: 14, outline: 'none', fontFamily: 'Manrope',
  }

  // ── Thread list panel (shared between mobile + desktop) ──────────────────
  const ThreadList = (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', background: S.cardSolid,
    }}>
      {/* Header + search */}
      <div style={{ padding: '14px 14px 10px', borderBottom: `1px solid ${S.border}`, flexShrink: 0 }}>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: S.text, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
          <MessageCircle size={16} color="#7c4dff" /> Messages
        </h2>
        <div style={{ display: 'flex', gap: 7 }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="@username"
            style={{ ...inputS, fontSize: 13, padding: '8px 12px' }}
          />
          <button
            onClick={handleSearch} disabled={searching}
            style={{ padding: '0 12px', borderRadius: 11, background: '#7c4dff', border: 'none', color: '#fff', cursor: 'pointer', flexShrink: 0 }}
          >
            <Search size={14} />
          </button>
        </div>
        {searchErr && <p style={{ color: S.danger, fontSize: 12, marginTop: 7 }}>{searchErr}</p>}
        {searchRes && (
          <button
            onClick={() => {
              const tid = [wishprUser.uid, searchRes.uid].sort().join('_')
              openThread(tid, searchRes)
              setSearchRes(null); setSearch('')
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 9, padding: '9px 12px', width: '100%', borderRadius: 11, background: 'rgba(124,77,255,0.1)', border: '1px solid rgba(124,77,255,0.25)', cursor: 'pointer', textAlign: 'left' }}
          >
            <Avatar stickerId={searchRes.stickerId} size={30} />
            <div>
              <p style={{ color: S.text, fontWeight: 600, fontSize: 13 }}>@{searchRes.username}</p>
              {searchRes.countryFlag && <p style={{ color: S.faint, fontSize: 11 }}>{searchRes.countryFlag}</p>}
            </div>
          </button>
        )}
      </div>

      {/* Thread list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {threads.length === 0 && !loadingThreads && (
          <div style={{ padding: '40px 16px', textAlign: 'center' }}>
            <MessageCircle size={32} color={S.border} style={{ margin: '0 auto 10px', display: 'block' }} />
            <p style={{ color: S.faint, fontSize: 13 }}>No conversations yet</p>
            <p style={{ color: S.faint, fontSize: 12, marginTop: 4 }}>Search a @username above to start</p>
          </div>
        )}
        {threads.map(t => (
          <button
            key={t.threadId}
            onClick={() => openThread(t.threadId, t.other)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 14px', width: '100%',
              background: active?.threadId === t.threadId ? 'rgba(124,77,255,0.1)' : 'transparent',
              border: 'none', borderBottom: `1px solid ${S.border}`,
              cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
            }}
          >
            <Avatar stickerId={t.other?.stickerId} size={38} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                  <p style={{ color: S.text, fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    @{t.other?.username || '…'}
                  </p>
                  {(() => {
                    const status = onlineStatus(t.other)
                    return <div style={{ width: 7, height: 7, borderRadius: '50%', background: statusColors[status], flexShrink: 0 }} />
                  })()}
                </div>
                <p style={{ color: S.faint, fontSize: 11, flexShrink: 0, marginLeft: 8 }}>{timeAgo(t.lastAt)}</p>
              </div>
              <p style={{ color: S.faint, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                {t.lastMsg}
              </p>
            </div>
            {t.unread > 0 && (
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#7c4dff', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {t.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )

  // ── Chat panel ────────────────────────────────────────────────────────────
  const ChatPanel = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: S.bg, overflow: 'hidden', minHeight: 0 }}>
      {!active ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <MessageCircle size={44} color={S.border} />
          <p style={{ color: S.muted, fontWeight: 600 }}>Select a conversation</p>
          <p style={{ color: S.faint, fontSize: 13 }}>Search a @username to start a new chat</p>
        </div>
      ) : (
        <>
          {/* Chat header */}
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', gap: 10, background: S.cardSolid, flexShrink: 0 }}>
            {/* Back arrow — only visible on mobile */}
            <button
              onClick={() => { setMobileView('list'); setActive(null) }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 10, background: S.card, border: `1px solid ${S.border}`, color: S.muted, cursor: 'pointer', flexShrink: 0 }}
              className="mobile-back-btn"
            >
              <ArrowLeft size={16} />
            </button>
            <Avatar stickerId={active.other?.stickerId} size={38} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: S.text, fontWeight: 700, fontSize: 15 }}>@{active.other?.username}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                {(() => {
                  const status = onlineStatus(active.other)
                  return (
                    <>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[status], flexShrink: 0 }} />
                      <span style={{ color: S.faint, fontSize: 12 }}>
                        {status === 'online' ? 'Online' : status === 'away' ? 'Away' : 'Offline'}
                      </span>
                    </>
                  )
                })()}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
              <Lock size={12} color={S.faint} /><span style={{ color: S.faint, fontSize: 11 }}>Private</span>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.length === 0 && (
              <p style={{ color: S.faint, fontSize: 14, textAlign: 'center', paddingTop: 40 }}>Start the conversation!</p>
            )}
            {messages.map((m, i) => {
              const isMe = m.fromUserId === wishprUser.uid
              return (
                <div key={m.id || i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '75%', padding: '10px 13px',
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isMe ? '#7c4dff' : S.card,
                    border: `1px solid ${isMe ? 'transparent' : S.border}`,
                  }}>
                    {m.isVoice && m.audioUrl ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                          <Volume2 size={12} color={isMe ? 'rgba(255,255,255,0.7)' : '#7c4dff'} />
                          <span style={{ color: isMe ? 'rgba(255,255,255,0.7)' : '#7c4dff', fontSize: 11 }}>Voice</span>
                        </div>
                        <audio controls src={m.audioUrl} style={{ width: '100%' }} />
                      </div>
                    ) : (
                      <p style={{ color: isMe ? '#fff' : S.text, fontSize: 14, lineHeight: 1.5 }}>{m.content}</p>
                    )}
                    <p style={{ color: isMe ? 'rgba(255,255,255,0.5)' : S.faint, fontSize: 11, marginTop: 4 }}>
                      {timeAgo(m.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={endRef} />
          </div>

          {/* Input area */}
          <div style={{ padding: '10px 12px', borderTop: `1px solid ${S.border}`, background: S.cardSolid, flexShrink: 0 }}>
            {audioBlobUrl && (
              <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <audio controls src={audioBlobUrl} style={{ flex: 1 }} />
                <button
                  onClick={() => { setAudioBlob(null); setAudioBlobUrl(null) }}
                  style={{ background: 'none', border: 'none', color: S.faint, cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* Voice record */}
              {!isRecording ? (
                <button
                  onClick={startRec} title="Voice message"
                  style={{ width: 40, height: 40, borderRadius: 11, background: S.card, border: `1px solid ${S.border}`, color: S.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                >
                  <Mic size={17} />
                </button>
              ) : (
                <motion.button
                  onClick={() => { stopRecording(); setIsRecording(false) }}
                  animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 0.5, repeat: Infinity }}
                  style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: S.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                >
                  <Square size={15} fill={S.danger} />
                </motion.button>
              )}

              {!audioBlobUrl && (
                <input
                  value={newMsg} onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder={isRecording ? `Recording… ${recSecs}s` : `Message @${active.other?.username}…`}
                  disabled={isRecording}
                  style={inputS}
                />
              )}

              <button
                onClick={sendMessage}
                disabled={sending || uploadingAudio || (!newMsg.trim() && !audioBlob)}
                style={{
                  width: 40, height: 40, borderRadius: 11,
                  background: S.brand, border: 'none', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: sending || (!newMsg.trim() && !audioBlob) ? 'not-allowed' : 'pointer',
                  opacity: !newMsg.trim() && !audioBlob ? 0.5 : 1,
                  flexShrink: 0,
                }}
              >
                {sending ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity }}><Ghost size={16} /></motion.div> : <Send size={16} />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )

  return (
    <>
      <Head><title>Messages — Wishpr Xvs</title></Head>

      {/* ── DESKTOP layout (≥ 640px) — side-by-side panels ── */}
      <main style={{ height: '100vh', background: S.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} className="dm-root has-bottom-nav">
        <style>{`
          @media (max-width: 639px) {
            .dm-desktop { display: none !important; }
          }
          @media (min-width: 640px) {
            .dm-desktop { display: flex !important; }
            .dm-mobile-list { display: none !important; }
            .dm-mobile-chat { display: none !important; }
            .mobile-back-btn { display: none !important; }
          }
        `}</style>

        {/* Page header with back button — shown on all DM views */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${S.border}`, background: S.navBg, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', flexShrink: 0, zIndex: 10 }}>
          <button onClick={() => router.back()}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: S.card, border: `1px solid ${S.border}`, color: S.muted, cursor: 'pointer', flexShrink: 0 }}>
            <ArrowLeft size={17} />
          </button>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 17, color: S.text }}>Messages</h1>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Lock size={12} color={S.faint} />
            <span style={{ color: S.faint, fontSize: 12 }}>End-to-end encrypted</span>
          </div>
        </div>

        {/* DESKTOP */}
        <div className="dm-desktop" style={{ flex: 1, overflow: 'hidden', paddingBottom: 0, display: 'none' }}>
          {/* Sidebar */}
          <div style={{ width: 300, flexShrink: 0, borderRight: `1px solid ${S.border}`, display: 'flex', flexDirection: 'column', height: '100%' }}>
            {ThreadList}
          </div>
          {/* Chat */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {ChatPanel}
          </div>
        </div>

        {/* MOBILE — Thread list */}
        <div
          style={{
            flex: 1, flexDirection: 'column', overflow: 'hidden',
            display: mobileView === 'list' ? 'flex' : 'none',
          }}
          className="dm-mobile-list"
        >
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {ThreadList}
          </div>
        </div>

        {/* MOBILE — Chat */}
        <div
          style={{
            flex: 1, flexDirection: 'column', overflow: 'hidden',
            display: mobileView === 'chat' ? 'flex' : 'none',
          }}
          className="dm-mobile-chat"
        >
          {ChatPanel}
        </div>
      </main>
    </>
  )
}
