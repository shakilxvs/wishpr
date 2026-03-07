import Head                    from 'next/head'
import Link                    from 'next/link'
import { useRouter }           from 'next/router'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, doc, getDoc, getDocs, increment,
}                              from 'firebase/firestore'
import { db, COLLECTIONS }     from '@/lib/firebase'
import { useAuthStore }        from '@/store/authStore'
import { useT }                from '@/lib/theme'
import { ROUTES }              from '@/constants/routes'
import { Group, Post }         from '@/types'
import { nanoid }              from 'nanoid'
import {
  Ghost, ArrowLeft, Users, Send, Copy, Check,
  MessageSquare, ChevronDown, ChevronUp, Lock, ThumbsUp, ThumbsDown,
} from 'lucide-react'

export default function GroupPage() {
  const router  = useRouter()
  const { id }  = router.query as { id: string }
  const S       = useT()
  const { wishprUser, firebaseUser, isLoading } = useAuthStore()

  const [group, setGroup]       = useState<Group | null>(null)
  const [posts, setPosts]       = useState<(Post & { _docId: string })[]>([])
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading]   = useState(true)
  const [content, setContent]   = useState('')
  const [posting, setPosting]   = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const [openReply, setOpenReply]   = useState<string | null>(null)
  const [replies, setReplies]       = useState<Record<string, any[]>>({})
  const [replyText, setReplyText]   = useState('')

  useEffect(() => {
    if (!isLoading && !firebaseUser) { router.replace(ROUTES.SIGN_IN); return }
    if (!id || !wishprUser) return
    loadGroup()
  }, [id, wishprUser, firebaseUser, isLoading])

  async function loadGroup() {
    if (!id || !wishprUser) return
    setLoading(true)
    try {
      const gdoc = await getDoc(doc(db, 'groups', id))
      if (!gdoc.exists()) { router.replace(ROUTES.GROUPS); return }
      setGroup(gdoc.data() as Group)

      // Check membership
      const memQ  = query(collection(db, 'group_members'), where('uid', '==', wishprUser.uid), where('groupId', '==', id))
      const memSn = await getDocs(memQ)
      if (memSn.empty) { router.replace(ROUTES.GROUPS); return }
      setIsMember(true)

      // Subscribe to posts — no orderBy to avoid composite index; sort client-side
      const pq = query(collection(db, COLLECTIONS.POSTS), where('groupId', '==', id))
      onSnapshot(pq, snap => {
        const docs = snap.docs.map(d => ({ _docId: d.id, ...d.data() } as any))
        docs.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0))
        setPosts(docs)
        setLoading(false)
      }, (err) => { console.error('Group posts error:', err); setLoading(false) })
    } catch (e) { console.error(e); setLoading(false) }
  }

  async function handlePost() {
    if (!wishprUser || !content.trim() || !id) return
    setPosting(true)
    try {
      await addDoc(collection(db, COLLECTIONS.POSTS), {
        id: nanoid(), authorId: wishprUser.uid, type: 'standard',
        content: content.trim(), groupId: id, isGroupPost: true, isVoice: false,
        reactions: {}, moodTags: { bold: 0, dark: 0, soft: 0 },
        replyCount: 0, viewCount: 0, readBy: [], isExpired: false,
        createdAt: Date.now(),
      })
      await updateDoc(doc(db, 'groups', id), { postCount: increment(1) })
      setContent('')
    } catch (e) { console.error(e) }
    finally { setPosting(false) }
  }

  async function reactToPost(docId: string, reaction: 'thumbsup' | 'thumbsdown') {
    if (!wishprUser) return
    const post = posts.find(p => p._docId === docId)
    if (!post) return
    const already = (post as any).reactedBy?.[wishprUser.uid]
    if (already) return // 1 reaction per user
    await updateDoc(doc(db, COLLECTIONS.POSTS, docId), {
      [`reactions.${reaction}`]:           increment(1),
      [`reactedBy.${wishprUser.uid}`]: reaction,
    }).catch(() => {})
  }

  async function toggleReplies(postId: string, docId: string) {
    if (openReply === postId) { setOpenReply(null); return }
    setOpenReply(postId)
    if (replies[postId]) return
    try {
      const q    = query(collection(db, COLLECTIONS.POSTS, docId, 'replies'), orderBy('createdAt', 'asc'))
      const snap = await getDocs(q)
      setReplies(prev => ({ ...prev, [postId]: snap.docs.map(d => d.data()) }))
    } catch { setReplies(prev => ({ ...prev, [postId]: [] })) }
  }

  async function submitReply(postId: string, docId: string) {
    if (!replyText.trim()) return
    const reply = { id: nanoid(), content: replyText.trim(), createdAt: Date.now() }
    await addDoc(collection(db, COLLECTIONS.POSTS, docId, 'replies'), reply).catch(() => {})
    await updateDoc(doc(db, COLLECTIONS.POSTS, docId), { replyCount: increment(1) }).catch(() => {})
    setReplies(prev => ({ ...prev, [postId]: [...(prev[postId] || []), reply] }))
    setReplyText('')
  }

  function copyCode() {
    if (group) {
      navigator.clipboard.writeText(group.inviteCode).then(() => { setCodeCopied(true); setTimeout(() => setCodeCopied(false), 2000) })
    }
  }

  function timeAgo(ts: number) {
    const diff = Date.now() - ts
    const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    if (h < 24) return `${h}h ago`
    return `${d}d ago`
  }

  if (loading || !group) {
    return (
      <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <Ghost size={32} color="#7c4dff" />
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <Head><title>{group.name} — Wishpr Xvs</title></Head>
      {/* No has-bottom-nav class — bottom nav is hidden on /groups/[id] by BottomNav.tsx */}
      <main style={{ minHeight: '100vh', background: S.bg, display: 'flex', flexDirection: 'column' }}>

        {/* Sticky header — Back + "Messages" style */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${S.border}`, background: S.navBg, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', flexShrink: 0 }}>
          <Link href={ROUTES.GROUPS} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: S.card, border: `1px solid ${S.border}`, color: S.muted, textDecoration: 'none', flexShrink: 0 }}>
            <ArrowLeft size={17} />
          </Link>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: S.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {group.name}
            </h1>
            <p style={{ color: S.faint, fontSize: 12, marginTop: 1 }}>{group.memberCount} members · private group</p>
          </div>
          {/* Only the creator can see and share the invite code */}
          {wishprUser?.uid === group.createdBy && (
            <button onClick={copyCode}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, background: codeCopied ? 'rgba(16,185,129,0.12)' : 'rgba(124,77,255,0.1)', border: `1px solid ${codeCopied ? 'rgba(16,185,129,0.35)' : 'rgba(124,77,255,0.3)'}`, color: codeCopied ? '#10b981' : '#7c4dff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '0.1em', flexShrink: 0, transition: 'all 0.2s' }}>
              {codeCopied ? <Check size={14} /> : <Copy size={14} />}
              {group.inviteCode}
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <Lock size={13} color={S.faint} />
          </div>
        </div>

        <div style={{ maxWidth: 640, margin: '0 auto', width: '100%', padding: '16px 16px', flex: 1 }}>

          {group.description && (
            <div style={{ background: 'rgba(124,77,255,0.06)', border: '1px solid rgba(124,77,255,0.18)', borderRadius: 12, padding: '10px 16px', marginBottom: 20 }}>
              <p style={{ color: S.muted, fontSize: 13 }}>{group.description}</p>
            </div>
          )}

          {/* Private indicator banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 12, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: 20 }}>
            <Lock size={13} color="#10b981" />
            <p style={{ color: '#10b981', fontSize: 12, fontWeight: 600 }}>End-to-end private · messages never appear in the community feed</p>
          </div>

          {/* Post box */}
          <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 18, padding: 18, marginBottom: 22 }}>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder={`Post anonymously to ${group.name}…`}
              rows={3} maxLength={1000}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost() }}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: S.input, border: `1px solid ${S.border}`, color: S.text, fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'Manrope', lineHeight: 1.6 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <p style={{ color: S.faint, fontSize: 12 }}>Identity hidden from all members</p>
              <button onClick={handlePost} disabled={posting || !content.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: S.brand, color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: posting || !content.trim() ? 'not-allowed' : 'pointer', opacity: !content.trim() ? 0.5 : 1 }}>
                <Send size={14} /> {posting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>

          {/* Posts */}
          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 50 }}>
              <Lock size={40} color="#252535" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ color: S.muted, fontWeight: 600 }}>Nothing here yet</p>
              <p style={{ color: S.faint, fontSize: 13, marginTop: 6 }}>Be the first to post something anonymously</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {posts.map((post, i) => (
                <motion.div key={post._docId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 16px 12px' }}>
                    <p style={{ color: S.text, fontSize: 15, lineHeight: 1.7, marginBottom: 12 }}>{post.content}</p>

                    {/* Reactions — thumbs up / down only, 1 per user */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                      {([
                        { key: 'thumbsup' as const,   Icon: ThumbsUp,   color: '#7c4dff' },
                        { key: 'thumbsdown' as const, Icon: ThumbsDown, color: '#f87171' },
                      ]).map(({ key, Icon, color }) => {
                        const count   = (post.reactions as any)?.[key] || 0
                        const myRx    = wishprUser ? (post as any).reactedBy?.[wishprUser.uid] : undefined
                        const isMine  = myRx === key
                        const already = !!myRx
                        return (
                          <button key={key} onClick={() => !already && reactToPost(post._docId, key)}
                            title={already ? (isMine ? 'Your reaction' : 'Already reacted') : undefined}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, cursor: already ? 'default' : 'pointer', border: `1.5px solid ${isMine ? `${color}60` : S.border}`, background: isMine ? `${color}18` : 'rgba(255,255,255,0.02)', transition: 'all 0.15s', opacity: already && !isMine ? 0.5 : 1 }}>
                            <Icon size={14} color={isMine ? color : S.faint} strokeWidth={isMine ? 2.2 : 1.8} />
                            {count > 0 && <span style={{ color: isMine ? color : S.muted, fontSize: 12, fontWeight: 600 }}>{count}</span>}
                          </button>
                        )
                      })}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ color: S.faint, fontSize: 12 }}>{timeAgo(post.createdAt)} · anonymous</p>
                      <button onClick={() => toggleReplies(post.id || post._docId, post._docId)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: `1px solid ${S.border}`, color: S.muted, fontSize: 12, cursor: 'pointer' }}>
                        <MessageSquare size={12} /> {post.replyCount || 0}
                        {openReply === (post.id || post._docId) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {openReply === (post.id || post._docId) && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        style={{ borderTop: `1px solid ${S.border}`, background: 'rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                        <div style={{ padding: '12px 16px' }}>
                          {(replies[post.id || post._docId] || []).map((r: any, ri: number) => (
                            <div key={r.id || ri} style={{ padding: '6px 0', borderBottom: `1px solid rgba(37,37,53,0.4)` }}>
                              <p style={{ color: S.muted, fontSize: 13, lineHeight: 1.5 }}>{r.content}</p>
                              <p style={{ color: S.faint, fontSize: 11, marginTop: 3 }}>{timeAgo(r.createdAt)}</p>
                            </div>
                          ))}
                          {(replies[post.id || post._docId] || []).length === 0 && (
                            <p style={{ color: S.faint, fontSize: 13, paddingBottom: 8 }}>No replies yet</p>
                          )}
                          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                            <input value={replyText} onChange={e => setReplyText(e.target.value)}
                              placeholder="Reply anonymously…"
                              onKeyDown={e => e.key === 'Enter' && submitReply(post.id || post._docId, post._docId)}
                              style={{ flex: 1, padding: '8px 12px', borderRadius: 10, background: S.input, border: `1px solid ${S.border}`, color: S.text, fontSize: 13, outline: 'none', fontFamily: 'Manrope' }} />
                            <button onClick={() => submitReply(post.id || post._docId, post._docId)}
                              disabled={!replyText.trim()}
                              style={{ padding: '8px 12px', borderRadius: 10, background: '#7c4dff', border: 'none', color: '#fff', cursor: 'pointer', opacity: !replyText.trim() ? 0.5 : 1 }}>
                              <Send size={13} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
