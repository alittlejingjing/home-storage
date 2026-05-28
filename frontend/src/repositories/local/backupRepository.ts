import type { IBackupRepository } from '../types'
import type { BackupData, BackupImportMode, BackupValidationResult, ImportResult } from '@/types/backup'

const ITEMS_KEY = 'jiaxiang-items'
const CABINETS_KEY = 'jiaxiang-cabinets'
const CATEGORIES_KEY = 'jiaxiang-categories'
const ITEM_PHOTO_PREFIX = 'jiaxiang-photo-'
const CABINET_PHOTO_PREFIX = 'jiaxiang-cabinet-photo-'

function loadItems() {
    try {
        const raw = localStorage.getItem(ITEMS_KEY)
        if (raw) return JSON.parse(raw)
    } catch { /* ignore */ }
    return []
}

function saveItems(items: any[]) {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
}

function loadCabinets() {
    try {
        const raw = localStorage.getItem(CABINETS_KEY)
        if (raw) return JSON.parse(raw)
    } catch { /* ignore */ }
    return []
}

function saveCabinets(cabinets: any[]) {
    localStorage.setItem(CABINETS_KEY, JSON.stringify(cabinets))
}

function loadCategories() {
    try {
        const raw = localStorage.getItem(CATEGORIES_KEY)
        if (raw) return JSON.parse(raw)
    } catch { /* ignore */ }
    return []
}

function saveCategories(categories: any[]) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
}

function getPhotoFromStorage(itemId: string, index: number): string | null {
    try {
        return localStorage.getItem(`${ITEM_PHOTO_PREFIX}${itemId}-${index}`)
    } catch {
        return null
    }
}

function getCabinetPhotoFromStorage(cabinetId: string, index: number): string | null {
    try {
        return localStorage.getItem(`${CABINET_PHOTO_PREFIX}${cabinetId}-${index}`)
    } catch {
        return null
    }
}

function clearPhotos() {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith(ITEM_PHOTO_PREFIX) || key.startsWith(CABINET_PHOTO_PREFIX))) {
            keysToRemove.push(key)
        }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))
}

function restorePhotos(itemPhotos: Record<string, string[]>, cabinetPhotos: Record<string, string[]>) {
    if (itemPhotos) {
        for (const [itemId, photos] of Object.entries(itemPhotos)) {
            photos.forEach((photo, index) => {
                localStorage.setItem(`${ITEM_PHOTO_PREFIX}${itemId}-${index}`, photo)
            })
        }
    }
    if (cabinetPhotos) {
        for (const [cabId, photos] of Object.entries(cabinetPhotos)) {
            photos.forEach((photo, index) => {
                localStorage.setItem(`${CABINET_PHOTO_PREFIX}${cabId}-${index}`, photo)
            })
        }
    }
}

export class LocalBackupRepository implements IBackupRepository {
    async exportAll(): Promise<{ blob: Blob; filename: string }> {
        const items = loadItems()
        const cabinets = loadCabinets()
        const categories = loadCategories()

        // 收集照片数据
        const itemPhotos: Record<string, string[]> = {}
        for (const item of items) {
            const photos: string[] = []
            for (let i = 0; i < (item.photos?.length ?? 0); i++) {
                const photo = getPhotoFromStorage(item.id, i)
                if (photo) {
                    photos.push(photo)
                } else if (item.photos[i]?.startsWith('data:')) {
                    photos.push(item.photos[i])
                }
            }
            if (photos.length > 0) itemPhotos[item.id] = photos
        }

        const cabinetPhotos: Record<string, string[]> = {}
        for (const cab of cabinets) {
            const photos: string[] = []
            for (let i = 0; i < (cab.photos?.length ?? 0); i++) {
                const photo = getCabinetPhotoFromStorage(cab.id, i)
                if (photo) {
                    photos.push(photo)
                } else if (cab.photos[i]?.startsWith('data:')) {
                    photos.push(cab.photos[i])
                }
            }
            if (photos.length > 0) cabinetPhotos[cab.id] = photos
        }

        const backupData: BackupData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            items,
            cabinets,
            categories,
            itemPhotos,
            cabinetPhotos,
        }

        const jsonStr = JSON.stringify(backupData, null, 2)
        const blob = new Blob([jsonStr], { type: 'application/json' })

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
        const filename = `家享收纳备份_${timestamp}.json`

        return { blob, filename }
    }

    validateBackup(data: unknown): BackupValidationResult {
        if (!data || typeof data !== 'object') {
            return { valid: false, error: '备份文件格式错误：无效的 JSON 对象' }
        }
        const d = data as any
        if (!d.version || typeof d.version !== 'string') {
            return { valid: false, error: '备份文件格式错误：缺少 version 字段' }
        }
        if (!d.items || !Array.isArray(d.items)) {
            return { valid: false, error: '备份文件格式错误：缺少必要的 items 字段' }
        }
        if (!d.cabinets || !Array.isArray(d.cabinets)) {
            return { valid: false, error: '备份文件格式错误：缺少必要的 cabinets 字段' }
        }
        if (!d.categories || !Array.isArray(d.categories)) {
            return { valid: false, error: '备份文件格式错误：缺少必要的 categories 字段' }
        }
        return { valid: true }
    }

    async importAll(file: File, mode: BackupImportMode): Promise<ImportResult> {
        const text = await file.text()
        const data = JSON.parse(text) as BackupData

        // 覆盖模式：先清空
        if (mode === 'OVERWRITE') {
            saveItems([])
            saveCabinets([])
            saveCategories([])
            clearPhotos()
        }

        // 导入分类（UPSERT：id 存在则更新，不存在则追加）
        const currentCategories = loadCategories()
        for (const cat of data.categories) {
            if (!cat.id || !cat.name) continue
            const idx = currentCategories.findIndex((c: any) => c.id === cat.id)
            if (idx >= 0) {
                currentCategories[idx] = { ...currentCategories[idx], ...cat }
            } else {
                currentCategories.push(cat)
            }
        }
        saveCategories(currentCategories)

        // 导入储物柜（UPSERT）
        const currentCabinets = loadCabinets()
        for (const cab of data.cabinets) {
            if (!cab.id || !cab.name) continue
            const idx = currentCabinets.findIndex((c: any) => c.id === cab.id)
            if (idx >= 0) {
                currentCabinets[idx] = { ...currentCabinets[idx], ...cab }
            } else {
                currentCabinets.push(cab)
            }
        }
        saveCabinets(currentCabinets)

        // 导入物品（UPSERT）
        const currentItems = loadItems()
        for (const item of data.items) {
            if (!item.id || !item.name) continue
            const idx = currentItems.findIndex((i: any) => i.id === item.id)
            if (idx >= 0) {
                currentItems[idx] = { ...currentItems[idx], ...item }
            } else {
                currentItems.push(item)
            }
        }
        saveItems(currentItems)

        // 恢复照片
        restorePhotos(data.itemPhotos ?? {}, data.cabinetPhotos ?? {})

        return {
            items: data.items.length,
            cabinets: data.cabinets.length,
            categories: data.categories.length,
        }
    }
}
