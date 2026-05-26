import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id?: string
  email: string
  name: string
  role: 'admin'
  avatar?: string
}

const mockUsers: User[] = [
  { id: '1', email: 'admin@example.com', name: '家庭管理员', role: 'admin' },
]

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  async function login(email: string, password: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const u = mockUsers.find((m) => m.email === email)
        if (u && password === 'password') {
          user.value = u
          token.value = 'mock-token'
          resolve(true)
        } else {
          resolve(false)
        }
      }, 300)
    })
  }

  function logout() {
    user.value = null
    token.value = null
  }

  return { user, token, isAuthenticated, login, logout }
}, {
  persist: true,
})
