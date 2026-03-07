import { create }               from 'zustand'
import { WishprUser, Theme }    from '@/types'
import { User as FirebaseUser } from 'firebase/auth'

interface AuthState {
  firebaseUser:    FirebaseUser | null
  wishprUser:      WishprUser  | null
  isLoading:       boolean
  theme:           Theme
  setFirebaseUser: (u: FirebaseUser | null) => void
  setWishprUser:   (u: WishprUser  | null) => void
  setLoading:      (v: boolean)            => void
  setTheme:        (t: Theme)              => void
  clear:           ()                      => void
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser:    null,
  wishprUser:      null,
  isLoading:       true,
  theme:           'dark',
  setFirebaseUser: (u) => set({ firebaseUser: u }),
  setWishprUser:   (u) => set({ wishprUser: u }),
  setLoading:      (v) => set({ isLoading: v }),
  setTheme:        (t) => {
    if (typeof window !== 'undefined') localStorage.setItem('wishpr_theme', t)
    set({ theme: t })
  },
  clear: () => set({ firebaseUser: null, wishprUser: null }),
}))
