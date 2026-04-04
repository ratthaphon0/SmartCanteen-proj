import { create } from 'zustand'
import Cookies from 'js-cookie'

const useAuthStore = create((set, get) => ({
  user: null,
  token: Cookies.get('token') || null,
  isAuthenticated: !!Cookies.get('token'),

  login: async (username, password) => {
    try {
      // In real app, call API
      // For demo, simulate login
      if (username === 'demo' && password === 'demo') {
        const token = 'demo-token'
        Cookies.set('token', token)
        set({ user: { id: 'USR-001', username }, token, isAuthenticated: true })
        return { success: true }
      }
      return { success: false, error: 'Invalid credentials' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  logout: () => {
    Cookies.remove('token')
    set({ user: null, token: null, isAuthenticated: false })
  },

  checkAuth: () => {
    const token = Cookies.get('token')
    if (token) {
      // In real app, validate token with API
      set({ token, isAuthenticated: true, user: { id: 'USR-001', username: 'demo' } })
    }
  }
}))

export default useAuthStore