import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LocalItemRepository } from '@/repositories/local/itemRepository'
import type { IItemRepository } from '@/repositories/types'
import type { ItemVO, ItemFilters } from '@/types/item'

/** V1 工厂函数：后续替换为 HttpItemRepository 即可迁移到 V2 */
function getRepository(): IItemRepository {
  return new LocalItemRepository()
}

export interface Item extends ItemVO {}

const STORAGE_KEY = 'jiaxiang-items'

/** 兼容已有 localStorage 数据 */
function loadFromStorage(): Item[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return getMockItems()
}

function getMockItems(): Item[] {
  return [
    { id: 'item-1', name: '冬季羽绒服', categoryId: 'cat-2', photos: [], storageDate: '2025-11-01', cabinetId: 'cab-1', note: '加厚长款，黑色', createdAt: '2025-11-01T10:00:00.000Z' },
    { id: 'item-2', name: '螺丝刀套装', categoryId: 'cat-3', photos: [], storageDate: '2025-03-15', cabinetId: 'cab-2', note: '6件套精密螺丝刀', createdAt: '2025-03-15T14:30:00.000Z' },
    { id: 'item-3', name: '常用药品箱', categoryId: 'cat-4', photos: [], storageDate: '2025-05-20', cabinetId: 'cab-3', note: '感冒灵、退烧药、创可贴', createdAt: '2025-05-20T09:00:00.000Z' },
    { id: 'item-4', name: '重要文件袋', categoryId: 'cat-5', photos: [], storageDate: '2025-01-10', cabinetId: 'cab-4', note: '房产证、户口本、保险单', createdAt: '2025-01-10T16:00:00.000Z' },
    { id: 'item-5', name: '纯棉T恤（白色）', categoryId: 'cat-2', photos: [], storageDate: '2025-06-01', cabinetId: 'cab-1', note: '夏季常穿', createdAt: '2025-06-01T11:00:00.000Z' },
    { id: 'item-6', name: '电钻', categoryId: 'cat-3', photos: [], storageDate: '2024-12-20', cabinetId: 'cab-2', note: '家用冲击钻', createdAt: '2024-12-20T10:00:00.000Z' },
    { id: 'item-7', name: '维生素C片', categoryId: 'cat-4', photos: [], storageDate: '2025-04-18', cabinetId: 'cab-3', note: '每日一片', createdAt: '2025-04-18T08:30:00.000Z' },
    { id: 'item-8', name: '合同文件夹', categoryId: 'cat-5', photos: [], storageDate: '2025-02-28', cabinetId: 'cab-4', note: '2025年度合同', createdAt: '2025-02-28T15:00:00.000Z' },
    { id: 'item-9', name: '保温杯', categoryId: 'cat-1', photos: [], storageDate: '2025-07-10', cabinetId: 'cab-5', note: '500ml不锈钢', createdAt: '2025-07-10T13:00:00.000Z' },
    { id: 'item-10', name: '运动鞋', categoryId: 'cat-2', photos: [], storageDate: '2025-08-05', cabinetId: 'cab-1', note: '跑步鞋，42码', createdAt: '2025-08-05T17:00:00.000Z' },
  ]
}

export const useItemsStore = defineStore('items', () => {
  const items = ref<Item[]>(loadFromStorage())
  const repo = getRepository()

  const totalCount = computed(() => items.value.length)

  const filteredItems = computed(() => {
    return (filters?: ItemFilters) => {
      let result = [...items.value]
      if (filters?.keyword?.trim()) {
        const k = filters.keyword.trim().toLowerCase()
        result = result.filter(i => i.name.toLowerCase().includes(k))
      }
      if (filters?.categoryId && filters.categoryId !== 'all') {
        result = result.filter(i => i.categoryId === filters.categoryId)
      }
      if (filters?.dateStart) {
        result = result.filter(i => i.storageDate >= filters.dateStart)
      }
      if (filters?.dateEnd) {
        result = result.filter(i => i.storageDate <= filters.dateEnd)
      }
      return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
  })

  const recentItems = computed(() => {
    return [...items.value]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  })

  const itemsByCategory = computed(() => {
    const map: Record<string, Item[]> = {}
    items.value.forEach(item => {
      if (!map[item.categoryId]) map[item.categoryId] = []
      map[item.categoryId].push(item)
    })
    return map
  })

  const itemsByCabinetId = computed(() => {
    const map: Record<string, Item[]> = {}
    items.value.forEach(item => {
      if (!map[item.cabinetId]) map[item.cabinetId] = []
      map[item.cabinetId].push(item)
    })
    return map
  })

  const itemById = computed(() => {
    return (id: string) => items.value.find(i => i.id === id)
  })

  /** delegate to repository and sync local ref */
  async function addItem(item: Omit<Item, 'id' | 'createdAt'>) {
    const created = await repo.create(item)
    items.value.unshift(created)
    syncStorage()
    return created
  }

  async function updateItem(id: string, updates: Partial<Item>) {
    const updated = await repo.update(id, updates)
    if (updated) {
      const idx = items.value.findIndex(i => i.id === id)
      if (idx >= 0) {
        items.value[idx] = updated
        syncStorage()
      }
      return true
    }
    return false
  }

  async function deleteItem(id: string) {
    const ok = await repo.delete(id)
    if (ok) {
      items.value = items.value.filter(i => i.id !== id)
      syncStorage()
    }
    return ok
  }

  /** sync Pinia ref back to legacy localStorage key */
  function syncStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
  }

  return {
    items,
    totalCount,
    filteredItems,
    recentItems,
    itemsByCategory,
    itemsByCabinetId,
    itemById,
    addItem,
    updateItem,
    deleteItem,
    getRepository: () => repo,
  }
})
