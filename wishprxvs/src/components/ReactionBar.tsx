import { motion }     from 'framer-motion'
import { Heart, Smile, Frown, Zap, Sparkles } from 'lucide-react'
import { ReactionKey } from '@/types'
import { useT }        from '@/lib/theme'

const REACTIONS: { key: ReactionKey; Icon: any; color: string; label: string }[] = [
  { key: 'heart', Icon: Heart,     color: '#f43f5e', label: 'Heart'  },
  { key: 'funny', Icon: Smile,     color: '#fbbf24', label: 'Funny'  },
  { key: 'sad',   Icon: Frown,     color: '#60a5fa', label: 'Sad'    },
  { key: 'angry', Icon: Zap,       color: '#f97316', label: 'Angry'  },
  { key: 'wow',   Icon: Sparkles,  color: '#a78bfa', label: 'Wow'    },
]

interface Props {
  reactions:  Record<ReactionKey, number>
  reactedBy:  Record<string, ReactionKey>
  myUid?:     string
  onReact:    (key: ReactionKey) => void
}

export default function ReactionBar({ reactions, reactedBy, myUid, onReact }: Props) {
  const S = useT()
  const myReaction = myUid ? reactedBy?.[myUid] : undefined

  return (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
      {REACTIONS.map(({ key, Icon, color, label }) => {
        const count   = reactions?.[key] || 0
        const isMine  = myReaction === key
        const already = !!myReaction

        return (
          <motion.button key={key}
            whileTap={{ scale: 0.88 }}
            onClick={() => !already && onReact(key)}
            title={already ? (isMine ? `You reacted ${label}` : 'Already reacted') : `React ${label}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px',
              borderRadius: 999, cursor: already ? 'default' : 'pointer', border: 'none',
              background: isMine ? `${color}20` : 'rgba(255,255,255,0.04)',
              outline: isMine ? `1.5px solid ${color}60` : `1px solid ${S.border}`,
              transition: 'all 0.18s', opacity: already && !isMine ? 0.5 : 1,
            }}>
            <Icon size={15} color={isMine ? color : S.faint}
              fill={isMine && key === 'heart' ? color : 'none'}
              strokeWidth={isMine ? 2.2 : 1.8}
            />
            {count > 0 && (
              <span style={{ color: isMine ? color : S.muted, fontSize: 12, fontWeight: 600 }}>
                {count}
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
