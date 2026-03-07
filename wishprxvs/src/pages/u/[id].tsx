import Head                    from 'next/head'
import Link                    from 'next/link'
import { useRouter }           from 'next/router'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  doc, getDoc, collection, query, where, getDocs,
  addDoc, deleteDoc, updateDoc, increment, orderBy,
}                              from 'firebase/firestore'
import { db, COLLECTIONS }     from '@/lib/firebase'
import { useAuthStore }        from '@/store/authStore'
import { useT }                from '@/lib/theme'
import { ROUTES }              from '@/constants/routes'
import { WishprUser, Post }    from '@/types'
import { resolveAuthorDisplay, timeAgo } from '@/lib/utils'
import { Ghost, Settings, MessageSquare, UserPlus, UserCheck, Trash2, ArrowLeft } from 'lucide-react'
import { Avatar } from '@/components/Avatars'

export default function ProfilePage() {
  const router = useRouter()
  const { id } = router.query as { id: string }
  const S      = useT()
  const { wishprUser } = useAuthStore()

  const [profile, setProfile]     = useState<WishprUser | null>(null)
  const [posts, setPosts]         = useState<(Post & { _docId: string })[]>([])
  const [loading, setLoading]     = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isMutual, setIsMutual]   = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [followDocId, setFollowDocId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const isOwnProfile = wishprUser?.uid === id

  useEffect(() => {
    if (!id) return
    loadProfile()
  }, [id, wishprUser])

  async function loadProfile() {
    setLoading(true)
    try {
      const pdoc = await getDoc(doc(db, COLLECTIONS.USERS, id))
      if (!pdoc.exists()) { setLoading(false); return }
      const p = pdoc.data() as WishprUser
      setProfile(p)

      // Load their posts — no orderBy to avoid composite index; sort client-side
      let postDocs: any[] = []
      try {
        const pq   = query(collection(db, COLLECTIONS.POSTS), where('authorId', '==', id), orderBy('createdAt', 'desc'))
        const pSnap = await getDocs(pq)
        postDocs = pSnap.docs.map(d => ({ _docId: d.id, ...d.data() }))
      } catch {
        // Fallback without orderBy (no composite index needed)
        const pq2   = query(collection(db, COLLECTIONS.POSTS), where('authorId', '==', id))
        const pSnap2 = await getDocs(pq2)
        postDocs = pSnap2.docs.map(d => ({ _docId: d.id, ...d.data() }))
        postDocs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      }
      setPosts(postDocs as any)

      // Check follow status
      if (wishprUser && wishprUser.uid !== id) {
        const fq = query(collection(db, COLLECTIONS.FOLLOWS),
          where('followerId', '==', wishprUser.uid), where('followingId', '==', id))
        const fSnap = await getDocs(fq)
        if (!fSnap.empty) { setIsFollowing(true); setFollowDocId(fSnap.docs[0].id) }

        // Check mutual (do they follow me?)
        const mq = query(collection(db, COLLECTIONS.FOLLOWS),
          where('followerId', '==', id), where('followingId', '==', wishprUser.uid))
        const mSnap = await getDocs(mq)
        setIsMutual(!fSnap.empty && !mSnap.empty)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function toggleFollow() {
    if (!wishprUser || !profile) return
    setFollowLoading(true)
    try {
      if (isFollowing && followDocId) {
        await deleteDoc(doc(db, COLLECTIONS.FOLLOWS, followDocId))
        await updateDoc(doc(db, COLLECTIONS.USERS, id), { followerCount: increment(-1) })
        await updateDoc(doc(db, COLLECTIONS.USERS, wishprUser.uid), { followingCount: increment(-1) })
        setIsFollowing(false); setFollowDocId(null); setIsMutual(false)
      } else {
        const ref = await addDoc(collection(db, COLLECTIONS.FOLLOWS), {
          followerId: wishprUser.uid, followingId: id, createdAt: Date.now(),
        })
        await updateDoc(doc(db, COLLECTIONS.USERS, id), { followerCount: increment(1) })
        await updateDoc(doc(db, COLLECTIONS.USERS, wishprUser.uid), { followingCount: increment(1) })
        setIsFollowing(true); setFollowDocId(ref.id)
      }
      // Reload to get fresh follow state
      await loadProfile()
    } catch (e) { console.error(e) }
    finally { setFollowLoading(false) }
  }

  async function deletePost(docId: string) {
    try {
      await deleteDoc(doc(db, COLLECTIONS.POSTS, docId))
      setPosts(prev => prev.filter(p => p._docId !== docId))
    } catch (e) { console.error(e) }
    finally { setConfirmDelete(null) }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <Ghost size={32} color="#7c4dff" />
        </motion.div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <Ghost size={40} color={S.border} />
        <p style={{ color: S.muted }}>Profile not found</p>
        <button onClick={() => router.back()} style={{ color: '#7c4dff', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>Go back</button>
      </div>
    )
  }

  const { label: displayLabel } = resolveAuthorDisplay(
    profile.username, profile.countryFlag || '',
    profile.cityLabel || '',
    profile.usernameVisibility || 'nobody', isMutual
  )

  const showUsername = profile.usernameVisibility === 'public' ||
    (profile.usernameVisibility === 'friends' && isMutual) ||
    isOwnProfile

  return (
    <>
      <Head><title>{isOwnProfile ? `@${profile.username}` : (showUsername ? `@${profile.username}` : 'Anonymous')} — Wishpr Xvs</title></Head>
      <main className="has-bottom-nav" style={{ minHeight: '100vh', background: S.bg, padding: '20px 14px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>

          {/* Back — settings icon removed from here (only kept inside profile card for own profile) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <button onClick={() => router.back()}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: S.card, border: `1px solid ${S.border}`, color: S.muted, cursor: 'pointer' }}>
              <ArrowLeft size={17} />
            </button>
          </div>

          {/* Profile card */}
          <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
            style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 20, padding: 24, marginBottom: 16 }}>

            {/* Avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <Avatar stickerId={profile.stickerId} size={68} />
              <div style={{ flex: 1 }}>
                <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 20, color: S.text }}>
                  {isOwnProfile ? `@${profile.username}` : (showUsername ? `@${profile.username}` : 'Anonymous')}
                  {profile.countryFlag && ` ${profile.countryFlag}`}
                  {profile.cityLabel && <span style={{ color: S.faint, fontSize: 15, fontWeight: 400 }}> {profile.cityLabel}</span>}
                </h1>
                {isOwnProfile && (
                  <p style={{ color: S.faint, fontSize: 12, marginTop: 2 }}>
                    {({ public:'Public', friends:'Friends only', nobody:'Nobody' }[profile.usernameVisibility || 'nobody'])} can see your username
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && <p style={{ color: S.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{profile.bio}</p>}

            {/* Stats */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
              {[
                { label: 'Posts',     val: posts.length            },
                { label: 'Followers', val: profile.followerCount   },
                { label: 'Following', val: profile.followingCount  },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 20, color: S.text }}>{s.val || 0}</p>
                  <p style={{ color: S.faint, fontSize: 12 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            {!isOwnProfile && wishprUser && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={toggleFollow} disabled={followLoading}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px', borderRadius: 13, background: isFollowing ? S.card : S.brand, border: `1px solid ${isFollowing ? S.border : 'transparent'}`, color: isFollowing ? S.text : '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
                  {isFollowing ? <UserCheck size={16}/> : <UserPlus size={16}/>}
                  {isFollowing ? (isMutual ? 'Mutual Follow' : 'Following') : 'Follow'}
                </button>
                <Link href={`${ROUTES.MESSAGES}?with=${profile.username}`}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px', borderRadius: 13, background: S.card, border: `1px solid ${S.border}`, color: S.text, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                  <MessageSquare size={16}/> Message
                </Link>
              </div>
            )}

            {isOwnProfile && (
              <div style={{ display: 'flex', gap: 10 }}>
                <Link href={ROUTES.SETTINGS}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', borderRadius: 13, background: S.brand, color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', textAlign: 'center' }}>
                  <Settings size={16} /> Edit Profile
                </Link>
              </div>
            )}

            {/* Mutual follow badge */}
            {isMutual && !isOwnProfile && (
              <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 10, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <UserCheck size={13} color="#34d399" />
                <p style={{ color: '#34d399', fontSize: 12, fontWeight: 600 }}>Mutual follow — you can see each other's usernames</p>
              </div>
            )}
          </motion.div>

          {/* Posts */}
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: S.text, marginBottom: 12 }}>Posts</h2>
          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 40 }}>
              <Ghost size={36} color={S.border} style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ color: S.faint }}>No posts yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {posts.filter(p => !(p as any).groupId).map((post, i) => (
                <motion.div key={post._docId} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.03 }}
                  style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, padding: '14px 16px', position: 'relative' }}>
                  {post.type && post.type !== 'post' && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', marginBottom: 8, display: 'block' }}>
                      {{ confession:'Confession', shoutout:'Shoutout', crush:'Crush', debate:'Debate', poll:'Poll' }[post.type] || post.type}
                    </span>
                  )}
                  <p style={{ color: S.text, fontSize: 14, lineHeight: 1.65 }}>{post.content || (post.isVoice ? 'Voice post' : '')}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                    <p style={{ color: S.faint, fontSize: 12 }}>{timeAgo(post.createdAt)}</p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <span style={{ color: S.faint, fontSize: 12 }}>
                        {Object.values(post.reactions || {}).reduce((s: number, v) => s + (v as number), 0)} reactions · {post.replyCount||0} replies
                      </span>
                      {isOwnProfile && (
                        <button onClick={() => setConfirmDelete(post._docId)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: S.danger }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, backdropFilter: 'blur(6px)' }} />
            <motion.div key="modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 201, background: S.cardSolid, border: `1px solid ${S.border}`, borderRadius: 20, padding: '28px 24px', width: '90%', maxWidth: 360, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Trash2 size={22} color="#f87171" />
              </div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: S.text, marginBottom: 8 }}>Delete post?</h3>
              <p style={{ color: S.muted, fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>This action cannot be undone. The post will be permanently removed.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setConfirmDelete(null)}
                  style={{ flex: 1, padding: '11px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: `1px solid ${S.border}`, color: S.muted, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={() => deletePost(confirmDelete)}
                  style={{ flex: 1, padding: '11px', borderRadius: 12, background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.4)', color: '#f87171', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
