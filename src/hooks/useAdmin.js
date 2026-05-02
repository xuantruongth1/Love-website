import { useAuth } from '@/context/AuthContext'

export function useAdmin() {
  return useAuth().isLoggedIn
}
