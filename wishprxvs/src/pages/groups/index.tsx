import Head                    from 'next/head'
import Link                    from 'next/link'
import { useRouter }           from 'next/router'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  collection, query, where, getDocs, addDoc,
  doc, getDoc, updateDoc, increment,
}                              from 'firebase/firestore'
import { db, COLLECTIONS }     from '@/lib/firebase'
import { useAuthStore }        from '@/store/authStore'
import { useT }                from '@/lib/theme'
import { ROUTES }              from '@/constants/routes'
import { nanoid }              from 'nanoid'
import { Ghost, Users, PlusCircle, Hash, Lock, ArrowRight, X, Copy, Check } from 'lucide-react'

export default function GroupsPage() {
  const router = useRouter()
  const S      = useT()
  const { wishprUser, firebaseUser, isLoading } = useAuthStore()

  const [myGroups, setMyGroups]   = useState<any[]>([])
  const [fetching, setFetching]   = useState(true)
  const [tab, setTab]             = useState<'list'|'create'|'join'>('list')
  const [groupName, setGroupName] = useState('')
  const [groupDesc, setGroupDesc] = useState('')
  const [creating, setCreating]   = useState(false)
  const [inviteCode, setCode]     = useState('')
  const [joining, setJoining]     = useState(false)
  const [joinError, setJoinError] = useState('')
  const [createErr, setCreateErr] = useState('')
  const [codeCopied, setCodeCopied] = useState<string|null>(null)

  useEffect(() => {
    if (!isLoading && !firebaseUser) { router.replace(ROUTES.SIGN_IN); return }
    if (wishprUser) fetchGroups()
  }, [wishprUser, firebaseUser, isLoading])

  async function fetchGroups() {
    if (!wishprUser) return
    setFetching(true)
    try {
      const q    = query(collection(db, COLLECTIONS.GROUP_MEMBERS), where('uid', '==', wishprUser.uid))
      const snap = await getDocs(q)
      const ids  = snap.docs.map(d => d.data().groupId as string)
      if (!ids.length) { setMyGroups([]); return }
      const groups: any[] = []
      for (const id of ids) {
        try {
          const gdoc = await getDoc(doc(db, COLLECTIONS.GROUPS, id))
          if (gdoc.exists()) groups.push({ _docId: gdoc.id, ...gdoc.data() })
        } catch {}
      }
      setMyGroups(groups)
    } catch (e) { console.error('Groups fetch:', e) }
    finally { setFetching(false) }
  }

  async function handleCreate() {
    if (!wishprUser || !groupName.trim()) { setCreateErr('Enter a group name'); return }
    setCreating(true); setCreateErr('')
    try {
      const code     = nanoid(6).toUpperCase()
      const groupData = {
        name:        groupName.trim(),
        description: groupDesc.trim(),
        inviteCode:  code,
        createdBy:   wishprUser.uid,
        memberCount: 1,
        postCount:   0,
        createdAt:   Date.now(),
      }
      const groupRef = await addDoc(collection(db, COLLECTIONS.GROUPS), groupData)
      await addDoc(collection(db, COLLECTIONS.GROUP_MEMBERS), {
        uid: wishprUser.uid, groupId: groupRef.id, joinedAt: Date.now(),
      })
      router.push(ROUTES.GROUP(groupRef.id))
    } catch (e: any) {
      console.error('Create group error:', e)
      setCreateErr(`Error: ${e?.message || 'Please check Firestore rules in Firebase console'}`)
    }
    finally { setCreating(false) }
  }

  async function handleJoin() {
    if (!wishprUser || !inviteCode.trim()) return
    setJoining(true); setJoinError('')
    try {
      const q    = query(collection(db, COLLECTIONS.GROUPS), where('inviteCode', '==', inviteCode.trim().toUpperCase()))
      const snap = await getDocs(q)
      if (snap.empty) { setJoinError('Invalid code — check and try again'); setJoining(false); return }
      const gDoc = snap.docs[0]
      const memQ = query(collection(db, COLLECTIONS.GROUP_MEMBERS), where('uid', '==', wishprUser.uid), where('groupId', '==', gDoc.id))
      const memSn = await getDocs(memQ)
      if (!memSn.empty) { router.push(ROUTES.GROUP(gDoc.id)); return }
      await addDoc(collection(db, COLLECTIONS.GROUP_MEMBERS), { uid: wishprUser.uid, groupId: gDoc.id, joinedAt: Date.now() })
      await updateDoc(doc(db, COLLECTIONS.GROUPS, gDoc.id), { memberCount: increment(1) })
      router.push(ROUTES.GROUP(gDoc.id))
    } catch (e: any) { setJoinError(`Error: ${e?.message || 'Try again'}`) }
    finally { setJoining(false) }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => { setCodeCopied(code); setTimeout(() => setCodeCopied(null), 2000) })
  }

  const inputS: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 10, background: S.input, border: `1px solid ${S.border}`, color: S.text, fontSize: 14, outline: 'none', fontFamily: 'Manrope' }

  if (isLoading || (firebaseUser && !wishprUser)) {
    return (
      <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <Ghost size={32} color="#7c4dff" />
        </motion.div>
      </div>
    )
  }
  if (!wishprUser) return null

  return (
    <>
      <Head><title>Groups — Wishpr Xvs</title></Head>
      <main className="has-bottom-nav" style={{ minHeight: '100vh', background: S.bg, padding: '20px 14px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: 22 }}>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 20, color: S.text, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={20} color="#7c4dff" /> Private Groups
            </h1>
            <p style={{ color: S.faint, fontSize: 13, marginTop: 3 }}>Anonymous boards for friends & classmates</p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {[
              { id: 'list',   label: 'My Groups'    },
              { id: 'create', label: '+ Create'     },
              { id: 'join',   label: '# Join'       },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                style={{ padding: '8px 16px', borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s',
                  background: tab === t.id ? '#7c4dff' : S.card,
                  color:      tab === t.id ? '#fff'    : S.muted,
                  border: tab === t.id ? '1px solid rgba(124,77,255,0.5)' : `1px solid ${S.border}` }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Create form */}
          {tab === 'create' && (
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
              style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 18, padding: 20, marginBottom: 20 }}>
              <div style={{ background:'rgba(124,77,255,0.07)', border:'1px solid rgba(124,77,255,0.2)', borderRadius:10, padding:'10px 14px', marginBottom:16 }}>
                <p style={{ color:'#c084fc', fontSize:12 }}>
                  <Lock size={11} style={{ display:'inline', marginRight:5 }} />
                  A unique 6-character code is generated. Share it with friends to invite them.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input value={groupName} onChange={e => setGroupName(e.target.value)}
                  placeholder="Group name (e.g. Class 12B, Night Squad)"
                  style={inputS} />
                <textarea value={groupDesc} onChange={e => setGroupDesc(e.target.value)}
                  placeholder="What's this group about? (optional)" rows={2}
                  style={{ ...inputS, resize: 'none' } as React.CSSProperties} />
                {createErr && (
                  <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', color:S.danger, fontSize:13 }}>
                    {createErr}
                    {createErr.includes('Firestore') && (
                      <p style={{ marginTop:6, fontSize:11, color:S.faint }}>Go to Firebase Console → Firestore → Rules and update to allow write access to 'groups' and 'group_members' collections.</p>
                    )}
                  </div>
                )}
                <button onClick={handleCreate} disabled={creating || !groupName.trim()}
                  style={{ padding: '13px', borderRadius: 13, background: S.brand, color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: creating||!groupName.trim() ? 'not-allowed' : 'pointer', opacity: !groupName.trim() ? 0.5 : 1 }}>
                  {creating ? 'Creating…' : 'Create Group'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Join form */}
          {tab === 'join' && (
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
              style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 18, padding: 20, marginBottom: 20 }}>
              <p style={{ color: S.muted, fontSize: 14, marginBottom: 12 }}>Enter the 6-character invite code from your friend</p>
              <input value={inviteCode} onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="XXXXXX" maxLength={6}
                style={{ ...inputS, letterSpacing: '0.25em', fontSize: 18, textAlign: 'center', fontFamily: 'monospace', marginBottom: 10 }} />
              {joinError && <p style={{ color: S.danger, fontSize: 13, marginBottom: 10 }}>{joinError}</p>}
              <button onClick={handleJoin} disabled={joining || inviteCode.length < 6}
                style={{ width: '100%', padding: '13px', borderRadius: 13, background: S.brand, color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', opacity: inviteCode.length < 6 ? 0.5 : 1 }}>
                {joining ? 'Joining…' : 'Join Group'}
              </button>
            </motion.div>
          )}

          {/* My groups list */}
          {tab === 'list' && (
            fetching ? (
              <div style={{ textAlign: 'center', paddingTop: 60 }}>
                <motion.div animate={{ opacity:[0.3,1,0.3] }} transition={{ duration:1.5, repeat:Infinity }}>
                  <Ghost size={28} color="#7c4dff" style={{ margin:'0 auto' }} />
                </motion.div>
              </div>
            ) : myGroups.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: 60 }}>
                <Users size={44} color={S.border} style={{ margin:'0 auto 14px', display:'block' }} />
                <p style={{ color: S.muted, fontWeight: 600, marginBottom: 8 }}>No groups yet</p>
                <p style={{ color: S.faint, fontSize: 14, marginBottom: 20 }}>Create a group or join with an invite code.</p>
                <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
                  <button onClick={() => setTab('create')} style={{ padding:'9px 18px', borderRadius:11, background:S.brand, color:'#fff', fontWeight:600, fontSize:13, border:'none', cursor:'pointer' }}>
                    + Create Group
                  </button>
                  <button onClick={() => setTab('join')} style={{ padding:'9px 18px', borderRadius:11, background:S.card, border:`1px solid ${S.border}`, color:S.muted, fontWeight:600, fontSize:13, cursor:'pointer' }}>
                    Join with Code
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {myGroups.map((g, i) => (
                  <motion.div key={g._docId} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}>
                    <div style={{ background:S.card, border:`1px solid ${S.border}`, borderRadius:16, padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:42, height:42, borderRadius:12, background:'rgba(124,77,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Users size={18} color="#7c4dff" />
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontWeight:700, color:S.text, fontSize:14 }}>{g.name}</p>
                        <p style={{ color:S.faint, fontSize:12, marginTop:2 }}>{g.memberCount} members</p>
                      </div>
                      {/* Invite code chip */}
                      <button onClick={() => copyCode(g.inviteCode)}
                        style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:8, background:codeCopied===g.inviteCode?'rgba(52,211,153,0.1)':'rgba(124,77,255,0.1)', border:`1px solid ${codeCopied===g.inviteCode?'rgba(52,211,153,0.3)':'rgba(124,77,255,0.25)'}`, color:codeCopied===g.inviteCode?S.success:'#7c4dff', fontSize:12, fontFamily:'monospace', letterSpacing:'0.08em', cursor:'pointer', flexShrink:0 }}>
                        {codeCopied === g.inviteCode ? <Check size={12}/> : <Copy size={12}/>}
                        {g.inviteCode}
                      </button>
                      <Link href={ROUTES.GROUP(g._docId)} style={{ textDecoration:'none', color:S.faint, flexShrink:0 }}>
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          )}
        </div>
      </main>
    </>
  )
}
