import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCategoryRepository } from '@/repositories'
import type { ICategoryRepository } from '@/repositories/types'
import type { Category, CategoryDeleteStrategy } from '@/types/category'
import { useItemsStore } from './items'

function getRepository(): ICategoryRepository {
  return getCategoryRepository()
}

export const dynamicColorPool = [
  { from: 'from-amber-300', to: 'to-orange-400' },
  { from: 'from-rose-300', to: 'to-red-400' },
  { from: 'from-emerald-300', to: 'to-teal-500' },
  { from: 'from-sky-300', to: 'to-blue-500' },
  { from: 'from-violet-300', to: 'to-purple-500' },
  { from: 'from-pink-300', to: 'to-rose-500' },
  { from: 'from-cyan-300', to: 'to-teal-400' },
  { from: 'from-lime-300', to: 'to-green-500' },
  { from: 'from-indigo-300', to: 'to-blue-600' },
  { from: 'from-fuchsia-300', to: 'to-pink-500' },
]

// 预设分类配色（兼容 Search.vue 等遗留引用）
export const presetCategoryStyles: Record<string, { from: string; to: string; iconName: string }> = {
  'cat-1': { from: 'from-amber-300', to: 'to-orange-400', iconName: 'Sparkles' },
  'cat-2': { from: 'from-rose-300', to: 'to-red-400', iconName: 'Shirt' },
  'cat-3': { from: 'from-emerald-300', to: 'to-teal-500', iconName: 'Wrench' },
  'cat-4': { from: 'from-sky-300', to: 'to-blue-500', iconName: 'Pill' },
  'cat-5': { from: 'from-violet-300', to: 'to-purple-500', iconName: 'FileText' },
}

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>([])
  const repo = getRepository()

  const categoryById = computed(() => {
    return (id: string) => categories.value.find(c => c.id === id)
  })

  const sortedCategories = computed(() => {
    return [...categories.value].sort((a, b) => a.sortOrder - b.sortOrder)
  })

  const categoriesWithCount = computed(() => {
    const itemsStore = useItemsStore()
    return sortedCategories.value.map(c => ({
      ...c,
      count: itemsStore.items.filter(i => i.categoryId === c.id).length,
    }))
  })

  async function loadCategories() {
    const data = await repo.list()
    categories.value = data
  }

  async function addCategory(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return null
    if (trimmed.length > 20) return null
    const id = await repo.create({ name: trimmed })
    if (!id) return null
    const all = await repo.list()
    categories.value = all
    return all.find(c => c.id === id) ?? null
  }

  async function updateCategory(id: string, name: string) {
    const trimmed = name.trim()
    if (!trimmed || trimmed.length > 20) return false
    const ok = await repo.update(id, { name: trimmed })
    if (ok) {
      const all = await repo.list()
      categories.value = all
    }
    return ok
  }

  async function deleteCategory(id: string, mode: 'delete' | 'uncategorized' = 'uncategorized') {
    const itemsStore = useItemsStore()
    const relatedItems = itemsStore.items.filter(i => i.categoryId === id)
    if (relatedItems.length > 0) {
      if (mode === 'delete') {
        relatedItems.forEach(i => itemsStore.deleteItem(i.id))
      } else {
        relatedItems.forEach(i => itemsStore.updateItem(i.id, { categoryId: '' }))
      }
    }
    const ok = await repo.delete(id, 'DELETE_ITEMS')
    if (ok) {
      const all = await repo.list()
      categories.value = all
    }
    return ok
  }

  async function reorderCategories(id: string, direction: 'up' | 'down') {
    const sorted = [...categories.value].sort((a, b) => a.sortOrder - b.sortOrder)
    const idx = sorted.findIndex(c => c.id === id)
    if (idx < 0) return false
    if (direction === 'up' && idx > 0) {
      const temp = sorted[idx].sortOrder
      sorted[idx].sortOrder = sorted[idx - 1].sortOrder
      sorted[idx - 1].sortOrder = temp
    } else if (direction === 'down' && idx < sorted.length - 1) {
      const temp = sorted[idx].sortOrder
      sorted[idx].sortOrder = sorted[idx + 1].sortOrder
      sorted[idx + 1].sortOrder = temp
    }
    await repo.reorder(sorted.map(c => ({ id: c.id, sortOrder: c.sortOrder })))
    categories.value = sorted
    return true
  }

  return {
    categories,
    categoryById,
    sortedCategories,
    categoriesWithCount,
    loadCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  }
})
