import Head                    from 'next/head'
import Link                    from 'next/link'
import { useRouter }           from 'next/router'
import React, { useEffect, useState } from 'react'
import { motion }              from 'framer-motion'
import { signOut }             from 'firebase/auth'
import { doc, updateDoc }      from 'firebase/firestore'
import { auth, db, COLLECTIONS } from '@/lib/firebase'
import { useAuthStore }        from '@/store/authStore'
import { useT }                from '@/lib/theme'
import { ROUTES }              from '@/constants/routes'
import { getCountryFlag, getLocationInfo } from '@/lib/utils'
import { UsernameVisibility, MessagePrivacy, Theme } from '@/types'
import { ArrowLeft, Save, Moon, Sun, Ghost, Check, LogOut, MapPin, User, Eye, EyeOff, Lock, MessageCircle, Info, ExternalLink } from 'lucide-react'
import { Avatar, AvatarPicker, StickerId, STICKER_LABELS } from '@/components/Avatars'

export default function SettingsPage() {
  const router   = useRouter()
  const S        = useT()
  const { wishprUser, firebaseUser, isLoading, setWishprUser, clear, theme, setTheme } = useAuthStore()

  const [address,    setAddress]    = useState('')
  const [bio,        setBio]        = useState('')
  const [ghostMode,  setGhostMode]  = useState(false)
  const [uVis,       setUVis]       = useState<UsernameVisibility>('nobody')
  const [msgPrivacy, setMsgPrivacy] = useState<MessagePrivacy>('everyone')
  const [stickerId,  setStickerId]  = useState<string>('ghost_classic')
  const [showPicker, setShowPicker] = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)
  // Link configuration
  const [linkMode,       setLinkMode]       = useState<'text' | 'poll' | 'quiz'>('text')
  const [linkQuestion,   setLinkQuestion]   = useState('')
  const [linkPollOpts,   setLinkPollOpts]   = useState(['', ''])
  const [linkQuizOpts,   setLinkQuizOpts]   = useState(['', '', ''])
  const [linkQuizAnswer, setLinkQuizAnswer] = useState(0)

  useEffect(() => {
    if (!isLoading && !firebaseUser) { router.replace(ROUTES.SIGN_IN); return }
    if (wishprUser) {
      setAddress(wishprUser.address || '')
      setBio(wishprUser.bio || '')
      setGhostMode(wishprUser.isGhostMode)
      setUVis(wishprUser.usernameVisibility || 'nobody')
      setMsgPrivacy(wishprUser.messagePrivacy || 'everyone')
      setStickerId(wishprUser.stickerId || 'ghost_classic')
      const u = wishprUser as any
      setLinkMode(u.linkMode || 'text')
      setLinkQuestion(u.linkQuestion || '')
      setLinkPollOpts(u.linkPollOptions?.map((o: any) => o.label) || ['', ''])
      setLinkQuizOpts(u.linkQuizOptions?.map((o: any) => o.label) || ['', '', ''])
      setLinkQuizAnswer(u.linkQuizAnswer ?? 0)
    }
  }, [wishprUser, firebaseUser, isLoading])

  async function handleSave() {
    if (!wishprUser) return
    setSaving(true)
    try {
      const { flag, city } = getLocationInfo(address)
      const validPollOpts  = linkPollOpts.filter(o => o.trim())
      const validQuizOpts  = linkQuizOpts.filter(o => o.trim())
      const updates: any = {
        address:            address.trim(),
        bio:                bio.trim(),
        isGhostMode:        ghostMode,
        usernameVisibility: uVis,
        messagePrivacy:     msgPrivacy,
        countryFlag:        flag,
        cityLabel:          city,
        stickerId:          stickerId,
        linkMode:           linkMode,
        linkQuestion:       linkQuestion.trim(),
        linkPollOptions:    linkMode === 'poll' && validPollOpts.length >= 2
          ? validPollOpts.map((o, i) => ({ id: `opt_${i}`, label: o.trim() }))
          : null,
        linkQuizOptions:    linkMode === 'quiz' && validQuizOpts.length >= 2
          ? validQuizOpts.map((o, i) => ({ id: `opt_${i}`, label: o.trim() }))
          : null,
        linkQuizAnswer:     linkMode === 'quiz' ? linkQuizAnswer : null,
      }
      await updateDoc(doc(db, COLLECTIONS.USERS, wishprUser.uid), updates)
      setWishprUser({ ...wishprUser, ...updates })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  async function handleSignOut() {
    await signOut(auth); clear(); router.push(ROUTES.HOME)
  }

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

  const inputS: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    background: S.input, border: `1px solid ${S.border}`,
    color: S.text, fontSize: 14, outline: 'none',
  }

  const sectionS: React.CSSProperties = {
    background: S.card, border: `1px solid ${S.border}`, borderRadius: 18, padding: 20, marginBottom: 14,
  }

  const labelS: React.CSSProperties = {
    color: S.faint, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', display: 'block', marginBottom: 10,
  }

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button onClick={onToggle}
      style={{ width: 46, height: 24, borderRadius: 12, background: on ? '#7c4dff' : S.border, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: on ? 25 : 3, transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
    </button>
  )

  const RadioRow = ({ label, desc, value, current, onSelect }: { label: string; desc?: string; value: string; current: string; onSelect: () => void }) => (
    <button onClick={onSelect}
      style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: `1px solid ${S.border}` }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${current === value ? '#7c4dff' : S.border}`, background: current === value ? '#7c4dff' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {current === value && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
      </div>
      <div>
        <p style={{ color: S.text, fontSize: 14, fontWeight: 600 }}>{label}</p>
        {desc && <p style={{ color: S.faint, fontSize: 12, marginTop: 2 }}>{desc}</p>}
      </div>
    </button>
  )

  const myLink = `${process.env.NEXT_PUBLIC_APP_URL}/s/${wishprUser.linkSlug}`

  return (
    <>
      <Head><title>Settings — Wishpr Xvs</title></Head>
      <main className="has-bottom-nav" style={{ minHeight: '100vh', background: S.bg, padding: '20px 16px' }}>
        <div style={{ maxWidth: 540, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <Link href={ROUTES.DASHBOARD} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: S.card, border: `1px solid ${S.border}`, color: S.muted, textDecoration: 'none', flexShrink: 0 }}>
              <ArrowLeft size={17} />
            </Link>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 20, color: S.text }}>Settings</h1>
          </div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>

            {/* Ghost Avatar */}
            <div style={sectionS}>
              <span style={labelS}>YOUR AVATAR</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Avatar stickerId={stickerId} size={64} />
                <div style={{ flex: 1 }}>
                  <p style={{ color: S.text, fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                    {STICKER_LABELS[stickerId as import('@/components/Avatars').StickerId] || stickerId}
                  </p>
                  <p style={{ color: S.faint, fontSize: 12, marginBottom: 10 }}>Shown everywhere as your avatar</p>
                  <button onClick={() => setShowPicker(true)}
                    style={{ padding: '8px 18px', borderRadius: 10, background: 'rgba(124,77,255,0.12)', border: '1px solid rgba(124,77,255,0.3)', color: '#c084fc', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Change Avatar
                  </button>
                </div>
              </div>
            </div>

            {/* Profile */}
            <div style={sectionS}>
              <span style={labelS}>PROFILE</span>
              <div style={{ marginBottom: 12 }}>
                <label style={{ color: S.muted, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
                  <MapPin size={12} /> Address / City
                </label>
                <input value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. Dhaka, Bangladesh" maxLength={100}
                  style={inputS} />
                <p style={{ color: S.faint, fontSize: 11, marginTop: 5 }}>
                  Only your country flag 🏳 will be shown on posts, not the full address.
                  {address && (() => { const loc = getLocationInfo(address); return ` Preview: ${loc.flag || '🌍'} ${loc.city}` })()}
                </p>
              </div>
              <div>
                <label style={{ color: S.muted, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
                  <User size={12} /> Bio
                </label>
                <textarea value={bio} onChange={e => setBio(e.target.value)}
                  placeholder="A short bio shown on your send page" rows={3} maxLength={160}
                  style={{ ...inputS, resize: 'none', lineHeight: 1.55 } as React.CSSProperties} />
                <p style={{ color: S.faint, fontSize: 11, marginTop: 3, textAlign: 'right' }}>{bio.length}/160</p>
              </div>
            </div>

            {/* Anonymous link — FIXED mobile overflow */}
            <div style={{ ...sectionS, background: 'rgba(124,77,255,0.07)', border: '1px solid rgba(124,77,255,0.22)' }}>
              <span style={{ ...labelS, color: '#7c4dff' }}>YOUR ANONYMOUS LINK</span>
              <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                <code style={{ display: 'block', padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.25)', color: S.text, fontSize: 12, fontFamily: 'monospace', whiteSpace: 'nowrap', minWidth: 0 }}>
                  {myLink}
                </code>
              </div>
            </div>

            {/* Username visibility */}
            <div style={sectionS}>
              <span style={labelS}><Eye size={11} style={{ display:'inline', marginRight:5 }} />USERNAME VISIBILITY</span>
              <p style={{ color: S.faint, fontSize: 12, marginBottom: 12 }}>
                Controls who sees <strong style={{ color: S.muted }}>@{wishprUser.username}</strong> instead of "Anonymous" on your posts.
              </p>
              <RadioRow label="Public" desc="Anyone can see your username" value="public" current={uVis} onSelect={() => setUVis('public')} />
              <RadioRow label="Friends only" desc="Only mutual followers see your username" value="friends" current={uVis} onSelect={() => setUVis('friends')} />
              <RadioRow label="Nobody" desc="You always appear as Anonymous" value="nobody" current={uVis} onSelect={() => setUVis('nobody')} />
            </div>

            {/* Message privacy */}
            <div style={sectionS}>
              <span style={labelS}><MessageCircle size={11} style={{ display:'inline', marginRight:5 }} />WHO CAN DM YOU</span>
              <RadioRow label="Everyone" value="everyone" current={msgPrivacy} onSelect={() => setMsgPrivacy('everyone')} />
              <RadioRow label="Followers only" value="followers" current={msgPrivacy} onSelect={() => setMsgPrivacy('followers')} />
              <RadioRow label="Nobody" desc="Disable direct messages" value="nobody" current={msgPrivacy} onSelect={() => setMsgPrivacy('nobody')} />
            </div>

            {/* Privacy toggles */}
            <div style={sectionS}>
              <span style={labelS}>PRIVACY</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                    <EyeOff size={15} color="#7c4dff" />
                    <span style={{ color: S.text, fontWeight: 600, fontSize: 14 }}>Ghost Mode</span>
                  </div>
                  <p style={{ color: S.faint, fontSize: 12 }}>Browse feed invisibly — no view counts added</p>
                </div>
                <Toggle on={ghostMode} onToggle={() => setGhostMode(!ghostMode)} />
              </div>
            </div>

            {/* Theme */}
            <div style={sectionS}>
              <span style={labelS}>THEME</span>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setTheme('dark')}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: `2px solid ${theme === 'dark' ? '#7c4dff' : S.border}`, background: theme === 'dark' ? 'rgba(124,77,255,0.1)' : 'transparent', color: theme === 'dark' ? '#7c4dff' : S.muted, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Moon size={16} /> Dark
                </button>
                <button onClick={() => setTheme('light')}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: `2px solid ${theme === 'light' ? '#7c4dff' : S.border}`, background: theme === 'light' ? 'rgba(124,77,255,0.1)' : 'transparent', color: theme === 'light' ? '#7c4dff' : S.muted, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Sun size={16} /> Light
                </button>
              </div>
            </div>

            {/* Anonymous Link Configuration */}
            <div style={sectionS}>
              <span style={labelS}>YOUR ANONYMOUS LINK</span>
              <p style={{ color: S.faint, fontSize: 12, marginBottom: 12 }}>Configure what anonymous visitors see when they open your link.</p>
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {(['text', 'poll', 'quiz'] as const).map(m => (
                  <button key={m} onClick={() => setLinkMode(m)}
                    style={{ flex: 1, padding: '9px 6px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                      background: linkMode === m ? '#7c4dff' : 'rgba(255,255,255,0.05)',
                      color:      linkMode === m ? '#fff'    : S.muted }}>
                    {m === 'text' ? 'Message' : m === 'poll' ? 'Poll' : 'Quiz'}
                  </button>
                ))}
              </div>
              <input value={linkQuestion} onChange={e => setLinkQuestion(e.target.value)}
                placeholder={linkMode === 'text' ? 'Optional: Ask them something specific…' : linkMode === 'poll' ? 'Poll question (required)' : 'Quiz question (required)'}
                maxLength={200}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: S.input, border: `1px solid ${S.border}`, color: S.text, fontSize: 14, outline: 'none', marginBottom: 10, boxSizing: 'border-box' }} />
              {linkMode === 'poll' && (
                <div>
                  {linkPollOpts.map((o, i) => (
                    <input key={i} value={o} onChange={e => { const n = [...linkPollOpts]; n[i] = e.target.value; setLinkPollOpts(n) }}
                      placeholder={`Option ${i + 1}`} maxLength={100}
                      style={{ width: '100%', padding: '9px 14px', borderRadius: 10, background: S.input, border: `1px solid ${S.border}`, color: S.text, fontSize: 13, outline: 'none', marginBottom: 7, boxSizing: 'border-box' }} />
                  ))}
                  {linkPollOpts.length < 4 && (
                    <button onClick={() => setLinkPollOpts([...linkPollOpts, ''])}
                      style={{ padding: '5px 12px', borderRadius: 9, background: 'rgba(124,77,255,0.08)', border: '1px solid rgba(124,77,255,0.2)', color: '#c084fc', fontSize: 12, cursor: 'pointer' }}>
                      + Add option
                    </button>
                  )}
                </div>
              )}
              {linkMode === 'quiz' && (
                <div>
                  {linkQuizOpts.map((o, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 7 }}>
                      <input value={o} onChange={e => { const n = [...linkQuizOpts]; n[i] = e.target.value; setLinkQuizOpts(n) }}
                        placeholder={`Option ${i + 1}`} maxLength={100}
                        style={{ flex: 1, padding: '9px 14px', borderRadius: 10, background: S.input, border: `1px solid ${linkQuizAnswer === i ? 'rgba(52,211,153,0.5)' : S.border}`, color: S.text, fontSize: 13, outline: 'none' }} />
                      <button onClick={() => setLinkQuizAnswer(i)}
                        title="Mark as correct answer"
                        style={{ width: 36, height: 36, borderRadius: 9, border: `1.5px solid ${linkQuizAnswer === i ? 'rgba(52,211,153,0.5)' : S.border}`, background: linkQuizAnswer === i ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.03)', color: linkQuizAnswer === i ? '#34d399' : S.faint, cursor: 'pointer', fontWeight: 700, fontSize: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save */}
            <button onClick={handleSave} disabled={saving}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 14, background: saved ? 'rgba(52,211,153,0.15)' : S.brand, border: saved ? '1px solid rgba(52,211,153,0.4)' : 'none', color: saved ? S.success : '#fff', fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'all 0.3s', marginBottom: 12 }}>
              {saved ? <><Check size={18} /> Saved!</> : saving ? 'Saving…' : <><Save size={16} /> Save Changes</>}
            </button>

            {/* Sign out */}
            <button onClick={handleSignOut}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 14, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: S.danger, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              <LogOut size={16} /> Sign Out
            </button>

            {/* About */}
            <div style={{ ...sectionS, marginTop: 14 }}>
              <span style={{ ...labelS, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Info size={11} /> ABOUT
              </span>
              {[
                { label: 'App',          value: 'Wishpr Xvs' },
                { label: 'Version',      value: '1.0' },
                { label: 'Developer',    value: '@shakilxvs' },
                { label: 'Data Storage', value: 'Firebase / Google Cloud' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: `1px solid ${S.border}` }}>
                  <span style={{ color: S.muted, fontSize: 14 }}>{row.label}</span>
                  <span style={{ color: S.text, fontSize: 14, fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
              {/* Support link */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 9 }}>
                <span style={{ color: S.muted, fontSize: 14 }}>Support</span>
                <a
                  href="https://shakilxvs.wordpress.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#7c4dff', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  shakilxvs.wordpress.com <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Footer tagline */}
            <p style={{ textAlign: 'center', color: S.faint, fontSize: 12, marginTop: 12, marginBottom: 6, letterSpacing: '0.04em' }}>
              Made with 👻 by @shakilxvs
            </p>

          </motion.div>
        </div>
      </main>

      {showPicker && (
        <AvatarPicker
          current={stickerId}
          onSelect={(id: StickerId) => setStickerId(id)}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  )
}
