export type UsernameVisibility = 'public' | 'friends' | 'nobody'
export type MessagePrivacy     = 'everyone' | 'followers' | 'nobody'
export type Theme              = 'dark' | 'light'
export type ReactionKey        = 'heart' | 'funny' | 'sad' | 'angry' | 'wow'

export interface WishprUser {
  uid:                string
  username:           string
  displayName:        string
  email:              string | null
  photoURL:           string | null
  createdAt:          number
  isGhostMode:        boolean
  followerCount:      number
  followingCount:     number
  messageCount:       number
  linkSlug:           string
  address?:           string          // full address entered in settings
  countryFlag?:       string          // derived emoji flag
  cityLabel?:         string          // short city/state e.g. 'NY', 'Dhaka'
  bio?:               string
  usernameVisibility: UsernameVisibility
  messagePrivacy:     MessagePrivacy
  theme?:             Theme
  stickerId?:         string    // ghost sticker avatar id
  lastSeen?:          number    // timestamp for online presence
}

export interface Post {
  id:           string
  authorId:     string
  type:         'post' | 'confession' | 'poll' | 'debate' | 'shoutout' | 'crush'
  content:      string
  isVoice:      boolean
  audioUrl?:    string
  reactions:    Record<ReactionKey, number>
  reactedBy:    Record<string, ReactionKey>   // uid → reaction key (one per user)
  replyCount:   number
  viewCount:    number
  isExpired:    boolean
  pollOptions?: { id: string; label: string; votes: number; votedBy: string[] }[]
  debateSideA?: number
  debateSideB?: number
  sideALabel?:  string
  sideBLabel?:  string
  createdAt:    number
  // denormalised author snapshot (for feed display without extra reads)
  authorUsername:    string
  authorFlag:        string
  authorCity:        string
  authorVisibility:  UsernameVisibility
  authorStickerId?:  string   // ghost sticker id
}

export interface Message {
  id:              string
  toUserId:        string
  content:         string
  audioUrl?:       string
  isVoice:         boolean
  reactionEmoji?:  string
  isRead:          boolean
  isBurnAfterRead: boolean
  createdAt:       number
}

export interface DirectMessage {
  id:         string
  threadId:   string
  fromUserId: string
  toUserId:   string
  content:    string
  audioUrl?:  string
  isVoice:    boolean
  isRead:     boolean
  createdAt:  number
}

export interface Group {
  id:          string
  name:        string
  description: string
  inviteCode:  string
  createdBy:   string
  memberCount: number
  postCount:   number
  createdAt:   number
}

export interface Follow {
  followerId:  string
  followingId: string
  createdAt:   number
}
