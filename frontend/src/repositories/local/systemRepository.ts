import type { ISystemRepository } from '../types'

const ITEMS_KEY = 'jiaxiang-items'
const CABINETS_KEY = 'jiaxiang-cabinets'
const CATEGORIES_KEY = 'jiaxiang-categories'
const PHOTO_PREFIX = 'jiaxiang-photo-'
const CABINET_PHOTO_PREFIX = 'jiaxiang-cabinet-photo-'
const AUTH_KEY = 'jiaxiang-auth'
const CONFIG_KEY = 'jiaxiang-config'
const DB_NAME = 'jiaxiang-db'

function getCount(key: string): number {
    try {
        const raw = localStorage.getItem(key)
        if (raw) {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) return parsed.length
        }
    } catch {
        /* ignore */
    }
    return 0
}

export class LocalSystemRepository implements ISystemRepository {
    async getStats(): Promise<{ totalItems: number; totalCabinets: number; totalCategories: number }> {
        return {
            totalItems: getCount(ITEMS_KEY),
            totalCabinets: getCount(CABINETS_KEY),
            totalCategories: getCount(CATEGORIES_KEY),
        }
    }

    async clearCache(): Promise<void> {
        // 清除所有 jiaxiang-* 前缀的 localStorage key
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith('jiaxiang-')) {
                keysToRemove.push(key)
            }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key))

        // 清除 IndexedDB 照片数据库
        try {
            await new Promise<void>((resolve, reject) => {
                const req = indexedDB.deleteDatabase(DB_NAME)
                req.onsuccess = () => resolve()
                req.onerror = () => reject(req.error)
                req.onblocked = () => resolve()
            })
        } catch {
            window.console.warn('清除 IndexedDB 失败:', DB_NAME)
        }
    }
}
