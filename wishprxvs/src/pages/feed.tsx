import Head                    from 'next/head'
import Link                    from 'next/link'
import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  collection, query, orderBy, limit, onSnapshot,
  addDoc, updateDoc, doc, getDocs, increment,
  where,
}                              from 'firebase/firestore'
import { db, COLLECTIONS }     from '@/lib/firebase'
import { useAuthStore }        from '@/store/authStore'
import { useT }                from '@/lib/theme'
import { ROUTES }              from '@/constants/routes'
import { Post, ReactionKey }   from '@/types'
import { LIMITS }              from '@/constants/limits'
import { nanoid }              from 'nanoid'
import { resolveAuthorDisplay, timeAgo } from '@/lib/utils'
import ReactionBar             from '@/components/ReactionBar'
import AddPostModal            from '@/components/AddPostModal'
import { Avatar }              from '@/components/Avatars'
import {
  Ghost, Plus, MessageSquare, ChevronDown, ChevronUp,
  Send, Volume2, Filter, Trophy, Star, Trash2,
} from 'lucide-react'

const CATEGORIES = ['All','Post','Confession','Shoutout','Crush','Debate','Poll'] as const
type Category    = typeof CATEGORIES[number]
type SortMode    = 'recent' | 'ranked' | 'relevant'

export default function FeedPage() {
  const S = useT()
  const { wishprUser } = useAuthStore()

  const [posts, setPosts]         = useState<(Post & { _docId: string })[]>([])
  const [fetching, setFetching]   = useState(true)
  const [category, setCategory]   = useState<Category>('All')
  const [sort, setSort]           = useState<SortMode>('recent')
  const [showSort, setShowSort]   = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [openReply, setOpenReply] = useState<string | null>(null)
  const [replies, setReplies]     = useState<Record<string, any[]>>({})
  const [replyText, setReplyText] = useState('')
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())
  // Set of author UIDs this user has mutual follow with
  const [mutuals, setMutuals]     = useState<Set<string>>(new Set())

  // Load mutual follows for username display
  useEffect(() => {
    if (!wishprUser) return
    async function loadMutuals() {
      // People I follow
      const iFollow  = await getDocs(query(collection(db, COLLECTIONS.FOLLOWS), where('followerId', '==', wishprUser!.uid)))
      const followingIds = new Set(iFollow.docs.map(d => d.data().followingId as string))
      // People who follow me
      const followMe = await getDocs(query(collection(db, COLLECTIONS.FOLLOWS), where('followingId', '==', wishprUser!.uid)))
      const followerIds = new Set(followMe.docs.map(d => d.data().followerId as string))
      // Intersection
      const m = new Set<string>()
      followingIds.forEach((id: string) => { if (followerIds.has(id)) m.add(id) })
      setMutuals(m)
    }
    loadMutuals().catch(() => {})
  }, [wishprUser])

  // Real-time feed
  useEffect(() => {
    const q = query(collection(db, COLLECTIONS.POSTS), orderBy('createdAt', 'desc'), limit(40))
    const unsub = onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ _docId: d.id, ...d.data() } as any)))
      setFetching(false)
    }, () => setFetching(false))
    return () => unsub()
  }, [])

  async function handleReact(docId: string, key: ReactionKey) {
    if (!wishprUser) return
    const post = posts.find(p => p._docId === docId)
    if (!post || post.reactedBy?.[wishprUser.uid]) return // already reacted
    try {
      await updateDoc(doc(db, COLLECTIONS.POSTS, docId), {
        [`reactions.${key}`]:         increment(1),
        [`reactedBy.${wishprUser.uid}`]: key,
      })
    } catch {}
  }

  async function votePoll(docId: string, post: Post, optId: string) {
    if (!wishprUser || !post.pollOptions) return
    const already = post.pollOptions.some(o => o.votedBy?.includes(wishprUser.uid))
    if (already) return
    const updated = post.pollOptions.map(o =>
      o.id === optId ? { ...o, votes: o.votes + 1, votedBy: [...(o.votedBy || []), wishprUser.uid] } : o
    )
    await updateDoc(doc(db, COLLECTIONS.POSTS, docId), { pollOptions: updated }).catch(() => {})
  }

  async function voteDebate(docId: string, side: 'A' | 'B') {
    if (!wishprUser) return
    await updateDoc(doc(db, COLLECTIONS.POSTS, docId), { [side === 'A' ? 'debateSideA' : 'debateSideB']: increment(1) }).catch(() => {})
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
    if (!replyText.trim() || !wishprUser) return
    const r = { id: nanoid(), content: replyText.trim(), createdAt: Date.now() }
    await addDoc(collection(db, COLLECTIONS.POSTS, docId, 'replies'), r).catch(() => {})
    await updateDoc(doc(db, COLLECTIONS.POSTS, docId), { replyCount: increment(1) }).catch(() => {})
    setReplies(prev => ({ ...prev, [postId]: [...(prev[postId] || []), r] }))
    setReplyText('')
  }

  // Filter + sort
  const filtered = posts
    .filter(p => {
      // Exclude group posts — they must not appear in community feed
      if ((p as any).groupId) return false
      if (category === 'All') return true
      return p.type?.toLowerCase() === category.toLowerCase()
    })
    .sort((a, b) => {
      if (sort === 'ranked') {
        const aR = (Object.values(a.reactions || {}) as number[]).reduce((s, v) => s + v, 0)
        const bR = (Object.values(b.reactions || {}) as number[]).reduce((s, v) => s + v, 0)
        return bR - aR
      }
      if (sort === 'recent') {
        // Country priority: if user has a country flag, show same-country posts first
        const myFlag = wishprUser?.countryFlag
        if (myFlag) {
          const aLocal = (a.authorFlag === myFlag) ? 1 : 0
          const bLocal = (b.authorFlag === myFlag) ? 1 : 0
          if (aLocal !== bLocal) return bLocal - aLocal
        }
        return b.createdAt - a.createdAt
      }
      return b.createdAt - a.createdAt
    })

  const inputS: React.CSSProperties = {
    flex: 1, padding: '9px 13px', borderRadius: 10,
    background: S.input, border: `1px solid ${S.border}`,
    color: S.text, fontSize: 13, outline: 'none', fontFamily: 'Manrope',
  }

  return (
    <>
      <Head><title>Community — Wishpr Xvs</title></Head>
      <main className="has-bottom-nav" style={{ minHeight: '100vh', background: S.bg }}>

        {/* ── HEADER ── */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: S.navBg, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: `1px solid ${S.border}`, padding: '12px 16px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: S.text, display: 'flex', alignItems: 'center', gap: 7 }}>
                <Ghost size={18} color="#7c4dff" /> Community
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Sort button */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowSort(!showSort)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', borderRadius: 10, background: S.card, border: `1px solid ${S.border}`, color: S.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  <Filter size={13} />
                  {{ recent:'Recent', ranked:'Top', relevant:'Relevant' }[sort]}
                </button>
                <AnimatePresence>
                  {showSort && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ position: 'absolute', right: 0, top: 42, background: S.cardSolid, border: `1px solid ${S.border}`, borderRadius: 12, overflow: 'hidden', minWidth: 130, zIndex: 60, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                      {(['recent','ranked','relevant'] as SortMode[]).map(m => (
                        <button key={m} onClick={() => { setSort(m); setShowSort(false) }}
                          style={{ display: 'block', width: '100%', padding: '10px 16px', background: sort === m ? 'rgba(124,77,255,0.12)' : 'none', border: 'none', color: sort === m ? '#7c4dff' : S.text, fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
                          {{ recent: 'Recent', ranked: 'Top Ranked', relevant: 'Relevant' }[m]}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Add Post button */}
              {wishprUser && (
                <button onClick={() => setShowModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12, background: S.brand, color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <Plus size={15} /> Add Post
                </button>
              )}
            </div>
          </div>

          {/* Category filter chips — horizontal scroll */}
          <div className="scroll-x" style={{ maxWidth: 640, margin: '10px auto 0', display: 'flex', gap: 7 }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                style={{ padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s',
                  background: category === c ? '#7c4dff' : 'rgba(255,255,255,0.06)',
                  color:      category === c ? '#fff'    : S.muted }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* ── FEED ── */}
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '14px 12px' }}>
          {!wishprUser && (
            <div style={{ background: 'rgba(124,77,255,0.06)', border: '1px solid rgba(124,77,255,0.2)', borderRadius: 14, padding: '13px 16px', marginBottom: 16, textAlign: 'center' }}>
              <p style={{ color: S.muted, fontSize: 14 }}>
                <Link href={ROUTES.SIGN_UP} style={{ color: '#7c4dff', fontWeight: 600 }}>Create a free account</Link> to post and react
              </p>
            </div>
          )}

          {fetching ? (
            <div style={{ textAlign: 'center', paddingTop: 80 }}>
              <motion.div animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Ghost size={32} color="#7c4dff" style={{ margin: '0 auto' }} />
              </motion.div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 70 }}>
              <Ghost size={42} color={S.border} style={{ margin: '0 auto 14px', display: 'block' }} />
              <p style={{ color: S.muted, fontWeight: 600 }}>No posts here yet.</p>
              {wishprUser && <p style={{ color: S.faint, fontSize: 14, marginTop: 6 }}>Be the first to post something.</p>}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map((post, i) => {
                const isMutual = mutuals.has(post.authorId)
                const { label: authorLabel, isAnon } = resolveAuthorDisplay(
                  post.authorUsername, post.authorFlag || '',
                  (post as any).authorCity || '',
                  post.authorVisibility || 'nobody', isMutual
                )
                const typeBadge: Record<string, string> = {
                  confession: 'Confession', shoutout: 'Shoutout',
                  crush: 'Crush', debate: 'Debate', poll: 'Poll',
                }
                const badge = typeBadge[post.type]

                return (
                  <motion.div key={post._docId}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.25) }}
                    style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 18, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 16px 12px' }}>

                      {/* Post header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                        {/* Small sticker favicon */}
                        <Link href={ROUTES.PROFILE(post.authorId)} style={{ textDecoration: 'none', flexShrink: 0 }}>
                          <Avatar stickerId={(post as any).authorStickerId} size={30} />
                        </Link>
                        {badge && (
                          <span style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(124,77,255,0.12)', border: '1px solid rgba(124,77,255,0.25)', color: '#c084fc', fontSize: 11, fontWeight: 700 }}>{badge}</span>
                        )}
                        {/* Author — tappable for profile */}
                        <Link href={ROUTES.PROFILE(post.authorId)} style={{ textDecoration: 'none' }}>
                          <span style={{ color: isAnon ? S.faint : '#7c4dff', fontSize: 13, fontWeight: isAnon ? 400 : 600, cursor: 'pointer' }}>
                            {authorLabel}
                          </span>
                        </Link>
                        <span style={{ color: S.faint, fontSize: 11, marginLeft: 'auto' }}>{timeAgo(post.createdAt)}</span>
                      </div>

                      {/* Voice */}
                      {post.isVoice && (post as any).audioUrl && (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                            <Volume2 size={13} color="#7c4dff" />
                            <span style={{ color: '#7c4dff', fontSize: 11, fontWeight: 600 }}>Voice post</span>
                          </div>
                          <audio controls src={(post as any).audioUrl} style={{ width: '100%' }} />
                        </div>
                      )}

                      {/* Text with see-more truncation */}
                      {!post.isVoice && post.content && (() => {
                        const LIMIT = 220
                        const isLong = post.content.length > LIMIT
                        const isExp = expandedPosts.has(post._docId)
                        const display = isLong && !isExp ? post.content.slice(0, LIMIT) : post.content
                        return (
                          <div style={{ marginBottom: 10 }}>
                            <p style={{ color: S.text, fontSize: 15, lineHeight: 1.7, margin: 0 }}>
                              {display}{isLong && !isExp && '…'}
                            </p>
                            {isLong && (
                              <button
                                onClick={() => setExpandedPosts(prev => {
                                  const next = new Set(prev)
                                  isExp ? next.delete(post._docId) : next.add(post._docId)
                                  return next
                                })}
                                style={{ color: '#7c4dff', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', marginTop: 4 }}>
                                {isExp ? 'See less' : 'See more'}
                              </button>
                            )}
                          </div>
                        )
                      })()}

                      {/* Poll */}
                      {post.type === 'poll' && post.pollOptions && (
                        <div style={{ marginBottom: 12 }}>
                          {post.pollOptions.map(opt => {
                            const total = post.pollOptions!.reduce((s, o) => s + o.votes, 0)
                            const pct   = total > 0 ? Math.round((opt.votes / total) * 100) : 0
                            const voted = opt.votedBy?.includes(wishprUser?.uid || '')
                            return (
                              <button key={opt.id} onClick={() => !voted && votePoll(post._docId, post, opt.id)}
                                style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: 7, borderRadius: 9, overflow: 'hidden', border: `1px solid ${voted ? 'rgba(124,77,255,0.4)' : S.border}`, background: 'rgba(255,255,255,0.02)', cursor: voted ? 'default' : 'pointer', position: 'relative', textAlign: 'left' }}>
                                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: 'rgba(124,77,255,0.13)', transition: 'width 0.4s' }} />
                                <span style={{ position: 'relative', padding: '9px 13px', flex: 1, color: S.text, fontSize: 13 }}>{opt.label}</span>
                                <span style={{ position: 'relative', padding: '0 13px', color: S.faint, fontSize: 12, fontWeight: 600 }}>{pct}%</span>
                              </button>
                            )
                          })}
                          <p style={{ color: S.faint, fontSize: 11 }}>{post.pollOptions.reduce((s, o) => s + o.votes, 0)} votes</p>
                        </div>
                      )}

                      {/* Debate */}
                      {post.type === 'debate' && (
                        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                          {(['A','B'] as const).map(side => {
                            const votes = side === 'A' ? ((post as any).debateSideA || 0) : ((post as any).debateSideB || 0)
                            const label = side === 'A' ? ((post as any).sideALabel || 'Side A') : ((post as any).sideBLabel || 'Side B')
                            const total = ((post as any).debateSideA||0) + ((post as any).debateSideB||0)
                            const pct   = total > 0 ? Math.round((votes/total)*100) : 50
                            return (
                              <button key={side} onClick={() => voteDebate(post._docId, side)}
                                style={{ flex: 1, padding: '12px 8px', borderRadius: 11, border: `1px solid ${side==='A' ? 'rgba(124,77,255,0.35)':'rgba(249,115,22,0.35)'}`, background: side==='A' ? 'rgba(124,77,255,0.08)':'rgba(249,115,22,0.08)', cursor: 'pointer', textAlign: 'center' }}>
                                <p style={{ color: S.text, fontWeight: 700, fontSize: 13 }}>{label}</p>
                                <p style={{ color: side==='A' ? '#7c4dff':'#f97316', fontSize: 18, fontWeight: 800 }}>{pct}%</p>
                                <p style={{ color: S.faint, fontSize: 11 }}>{votes} votes</p>
                              </button>
                            )
                          })}
                        </div>
                      )}

                      {/* Reactions */}
                      <ReactionBar
                        reactions={post.reactions || { heart:0, funny:0, sad:0, angry:0, wow:0 }}
                        reactedBy={post.reactedBy || {}}
                        myUid={wishprUser?.uid}
                        onReact={(k) => handleReact(post._docId, k)}
                      />

                      {/* Reply row */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                        <button onClick={() => toggleReplies(post.id || post._docId, post._docId)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: `1px solid ${S.border}`, color: S.muted, fontSize: 12, cursor: 'pointer' }}>
                          <MessageSquare size={12} /> {post.replyCount || 0}
                          {openReply === (post.id||post._docId) ? <ChevronUp size={11}/> : <ChevronDown size={11}/>}
                        </button>
                      </div>
                    </div>

                    {/* Replies */}
                    <AnimatePresence>
                      {openReply === (post.id||post._docId) && (
                        <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
                          style={{ borderTop:`1px solid ${S.border}`, background:'rgba(0,0,0,0.15)', overflow:'hidden' }}>
                          <div style={{ padding:'12px 16px' }}>
                            {(replies[post.id||post._docId] || []).map((r: any, ri: number) => (
                              <div key={r.id||ri} style={{ padding:'6px 0', borderBottom:`1px solid ${S.border}` }}>
                                <p style={{ color:S.muted, fontSize:13, lineHeight:1.5 }}>{r.content}</p>
                                <p style={{ color:S.faint, fontSize:11, marginTop:3 }}>{timeAgo(r.createdAt)}</p>
                              </div>
                            ))}
                            {(replies[post.id||post._docId] || []).length === 0 && (
                              <p style={{ color:S.faint, fontSize:13, paddingBottom:8 }}>No replies yet</p>
                            )}
                            {wishprUser ? (
                              <div style={{ display:'flex', gap:8, marginTop:10 }}>
                                <input value={replyText} onChange={e => setReplyText(e.target.value)}
                                  onKeyDown={e => e.key==='Enter' && submitReply(post.id||post._docId, post._docId)}
                                  placeholder="Reply anonymously…"
                                  style={{ ...inputS }}/>
                                <button onClick={() => submitReply(post.id||post._docId, post._docId)} disabled={!replyText.trim()}
                                  style={{ padding:'0 14px', borderRadius:10, background:'#7c4dff', border:'none', color:'#fff', cursor:'pointer', opacity:!replyText.trim()?0.5:1 }}>
                                  <Send size={14}/>
                                </button>
                              </div>
                            ) : (
                              <p style={{ color:S.faint, fontSize:13, marginTop:10 }}>
                                <Link href={ROUTES.SIGN_UP} style={{ color:'#7c4dff' }}>Sign up</Link> to reply
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {showModal && <AddPostModal onClose={() => setShowModal(false)} />}
      </main>
    </>
  )
}
