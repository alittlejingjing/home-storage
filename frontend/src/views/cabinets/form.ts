import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useCabinetsStore } from '@/stores/cabinets'
import { compressPhoto } from '@/repositories/utils/photoCompress'
import type { Cabinet } from '@/types/cabinet'

const NAME_MIN = 2
const NAME_MAX = 30
const MAX_PHOTOS = 3

export interface CabinetFormState {
    name: string
    photos: string[]
    location: string
}

export function useCabinetForm() {
    const route = useRoute()
    const cabinetsStore = useCabinetsStore()

    const cabinetId = computed(() => {
        const id = route.params.id as string
        return id || ''
    })
    const isEdit = computed(() => !!cabinetId.value)

    const draft = ref<CabinetFormState>({
        name: '',
        photos: [],
        location: '',
    })

    const originalSnapshot = ref('')
    const isDirty = computed(
        () => JSON.stringify(draft.value) !== originalSnapshot.value,
    )

    const nameError = ref('')

    function validateName(): boolean {
        const n = draft.value.name.trim()
        if (!n) {
            nameError.value = '储物柜名称不能为空'
            return false
        }
        if (n.length < NAME_MIN || n.length > NAME_MAX) {
            nameError.value = `储物柜名称需 ${NAME_MIN}-${NAME_MAX} 个字符`
            return false
        }
        // 唯一性校验（编辑时排除自身）
        const duplicate = cabinetsStore.cabinets.find(
            (c) =>
                c.name.trim().toLowerCase() === n.toLowerCase() &&
                c.id !== cabinetId.value,
        )
        if (duplicate) {
            nameError.value = '已存在同名储物柜，请更换名称'
            return false
        }
        nameError.value = ''
        return true
    }

    function validate(): string | null {
        if (!validateName()) return nameError.value
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

    function buildPayload(): Omit<Cabinet, 'id' | 'createdAt'> {
        return {
            name: draft.value.name.trim(),
            photos: [...draft.value.photos],
            location: draft.value.location.trim(),
        }
    }

    function loadEditData() {
        if (!isEdit.value) return
        const cabinet = cabinetsStore.cabinetById(cabinetId.value)
        if (cabinet) {
            draft.value = {
                name: cabinet.name,
                photos: [...cabinet.photos],
                location: cabinet.location,
            }
            nextTick(() => {
                originalSnapshot.value = JSON.stringify(draft.value)
            })
        }
    }

    function resetForm() {
        draft.value = {
            name: '',
            photos: [],
            location: '',
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

    watch(cabinetId, () => {
        if (isEdit.value) {
            loadEditData()
        } else {
            resetForm()
        }
    })

    return {
        draft,
        isEdit,
        cabinetId,
        isDirty,
        nameError,
        validate,
        validateName,
        handleUpload,
        removePhoto,
        buildPayload,
        loadEditData,
        resetForm,
    }
}
