import type { ICategoryRepository } from '../types'
import type { Category, CategoryVO, CategoryCreateInput, CategoryDeleteStrategy, CategoryOrderInput } from '@/types/category'
import { generateUniqueId } from '../utils/generateId'

const CATEGORIES_KEY = 'jiaxiang-categories'
const ITEMS_KEY = 'jiaxiang-items'

function loadCategories(): Category[] {
    try {
        const raw = localStorage.getItem(CATEGORIES_KEY)
        if (raw) return JSON.parse(raw)
    } catch {
        /* ignore */
    }
    return []
}

function saveCategories(categories: Category[]) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
}

function loadItems(): Array<{ categoryId: string }> {
    try {
        const raw = localStorage.getItem(ITEMS_KEY)
        if (raw) return JSON.parse(raw)
    } catch {
        /* ignore */
    }
    return []
}

function getMockCategories(): Category[] {
    return [
        { id: 'cat-1', name: '生活用品', sortOrder: 1, createdAt: '2025-01-01T08:00:00.000Z', color: '#f59e0b', icon: 'CollectionTag' },
        { id: 'cat-2', name: '衣物', sortOrder: 2, createdAt: '2025-01-01T08:00:00.000Z', color: '#f43f5e', icon: 'CollectionTag' },
        { id: 'cat-3', name: '工具', sortOrder: 3, createdAt: '2025-01-01T08:00:00.000Z', color: '#10b981', icon: 'CollectionTag' },
    ]
}

function seedIfEmpty(): Category[] {
    const existing = loadCategories()
    if (existing.length === 0) {
        const seeded = getMockCategories()
        saveCategories(seeded)
        return seeded
    }
    return existing
}

export class LocalCategoryRepository implements ICategoryRepository {
    async list(): Promise<CategoryVO[]> {
        const categories = seedIfEmpty()
        const items = loadItems()
        const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder)
        return sorted.map((c) => ({
            ...c,
            itemCount: items.filter((i) => i.categoryId === c.id).length,
        }))
    }

    async getById(id: string): Promise<Category | null> {
        const categories = seedIfEmpty()
        return categories.find((c) => c.id === id) ?? null
    }

    async create(dto: CategoryCreateInput): Promise<string> {
        const categories = seedIfEmpty()
        const trimmed = dto.name.trim()
        if (!trimmed || trimmed.length > 20) return ''
        const exists = categories.some(
            (c) => c.name.toLowerCase() === trimmed.toLowerCase()
        )
        if (exists) return ''
        const maxOrder = categories.reduce((max, c) => Math.max(max, c.sortOrder), 0)
        const newCategory: Category = {
            id: generateUniqueId('cat'),
            name: trimmed,
            sortOrder: maxOrder + 1,
            createdAt: new Date().toISOString(),
            color: dto.color,
            icon: dto.icon,
        }
        categories.push(newCategory)
        saveCategories(categories)
        return newCategory.id
    }

    async update(id: string, dto: Partial<CategoryCreateInput>): Promise<boolean> {
        const categories = seedIfEmpty()
        if (dto.name !== undefined) {
            const trimmed = dto.name.trim()
            if (!trimmed || trimmed.length > 20) return false
            const exists = categories.some(
                (c) => c.id !== id && c.name.toLowerCase() === trimmed.toLowerCase()
            )
            if (exists) return false
        }
        const idx = categories.findIndex((c) => c.id === id)
        if (idx < 0) return false
        categories[idx] = { ...categories[idx], ...dto }
        saveCategories(categories)
        return true
    }

    async delete(id: string, _strategy: CategoryDeleteStrategy): Promise<boolean> {
        const categories = seedIfEmpty()
        const filtered = categories.filter((c) => c.id !== id)
        saveCategories(filtered)
        return true
    }

    async reorder(orders: CategoryOrderInput[]): Promise<void> {
        const categories = seedIfEmpty()
        orders.forEach(({ id, sortOrder }) => {
            const cat = categories.find((c) => c.id === id)
            if (cat) cat.sortOrder = sortOrder
        })
        saveCategories(categories)
    }

    async getItemCount(categoryId: string): Promise<number> {
        const items = loadItems()
        return items.filter((i) => i.categoryId === categoryId).length
    }
}
