import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSystemRepository } from '@/repositories'

export interface SystemStats {
  totalItems: number
  totalCabinets: number
  totalCategories: number
}

export const useSystemStore = defineStore('system', () => {
  const stats = ref<SystemStats>({
    totalItems: 0,
    totalCabinets: 0,
    totalCategories: 0,
  })

  async function fetchStats() {
    const repo = getSystemRepository()
    stats.value = await repo.getStats()
  }

  async function clearAllData() {
    const repo = getSystemRepository()
    await repo.clearCache()
  }

  return {
    stats,
    fetchStats,
    clearAllData,
  }
})
