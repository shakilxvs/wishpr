import Link          from 'next/link'
import { useRouter } from 'next/router'
import { Home, Globe, MessageSquare, Inbox, User, Users } from 'lucide-react'
import { ROUTES }       from '@/constants/routes'
import { useAuthStore } from '@/store/authStore'
import { useT }         from '@/lib/theme'
import { Avatar }       from '@/components/Avatars'

// Pages that must never show the nav
const HIDDEN_PATHS = ['/', '/auth/signin', '/auth/signup']

export default function BottomNav() {
  const router         = useRouter()
  const { wishprUser } = useAuthStore()
  const S              = useT()

  // Hide if: not logged in, on auth/landing pages, on anonymous send (/s/) pages,
  // on DM screen, or inside a specific group chat (chat-like UX — no bottom nav)
  if (
    !wishprUser ||
    HIDDEN_PATHS.includes(router.pathname) ||
    router.pathname.startsWith('/s/') ||
    router.pathname.startsWith('/groups/')
  ) return null

  const profileHref = ROUTES.PROFILE(wishprUser.uid)

  const navItems = [
    { href: ROUTES.DASHBOARD, Icon: Home,          label: 'Home'     },
    { href: ROUTES.FEED,      Icon: Globe,         label: 'Feed'     },
    { href: ROUTES.MESSAGES,  Icon: MessageSquare, label: 'Messages' },
    { href: ROUTES.INBOX,     Icon: Inbox,         label: 'Inbox'    },
    { href: ROUTES.GROUPS,    Icon: Users,         label: 'Groups'   },
    { href: profileHref,      Icon: User,          label: 'Profile'  },
  ]

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      zIndex: 100,
      paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)',
      paddingTop: 10,
      display: 'flex', justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <div style={{
        display: 'flex', gap: 4, alignItems: 'center',
        background: S.navBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${S.border}`,
        borderRadius: 20,
        padding: '7px 10px',
        overflowX: 'auto',
        maxWidth: '98vw',
        scrollbarWidth: 'none' as any,
        pointerEvents: 'all',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      }}>
        {navItems.map(({ href, Icon, label }) => {
          const isProfile = href === profileHref
          const isActive  = isProfile
            ? router.pathname.startsWith('/u/')
            : router.pathname === href ||
              (href !== ROUTES.DASHBOARD && router.pathname.startsWith(href))

          return (
            <Link key={href} href={href} title={label} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 44, height: 44, borderRadius: 13,
                background: isActive ? 'rgba(124,77,255,0.18)' : 'transparent',
                border: isActive ? '1px solid rgba(124,77,255,0.35)' : '1px solid transparent',
                color: isActive ? '#7c4dff' : S.faint,
                transition: 'all 0.2s',
                flexShrink: 0,
              }}>
                {isProfile && wishprUser?.stickerId ? (
                  <Avatar
                    stickerId={wishprUser.stickerId}
                    size={30}
                    style={{
                      border: isActive ? '1.5px solid #7c4dff' : '1.5px solid transparent',
                      background: 'transparent',
                    }}
                  />
                ) : (
                  <Icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
