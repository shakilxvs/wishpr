import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth }                         from 'firebase/auth'
import { getFirestore }                    from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db   = getFirestore(app)
export default app

export const COLLECTIONS = {
  USERS:           'users',
  USERNAMES:       'usernames',
  MESSAGES:        'messages',
  POSTS:           'posts',
  DIRECT_MESSAGES: 'direct_messages',
  GROUPS:          'groups',
  GROUP_MEMBERS:   'group_members',
  FOLLOWS:         'follows',
  NOTIFICATIONS:   'notifications',
} as const
