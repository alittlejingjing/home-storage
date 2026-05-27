import type { ICabinetRepository, IItemRepository } from '../types'
import type {
    Cabinet,
    CabinetVO,
    CabinetFilters,
    CabinetCreateInput,
} from '@/types/cabinet'
import type { ItemBrief } from '@/types/item'
import { generateUniqueId } from '../utils/generateId'

const CABINETS_KEY = 'jiaxiang-cabinets'

function loadCabinets(): Cabinet[] {
    try {
        const raw = localStorage.getItem(CABINETS_KEY)
        if (raw) return JSON.parse(raw)
    } catch {
        /* ignore */
    }
    return getMockCabinets()
}

function saveCabinets(cabinets: Cabinet[]) {
    localStorage.setItem(CABINETS_KEY, JSON.stringify(cabinets))
}

function getMockCabinets(): Cabinet[] {
    return [
        {
            id: 'cab-1',
            name: '主卧衣柜',
            photos: [],
            location: '主卧进门右侧，三层分区',
            createdAt: '2025-01-01T08:00:00.000Z',
        },
        {
            id: 'cab-2',
            name: '阳台工具箱',
            photos: [],
            location: '阳台右侧置物架第二层',
            createdAt: '2025-01-05T10:00:00.000Z',
        },
        {
            id: 'cab-3',
            name: '厨房储物柜',
            photos: [],
            location: '厨房吊柜左侧',
            createdAt: '2025-02-10T14:00:00.000Z',
        },
        {
            id: 'cab-4',
            name: '书房文件柜',
            photos: [],
            location: '书房书桌下方抽屉柜',
            createdAt: '2025-01-20T09:00:00.000Z',
        },
        {
            id: 'cab-5',
            name: '客厅杂物柜',
            photos: [],
            location: '客厅电视柜旁立柜',
            createdAt: '2025-03-01T11:00:00.000Z',
        },
        {
            id: 'cab-6',
            name: '次卧衣柜',
            photos: [],
            location: '次卧靠窗一侧',
            createdAt: '2025-04-15T16:00:00.000Z',
        },
    ]
}

async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

function compressImage(
    base64: string,
    maxWidth = 1280,
    quality = 0.8,
): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
            const canvas = document.createElement('canvas')
            const ratio = Math.min(maxWidth / img.width, 1)
            canvas.width = img.width * ratio
            canvas.height = img.height * ratio
            const ctx = canvas.getContext('2d')
            if (!ctx) {
                resolve(base64)
                return
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            resolve(canvas.toDataURL('image/jpeg', quality))
        }
        img.onerror = reject
        img.src = base64
    })
}

export class LocalCabinetRepository implements ICabinetRepository {
    private itemRepo: IItemRepository

    constructor(itemRepo: IItemRepository) {
        this.itemRepo = itemRepo
    }

    async list(filters?: CabinetFilters): Promise<CabinetVO[]> {
        let result = loadCabinets()

        if (filters?.keyword?.trim()) {
            const k = filters.keyword.trim().toLowerCase()
            result = result.filter(
                (c) =>
                    c.name.toLowerCase().includes(k) ||
                    c.location.toLowerCase().includes(k),
            )
        }
        if (filters?.dateStart) {
            result = result.filter((c) => c.createdAt >= filters.dateStart!)
        }
        if (filters?.dateEnd) {
            result = result.filter((c) => c.createdAt <= filters.dateEnd!)
        }

        const items = await this.itemRepo.list()
        const countMap: Record<string, number> = {}
        items.forEach((i) => {
            countMap[i.cabinetId] = (countMap[i.cabinetId] || 0) + 1
        })

        return result
            .map((c) => ({ ...c, itemCount: countMap[c.id] || 0 }))
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
            )
    }

    async getById(id: string): Promise<CabinetVO | null> {
        const cabinet = loadCabinets().find((c) => c.id === id)
        if (!cabinet) return null
        const items = await this.itemRepo.list()
        const itemCount = items.filter((i) => i.cabinetId === id).length
        return { ...cabinet, itemCount }
    }

    async create(dto: CabinetCreateInput): Promise<Cabinet> {
        const name = dto.name.trim()
        if (!name || name.length < 2 || name.length > 30) {
            throw new Error('储物柜名称需在2-30个字符之间')
        }
        const cabinets = loadCabinets()
        const dup = cabinets.find(
            (c) => c.name.trim().toLowerCase() === name.toLowerCase(),
        )
        if (dup) {
            throw new Error('已存在同名储物柜，请更换名称')
        }
        const newCabinet: Cabinet = {
            ...dto,
            name,
            id: generateUniqueId('cab'),
            createdAt: new Date().toISOString(),
        }
        cabinets.unshift(newCabinet)
        saveCabinets(cabinets)
        return newCabinet
    }

    async update(
        id: string,
        dto: Partial<CabinetCreateInput>,
    ): Promise<Cabinet | null> {
        const cabinets = loadCabinets()
        const idx = cabinets.findIndex((c) => c.id === id)
        if (idx < 0) return null

        if (dto.name !== undefined) {
            const name = dto.name.trim()
            if (!name || name.length < 2 || name.length > 30) {
                throw new Error('储物柜名称需在2-30个字符之间')
            }
            const dup = cabinets.find(
                (c, i) =>
                    i !== idx &&
                    c.name.trim().toLowerCase() === name.toLowerCase(),
            )
            if (dup) {
                throw new Error('已存在同名储物柜，请更换名称')
            }
        }

        const updated: Cabinet = {
            ...cabinets[idx],
            ...dto,
            name: dto.name !== undefined ? dto.name.trim() : cabinets[idx].name,
        }
        cabinets[idx] = updated
        saveCabinets(cabinets)
        return updated
    }

    async delete(id: string): Promise<boolean> {
        const items = await this.itemRepo.list()
        const hasItems = items.some((i) => i.cabinetId === id)
        if (hasItems) {
            throw new Error('该储物柜下还有物品，请先移出后再删除')
        }
        const cabinets = loadCabinets().filter((c) => c.id !== id)
        saveCabinets(cabinets)
        return true
    }

    async listItemsInCabinet(cabinetId: string): Promise<ItemBrief[]> {
        const items = await this.itemRepo.list()
        return items
            .filter((i) => i.cabinetId === cabinetId)
            .map((i) => ({
                id: i.id,
                name: i.name,
                categoryId: i.categoryId,
                cabinetId: i.cabinetId,
                storageDate: i.storageDate,
                photo: i.photos?.[0],
            }))
            .sort(
                (a, b) =>
                    new Date(b.storageDate).getTime() -
                    new Date(a.storageDate).getTime(),
            )
    }

    async uploadPhoto(id: string, file: File): Promise<string> {
        const base64 = await fileToBase64(file)
        const compressed = await compressImage(base64)
        const cabinets = loadCabinets()
        const idx = cabinets.findIndex((c) => c.id === id)
        if (idx < 0) throw new Error('储物柜不存在')
        if (cabinets[idx].photos.length >= 3) {
            throw new Error('最多上传3张照片')
        }
        cabinets[idx].photos.push(compressed)
        saveCabinets(cabinets)
        return compressed
    }

    async deletePhoto(id: string, index: number): Promise<boolean> {
        const cabinets = loadCabinets()
        const idx = cabinets.findIndex((c) => c.id === id)
        if (idx < 0) return false
        if (index < 0 || index >= cabinets[idx].photos.length) return false
        cabinets[idx].photos.splice(index, 1)
        saveCabinets(cabinets)
        return true
    }
}
