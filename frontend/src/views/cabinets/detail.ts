import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCabinetsStore } from '@/stores/cabinets'
import type { CabinetVO } from '@/types/cabinet'
import type { ItemBrief } from '@/types/item'

export function useCabinetDetail() {
    const route = useRoute()
    const router = useRouter()
    const cabinetsStore = useCabinetsStore()

    const cabinetId = computed(() => route.params.id as string)
    const cabinet = ref<CabinetVO | null>(null)
    const cabinetItems = ref<ItemBrief[]>([])
    const loading = ref(false)

    const hasItems = computed(() => cabinetItems.value.length > 0)
    const canDelete = computed(() => !hasItems.value)

    async function loadCabinet() {
        loading.value = true
        try {
            const detail = await cabinetsStore.getCabinetDetail(cabinetId.value)
            cabinet.value = detail
            if (detail) {
                cabinetItems.value = await cabinetsStore.listItemsInCabinet(
                    cabinetId.value,
                )
            }
        } finally {
            loading.value = false
        }
    }

    function goEdit() {
        router.push(`/cabinets/${cabinetId.value}/edit`)
    }

    function goItemDetail(itemId: string) {
        router.push(`/items/${itemId}`)
    }

    function goBack() {
        router.push('/cabinets')
    }

    async function confirmDelete() {
        if (!cabinet.value) return
        if (!canDelete.value) {
            ElMessage.warning('该储物柜还有物品，请先移出后再删除')
            return
        }
        try {
            await ElMessageBox.confirm(
                `确定删除储物柜「${cabinet.value.name}」？删除后无法恢复。`,
                '确认删除',
                {
                    confirmButtonText: '删除',
                    cancelButtonText: '取消',
                    type: 'warning',
                },
            )
            await cabinetsStore.deleteCabinet(cabinetId.value)
            ElMessage.success('删除成功')
            router.push('/cabinets')
        } catch {
            // 用户取消
        }
    }

    function formatDate(iso: string) {
        if (!iso) return ''
        const d = new Date(iso)
        if (isNaN(d.getTime())) return iso
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
    }

    function formatDateTime(iso: string) {
        if (!iso) return ''
        const d = new Date(iso)
        if (isNaN(d.getTime())) return iso
        const date = formatDate(iso)
        const h = String(d.getHours()).padStart(2, '0')
        const min = String(d.getMinutes()).padStart(2, '0')
        return `${date} ${h}:${min}`
    }

    onMounted(() => {
        loadCabinet()
    })

    return {
        cabinet,
        cabinetItems,
        loading,
        hasItems,
        canDelete,
        goEdit,
        goItemDetail,
        goBack,
        confirmDelete,
        formatDate,
        formatDateTime,
    }
}
