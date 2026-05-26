import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useItemsStore } from './items'

export interface Cabinet {
  id: string
  name: string
  photos: string[]
  location: string
  createdAt: string
}

const STORAGE_KEY = 'jiaxiang-cabinets'

function loadFromStorage(): Cabinet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return getMockCabinets()
}

function getMockCabinets(): Cabinet[] {
  return [
    { id: 'cab-1', name: '主卧衣柜', photos: [], location: '主卧进门右侧，三层分区', createdAt: '2025-01-01T08:00:00.000Z' },
    { id: 'cab-2', name: '阳台工具箱', photos: [], location: '阳台右侧置物架第二层', createdAt: '2025-01-05T10:00:00.000Z' },
    { id: 'cab-3', name: '厨房储物柜', photos: [], location: '厨房吊柜左侧', createdAt: '2025-02-10T14:00:00.000Z' },
    { id: 'cab-4', name: '书房文件柜', photos: [], location: '书房书桌下方抽屉柜', createdAt: '2025-01-20T09:00:00.000Z' },
    { id: 'cab-5', name: '客厅杂物柜', photos: [], location: '客厅电视柜旁立柜', createdAt: '2025-03-01T11:00:00.000Z' },
    { id: 'cab-6', name: '次卧衣柜', photos: [], location: '次卧靠窗一侧', createdAt: '2025-04-15T16:00:00.000Z' },
  ]
}

function saveToStorage(cabinets: Cabinet[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cabinets))
}

export const useCabinetsStore = defineStore('cabinets', () => {
  const cabinets = ref<Cabinet[]>(loadFromStorage())

  const totalCount = computed(() => cabinets.value.length)

  const filteredCabinets = computed(() => {
    return (keyword?: string, startDate?: string, endDate?: string) => {
      let result = [...cabinets.value]
      if (keyword?.trim()) {
        const k = keyword.trim().toLowerCase()
        result = result.filter(c =>
          c.name.toLowerCase().includes(k) ||
          c.location.toLowerCase().includes(k)
        )
      }
      if (startDate) {
        result = result.filter(c => c.createdAt >= startDate)
      }
      if (endDate) {
        result = result.filter(c => c.createdAt <= endDate)
      }
      return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
  })

  const cabinetById = computed(() => {
    return (id: string) => cabinets.value.find(c => c.id === id)
  })

  const cabinetsWithItemCount = computed(() => {
    const itemsStore = useItemsStore()
    return cabinets.value.map(c => ({
      ...c,
      itemCount: itemsStore.items.filter(i => i.cabinetId === c.id).length,
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  })

  function addCabinet(cabinet: Omit<Cabinet, 'id' | 'createdAt'>) {
    const newCabinet: Cabinet = {
      ...cabinet,
      id: 'cab-' + Date.now(),
      createdAt: new Date().toISOString(),
    }
    cabinets.value.unshift(newCabinet)
    saveToStorage(cabinets.value)
    return newCabinet
  }

  function updateCabinet(id: string, updates: Partial<Cabinet>) {
    const idx = cabinets.value.findIndex(c => c.id === id)
    if (idx >= 0) {
      cabinets.value[idx] = { ...cabinets.value[idx], ...updates }
      saveToStorage(cabinets.value)
      return true
    }
    return false
  }

  function deleteCabinet(id: string) {
    const itemsStore = useItemsStore()
    const hasItems = itemsStore.items.some(i => i.cabinetId === id)
    if (hasItems) return false
    cabinets.value = cabinets.value.filter(c => c.id !== id)
    saveToStorage(cabinets.value)
    return true
  }

  return {
    cabinets,
    totalCount,
    filteredCabinets,
    cabinetById,
    cabinetsWithItemCount,
    addCabinet,
    updateCabinet,
    deleteCabinet,
  }
})
