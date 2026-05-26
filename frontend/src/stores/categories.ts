import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useItemsStore } from './items'

export interface Category {
  id: string
  name: string
  sortOrder: number
  createdAt: string
  color?: string
  icon?: string
}

// 预设分类配色（ins风温暖色调）
export const presetCategoryStyles: Record<string, { from: string; to: string; iconName: string }> = {
  'cat-1': { from: 'from-amber-300', to: 'to-orange-400', iconName: 'Sparkles' },
  'cat-2': { from: 'from-rose-300', to: 'to-red-400', iconName: 'Shirt' },
  'cat-3': { from: 'from-emerald-300', to: 'to-teal-500', iconName: 'Wrench' },
  'cat-4': { from: 'from-sky-300', to: 'to-blue-500', iconName: 'Pill' },
  'cat-5': { from: 'from-violet-300', to: 'to-purple-500', iconName: 'FileText' },
}

// 动态分类配色池（用于自定义分类）
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

const STORAGE_KEY = 'jiaxiang-categories'

function loadFromStorage(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return getMockCategories()
}

function getMockCategories(): Category[] {
  return [
    { id: 'cat-1', name: '生活用品', sortOrder: 1, createdAt: '2025-01-01T08:00:00.000Z' },
    { id: 'cat-2', name: '衣物', sortOrder: 2, createdAt: '2025-01-01T08:00:00.000Z' },
    { id: 'cat-3', name: '工具', sortOrder: 3, createdAt: '2025-01-01T08:00:00.000Z' },
    { id: 'cat-4', name: '药品', sortOrder: 4, createdAt: '2025-02-15T10:00:00.000Z' },
    { id: 'cat-5', name: '文件', sortOrder: 5, createdAt: '2025-03-01T14:00:00.000Z' },
  ]
}

function saveToStorage(categories: Category[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
}

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>(loadFromStorage())

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

  function addCategory(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return null
    if (trimmed.length > 20) return null
    const exists = categories.value.some(
      c => c.name.toLowerCase() === trimmed.toLowerCase()
    )
    if (exists) return null
    const maxOrder = categories.value.reduce((max, c) => Math.max(max, c.sortOrder), 0)
    const newCategory: Category = {
      id: 'cat-' + Date.now(),
      name: trimmed,
      sortOrder: maxOrder + 1,
      createdAt: new Date().toISOString(),
    }
    categories.value.push(newCategory)
    saveToStorage(categories.value)
    return newCategory
  }

  function updateCategory(id: string, name: string) {
    const trimmed = name.trim()
    if (!trimmed || trimmed.length > 20) return false
    const exists = categories.value.some(
      c => c.id !== id && c.name.toLowerCase() === trimmed.toLowerCase()
    )
    if (exists) return false
    const idx = categories.value.findIndex(c => c.id === id)
    if (idx >= 0) {
      categories.value[idx].name = trimmed
      saveToStorage(categories.value)
      return true
    }
    return false
  }

  function deleteCategory(id: string, mode: 'delete' | 'uncategorized' = 'uncategorized') {
    const itemsStore = useItemsStore()
    const relatedItems = itemsStore.items.filter(i => i.categoryId === id)
    if (relatedItems.length > 0) {
      if (mode === 'delete') {
        relatedItems.forEach(i => itemsStore.deleteItem(i.id))
      } else {
        relatedItems.forEach(i => itemsStore.updateItem(i.id, { categoryId: '' }))
      }
    }
    categories.value = categories.value.filter(c => c.id !== id)
    saveToStorage(categories.value)
    return true
  }

  function reorderCategories(id: string, direction: 'up' | 'down') {
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
    categories.value = sorted
    saveToStorage(categories.value)
    return true
  }

  return {
    categories,
    categoryById,
    sortedCategories,
    categoriesWithCount,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  }
})
