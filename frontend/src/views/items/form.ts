import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import { useCategoriesStore } from '@/stores/categories'
import { useCabinetsStore } from '@/stores/cabinets'
import { compressPhoto } from '@/repositories/utils/photoCompress'
import type { ItemVO } from '@/types/item'

const NAME_MIN = 2
const NAME_MAX = 50
const NOTE_MAX = 200
const MAX_PHOTOS = 3

export interface ItemFormState {
    name: string
    categoryId: string
    photos: string[]
    storageDate: string
    cabinetId: string
    note: string
}

export function useItemForm() {
    const route = useRoute()
    const itemsStore = useItemsStore()
    const categoriesStore = useCategoriesStore()
    const cabinetsStore = useCabinetsStore()

    const itemId = computed(() => {
        const id = route.params.id as string
        return id || ''
    })
    const isEdit = computed(() => !!itemId.value)

    const todayStr = () => {
        const d = new Date()
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }

    const draft = ref<ItemFormState>({
        name: '',
        categoryId: '',
        photos: [],
        storageDate: todayStr(),
        cabinetId: '',
        note: '',
    })

    // 原始数据快照，用于脏检查
    const originalSnapshot = ref('')
    const isDirty = computed(
        () => JSON.stringify(draft.value) !== originalSnapshot.value,
    )

    const nameError = ref('')

    function validateName(): boolean {
        const n = draft.value.name.trim()
        if (!n) {
            nameError.value = '物品名称不能为空'
            return false
        }
        if (n.length < NAME_MIN || n.length > NAME_MAX) {
            nameError.value = `物品名称需 ${NAME_MIN}-${NAME_MAX} 个字符`
            return false
        }
        nameError.value = ''
        return true
    }

    function validate(): string | null {
        if (!validateName()) return nameError.value
        if (!draft.value.categoryId) return '请选择分类'
        if (!draft.value.cabinetId) return '请选择储物柜'
        if (!draft.value.storageDate) return '请选择存放日期'
        return null
    }

    async function handleUpload(file: File): Promise<string | null> {
        if (draft.value.photos.length >= MAX_PHOTOS) return null
        try {
            const base64 = await compressPhoto(file)
            return base64
        } catch {
            return null
        }
    }

    function removePhoto(index: number) {
        draft.value.photos.splice(index, 1)
    }

    function buildPayload(): Omit<ItemVO, 'id' | 'createdAt'> {
        return {
            name: draft.value.name.trim(),
            categoryId: draft.value.categoryId,
            photos: [...draft.value.photos],
            storageDate: draft.value.storageDate,
            cabinetId: draft.value.cabinetId,
            note: draft.value.note.trim(),
        }
    }

    // 加载编辑数据
    function loadEditData() {
        if (!isEdit.value) return
        const item = itemsStore.itemById(itemId.value)
        if (item) {
            draft.value = {
                name: item.name,
                categoryId: item.categoryId,
                photos: [...item.photos],
                storageDate: item.storageDate,
                cabinetId: item.cabinetId,
                note: item.note,
            }
            nextTick(() => {
                originalSnapshot.value = JSON.stringify(draft.value)
            })
        }
    }

    // 重置表单
    function resetForm() {
        draft.value = {
            name: '',
            categoryId: '',
            photos: [],
            storageDate: todayStr(),
            cabinetId: '',
            note: '',
        }
        nameError.value = ''
        originalSnapshot.value = JSON.stringify(draft.value)
    }

    onMounted(() => {
        if (isEdit.value) {
            loadEditData()
        } else {
            nextTick(() => {
                originalSnapshot.value = JSON.stringify(draft.value)
            })
        }
    })

    // 当 route 变化时重新加载（同一个组件复用）
    watch(itemId, () => {
        if (isEdit.value) {
            loadEditData()
        } else {
            resetForm()
        }
    })

    return {
        draft,
        isEdit,
        itemId,
        isDirty,
        nameError,
        validate,
        validateName,
        handleUpload,
        removePhoto,
        buildPayload,
        loadEditData,
        resetForm,
        categoriesOptions: computed(() => categoriesStore.sortedCategories),
        cabinetsOptions: computed(() => cabinetsStore.cabinetsWithItemCount),
    }
}
