import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [unread, setUnread] = useState(0)
  const [ping, setPing] = useState(null)   // { id, from_role, created_at }

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.loggedIn) setUser(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Polling: thu chua doc + ping moi 30s
  const checkUnread = useCallback(() => {
    if (!user) return
    fetch('/api/auth/unread', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setUnread(data.count || 0))
      .catch(() => {})
  }, [user])

  const checkPing = useCallback(() => {
    if (!user) return
    fetch('/api/ping/latest', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (data.ping) setPing(data.ping) })
      .catch(() => {})
  }, [user])

  useEffect(() => {
    checkUnread()
    checkPing()
    const i1 = setInterval(checkUnread, 30000)
    const i2 = setInterval(checkPing, 30000)
    return () => { clearInterval(i1); clearInterval(i2) }
  }, [checkUnread, checkPing])

  const dismissPing = async () => {
    if (!ping) return
    await fetch(`/api/ping/${ping.id}/seen`, { method: 'POST', credentials: 'include' }).catch(() => {})
    setPing(null)
  }

  const login = async (password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Mat khau sai')
    setUser(data)
    setUnread(0)
    return data
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
    setUnread(0)
    setPing(null)
  }

  const clearUnread = () => setUnread(0)

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      unread,
      clearUnread,
      login,
      logout,
      ping,
      dismissPing,
      isLoggedIn: !!user,
      isAdmin:    !!user,
      role:       user?.role || null,
      name:       user?.name || null,
      emoji:      user?.emoji || null,
      avatar:     user?.avatar || null,
      setAvatar:  (url) => setUser(u => u ? { ...u, avatar: url } : u),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() { return useContext(AuthContext) }
