// Watches Firebase login state and keeps the store in sync.
import { useEffect }                     from 'react'
import { onAuthStateChanged }            from 'firebase/auth'
import { doc, getDoc, updateDoc }        from 'firebase/firestore'
import { auth, db, COLLECTIONS }         from '@/lib/firebase'
import { useAuthStore }                  from '@/store/authStore'
import { WishprUser }                    from '@/types'

export function useAuthListener() {
  const { setFirebaseUser, setWishprUser, setLoading } = useAuthStore()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser)

      if (firebaseUser) {
        const snap = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid))
        if (snap.exists()) {
          setWishprUser(snap.data() as WishprUser)
          // Update lastSeen for online presence
          updateDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), {
            lastSeen: Date.now(),
          }).catch(() => {})
        }
      } else {
        setWishprUser(null)
      }

      setLoading(false)
    })

    // Periodically update lastSeen every 60s while tab is open
    const interval = setInterval(() => {
      const u = auth.currentUser
      if (u) {
        updateDoc(doc(db, COLLECTIONS.USERS, u.uid), { lastSeen: Date.now() }).catch(() => {})
      }
    }, 60000)

    return () => { unsub(); clearInterval(interval) }
  }, [setFirebaseUser, setWishprUser, setLoading])
}
