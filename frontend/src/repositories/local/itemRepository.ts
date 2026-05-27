import type { IItemRepository } from '../types'
import type { ItemVO, ItemFilters } from '@/types/item'
import { generateUniqueId } from '../utils/generateId'

const ITEMS_KEY = 'jiaxiang-items'
const CABINETS_KEY = 'jiaxiang-cabinets'

function loadItems(): ItemVO[] {
    try {
        const raw = localStorage.getItem(ITEMS_KEY)
        if (raw) return JSON.parse(raw)
    } catch {
        /* ignore */
    }
    return []
}

function saveItems(items: ItemVO[]) {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
}

function loadCabinets(): any[] {
    try {
        const raw = localStorage.getItem(CABINETS_KEY)
        if (raw) return JSON.parse(raw)
    } catch {
        /* ignore */
    }
    return []
}

function saveCabinets(cabinets: any[]) {
    localStorage.setItem(CABINETS_KEY, JSON.stringify(cabinets))
}

/**
 * R011: 变更储物柜时更新旧/新储物柜计数
 * R012: 删除物品时递减储物柜计数
 * 计数通过实时计算 items 中各 cabinetId 的数量来保持一致性
 */
function recalcCabinetCounts() {
    const items = loadItems()
    const cabinets = loadCabinets()
    if (cabinets.length === 0) return
    const countMap: Record<string, number> = {}
    items.forEach((i) => {
        countMap[i.cabinetId] = (countMap[i.cabinetId] || 0) + 1
    })
    const updated = cabinets.map((c: any) => ({
        ...c,
        itemCount: countMap[c.id] || 0,
    }))
    saveCabinets(updated)
}

export class LocalItemRepository implements IItemRepository {
    async create(item: Omit<ItemVO, 'id' | 'createdAt'>): Promise<ItemVO> {
        const items = loadItems()
        const newItem: ItemVO = {
            ...item,
            id: generateUniqueId('item'),
            createdAt: new Date().toISOString(),
        }
        items.unshift(newItem)
        saveItems(items)
        recalcCabinetCounts()
        return newItem
    }

    async update(
        id: string,
        updates: Partial<Omit<ItemVO, 'id' | 'createdAt'>>,
    ): Promise<ItemVO | null> {
        const items = loadItems()
        const idx = items.findIndex((i) => i.id === id)
        if (idx < 0) return null
        const hasCabinetChange =
            'cabinetId' in updates && updates.cabinetId !== items[idx].cabinetId
        const updated = { ...items[idx], ...updates }
        items[idx] = updated
        saveItems(items)
        if (hasCabinetChange) {
            recalcCabinetCounts()
        }
        return updated
    }

    async delete(id: string): Promise<boolean> {
        const items = loadItems()
        const exists = items.some((i) => i.id === id)
        if (!exists) return false
        saveItems(items.filter((i) => i.id !== id))
        recalcCabinetCounts()
        return true
    }

    async list(filters?: ItemFilters): Promise<ItemVO[]> {
        let result = loadItems()

        if (filters?.keyword?.trim()) {
            const k = filters.keyword.trim().toLowerCase()
            result = result.filter((i) => i.name.toLowerCase().includes(k))
        }
        if (filters?.categoryId && filters.categoryId !== 'all') {
            result = result.filter((i) => i.categoryId === filters.categoryId)
        }
        if (filters?.dateStart) {
            const dateStart = filters.dateStart
            result = result.filter((i) => i.storageDate >= dateStart)
        }
        if (filters?.dateEnd) {
            const dateEnd = filters.dateEnd
            result = result.filter((i) => i.storageDate <= dateEnd)
        }

        return result.sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        )
    }

    async getById(id: string): Promise<ItemVO | null> {
        return loadItems().find((i) => i.id === id) ?? null
    }
}
