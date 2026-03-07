import Head          from 'next/head'
import Link          from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { motion }    from 'framer-motion'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db, COLLECTIONS } from '@/lib/firebase'
import { useAuthStore }    from '@/store/authStore'
import { useT }            from '@/lib/theme'
import { ROUTES }          from '@/constants/routes'
import { Ghost, Copy, ExternalLink, MessageCircle, Users, Eye, Globe, Inbox, MessageSquare, Settings, Check, Zap } from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()
  const S      = useT()
  const { wishprUser, firebaseUser, isLoading } = useAuthStore()
  const [unread, setUnread] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isLoading && !firebaseUser && !wishprUser) router.replace(ROUTES.SIGN_IN)
  }, [wishprUser, firebaseUser, isLoading, router])

  useEffect(() => {
    if (!wishprUser) return
    getDocs(query(collection(db, COLLECTIONS.MESSAGES),
      where('toUserId', '==', wishprUser.uid), where('isRead', '==', false)
    )).then(s => setUnread(s.size)).catch(() => {})
  }, [wishprUser])

  if (isLoading || (firebaseUser && !wishprUser)) {
    return (
      <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <Ghost size={36} color="#7c4dff" />
        </motion.div>
      </div>
    )
  }
  if (!wishprUser) return null

  const myLink = `${process.env.NEXT_PUBLIC_APP_URL}/s/${wishprUser.linkSlug}`

  function copyLink() {
    navigator.clipboard.writeText(myLink).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }).catch(() => {})
  }

  const navCards = [
    { href: ROUTES.INBOX,    icon: <Inbox size={19}/>,          label: 'Inbox',           desc: 'Anonymous messages', badge: unread, accent: '#7c4dff' },
    { href: ROUTES.MESSAGES, icon: <MessageSquare size={19}/>,  label: 'Direct Messages', desc: 'Private chats',      badge: 0,     accent: '#06b6d4' },
    { href: ROUTES.FEED,     icon: <Globe size={19}/>,          label: 'Community',       desc: 'Anonymous feed',     badge: 0,     accent: '#ec4899' },
    { href: ROUTES.GROUPS,   icon: <Users size={19}/>,          label: 'Private Groups',  desc: 'Friend boards',      badge: 0,     accent: '#f59e0b' },
    { href: ROUTES.PROFILE(wishprUser.uid), icon: <Eye size={19}/>, label: 'My Profile', desc: 'Manage account',    badge: 0,     accent: '#34d399' },
    { href: ROUTES.SETTINGS, icon: <Settings size={19}/>,       label: 'Settings',        desc: 'Privacy & theme',    badge: 0,     accent: '#6b7280' },
  ]

  return (
    <>
      <Head><title>Dashboard — Wishpr Xvs</title></Head>
      <main className="has-bottom-nav" style={{ minHeight: '100vh', background: S.bg, padding: '24px 16px' }}>
        <div style={{ position:'fixed', top:-100, right:-100, width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,77,255,0.07) 0%,transparent 70%)', filter:'blur(60px)', pointerEvents:'none' }} />
        <div style={{ maxWidth: 820, margin: '0 auto', position: 'relative' }}>

          {/* Header — NO sign out */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: S.brand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Ghost size={16} color="white" />
              </div>
              <span style={{ fontFamily: 'Syne', fontWeight: 700, color: S.text, fontSize: 16 }}>
                Wishpr <span style={{ color: '#7c4dff' }}>Xvs</span>
              </span>
            </div>
            <Link href={ROUTES.SETTINGS} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: S.card, border: `1px solid ${S.border}`, color: S.muted, textDecoration: 'none' }}>
              <Settings size={16} />
            </Link>
          </div>

          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} style={{ marginBottom: 20 }}>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 26, color: S.text }}>
              Hey, <span style={{ color: '#7c4dff' }}>@{wishprUser.username}</span>
              {wishprUser.countryFlag && ` ${wishprUser.countryFlag}`} 👋
            </h1>
            <p style={{ color: S.muted, marginTop: 6, fontSize: 14 }}>Your anonymous link is live.</p>
          </motion.div>

          {/* Anonymous link */}
          <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.07 }}
            style={{ background:'rgba(124,77,255,0.07)', border:'1px solid rgba(124,77,255,0.22)', borderRadius:18, padding:18, marginBottom:16 }}>
            <p style={{ color:'#7c4dff', fontSize:11, fontWeight:700, letterSpacing:'0.1em', marginBottom:10 }}>YOUR ANONYMOUS LINK</p>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <code style={{ flex:1, padding:'9px 12px', borderRadius:9, background:'rgba(0,0,0,0.25)', color:S.text, fontSize:12, fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {myLink}
              </code>
              <button onClick={copyLink}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', width:36, height:36, borderRadius:9, background:copied?'rgba(52,211,153,0.15)':'rgba(124,77,255,0.15)', border:`1px solid ${copied?'rgba(52,211,153,0.4)':'rgba(124,77,255,0.3)'}`, color:copied?S.success:'#7c4dff', cursor:'pointer', flexShrink:0, transition:'all 0.2s' }}>
                {copied ? <Check size={16}/> : <Copy size={16}/>}
              </button>
              <Link href={ROUTES.SEND_MESSAGE(wishprUser.linkSlug)} target="_blank"
                style={{ display:'flex', alignItems:'center', justifyContent:'center', width:36, height:36, borderRadius:9, background:'rgba(124,77,255,0.12)', border:'1px solid rgba(124,77,255,0.28)', color:'#7c4dff', textDecoration:'none', flexShrink:0 }}>
                <ExternalLink size={16}/>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:14 }}>
            {[
              { icon:<MessageCircle size={17}/>, label:'Messages', val:wishprUser.messageCount,  color:'#7c4dff' },
              { icon:<Users size={17}/>,         label:'Followers', val:wishprUser.followerCount, color:'#06b6d4' },
              { icon:<Zap size={17}/>,            label:'Streak',   val:0,                        color:'#f59e0b' },
            ].map((s,i) => (
              <motion.div key={s.label} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1+i*0.04 }}
                style={{ background:S.card, border:`1px solid ${S.border}`, borderRadius:14, padding:'14px 10px', textAlign:'center' }}>
                <div style={{ display:'flex', justifyContent:'center', color:s.color, marginBottom:6 }}>{s.icon}</div>
                <p style={{ fontFamily:'Syne', fontWeight:700, fontSize:20, color:S.text }}>{s.val}</p>
                <p style={{ color:S.faint, fontSize:11, marginTop:2 }}>{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Nav cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:10 }}>
            {navCards.map((item, i) => (
              <motion.div key={item.href} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.13+i*0.04 }}>
                <Link href={item.href} style={{ textDecoration:'none' }}>
                  <div style={{ background:S.card, border:`1px solid ${S.border}`, borderRadius:14, padding:16, cursor:'pointer', transition:'all 0.2s', position:'relative', height:'100%' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=`${item.accent}60`; e.currentTarget.style.background=`${item.accent}0a` }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor=S.border; e.currentTarget.style.background=S.card }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                      <div style={{ color:item.accent }}>{item.icon}</div>
                      {item.badge > 0 && <span style={{ padding:'2px 8px', borderRadius:999, background:item.accent, color:'#fff', fontSize:11, fontWeight:700 }}>{item.badge}</span>}
                    </div>
                    <p style={{ fontWeight:700, color:S.text, fontSize:14, marginBottom:3 }}>{item.label}</p>
                    <p style={{ color:S.faint, fontSize:12 }}>{item.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
