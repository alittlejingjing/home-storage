import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LocalCabinetRepository } from '@/repositories/local/cabinetRepository'
import { LocalItemRepository } from '@/repositories/local/itemRepository'
import type { ICabinetRepository } from '@/repositories/types'
import type { Cabinet } from '@/types/cabinet'
import type { ItemBrief } from '@/types/item'
import { useItemsStore } from './items'

function getRepository(): ICabinetRepository {
    return new LocalCabinetRepository(new LocalItemRepository())
}

const STORAGE_KEY = 'jiaxiang-cabinets'

/** 与 repository 保持一致的 mock 数据，避免表单校验与持久化层数据源不一致 */
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

function readStorageCabinets(): Cabinet[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) return JSON.parse(raw)
    } catch {
        /* ignore */
    }
    return getMockCabinets()
}

function loadFromStorage(): Cabinet[] {
    return readStorageCabinets()
}

export const useCabinetsStore = defineStore('cabinets', () => {
    const cabinets = ref<Cabinet[]>(loadFromStorage())
    const repo = getRepository()

    const totalCount = computed(() => cabinets.value.length)

    const filteredCabinets = computed(() => {
        return (keyword?: string, startDate?: string, endDate?: string) => {
            let result = [...cabinets.value]
            if (keyword?.trim()) {
                const k = keyword.trim().toLowerCase()
                result = result.filter(
                    (c) =>
                        c.name.toLowerCase().includes(k) ||
                        c.location.toLowerCase().includes(k),
                )
            }
            if (startDate) {
                result = result.filter((c) => c.createdAt >= startDate)
            }
            if (endDate) {
                result = result.filter((c) => c.createdAt <= endDate)
            }
            return result.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
            )
        }
    })

    const cabinetById = computed(() => {
        return (id: string) => cabinets.value.find((c) => c.id === id)
    })

    const cabinetsWithItemCount = computed(() => {
        const itemsStore = useItemsStore()
        return cabinets.value
            .map((c) => ({
                ...c,
                itemCount: itemsStore.items.filter((i) => i.cabinetId === c.id)
                    .length,
            }))
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
            )
    })

    async function addCabinet(cabinet: Omit<Cabinet, 'id' | 'createdAt'>) {
        const created = await repo.create(cabinet)
        // repository 已写入 localStorage，重新读取完整列表避免覆盖 mock 数据
        cabinets.value = readStorageCabinets()
        return created
    }

    async function updateCabinet(id: string, updates: Partial<Cabinet>) {
        const updated = await repo.update(id, updates)
        if (updated) {
            cabinets.value = readStorageCabinets()
            return true
        }
        return false
    }

    async function deleteCabinet(id: string) {
        const ok = await repo.delete(id)
        if (ok) {
            cabinets.value = readStorageCabinets()
        }
        return ok
    }

    async function getCabinetDetail(id: string) {
        return repo.getById(id)
    }

    async function listItemsInCabinet(cabinetId: string): Promise<ItemBrief[]> {
        return repo.listItemsInCabinet(cabinetId)
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
        getCabinetDetail,
        listItemsInCabinet,
    }
})
