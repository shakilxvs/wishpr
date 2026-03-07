// Watches Firebase login state and keeps the store in sync.
import { useEffect }             from 'react'
import { onAuthStateChanged }    from 'firebase/auth'
import { doc, getDoc }           from 'firebase/firestore'
import { auth, db, COLLECTIONS } from '@/lib/firebase'
import { useAuthStore }          from '@/store/authStore'
import { WishprUser }            from '@/types'

export function useAuthListener() {
  const { setFirebaseUser, setWishprUser, setLoading } = useAuthStore()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser)

      if (firebaseUser) {
        const snap = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid))
        if (snap.exists()) setWishprUser(snap.data() as WishprUser)
      } else {
        setWishprUser(null)
      }

      setLoading(false)
    })

    return () => unsub()
  }, [setFirebaseUser, setWishprUser, setLoading])
}
