import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import { useCategoriesStore } from '@/stores/categories'
import { useCabinetsStore } from '@/stores/cabinets'
import type { ItemFilters } from '@/types/item'

const PAGE_SIZE = 20
const DEBOUNCE_MS = 300

export function useItemList() {
    const route = useRoute()
    const itemsStore = useItemsStore()
    const categoriesStore = useCategoriesStore()
    const cabinetsStore = useCabinetsStore()

    const keyword = ref('')
    const categoryId = ref('all')
    // Element Plus el-date-picker value-format="YYYY-MM-DD" 返回 string[]
    const dateRange = ref<[string, string] | null>(null)
    const page = ref(1)
    const loading = ref(false)
    const noMore = ref(false)

    const formattedDateStart = computed(() => {
        return dateRange.value?.[0] ?? undefined
    })

    const formattedDateEnd = computed(() => {
        return dateRange.value?.[1] ?? undefined
    })

    const filters = computed<ItemFilters>(() => ({
        keyword: keyword.value,
        categoryId: categoryId.value,
        dateStart: formattedDateStart.value,
        dateEnd: formattedDateEnd.value,
    }))

    const allFiltered = computed(() => {
        return itemsStore.filteredItems(filters.value)
    })

    const displayItems = computed(() => {
        return allFiltered.value.slice(0, page.value * PAGE_SIZE)
    })

    const total = computed(() => allFiltered.value.length)

    // 防抖搜索
    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    watch(keyword, () => {
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
            resetPagination()
        }, DEBOUNCE_MS)
    })

    // 其他筛选条件变化时立即重置分页
    watch([categoryId, dateRange], () => {
        resetPagination()
    })

    function resetPagination() {
        page.value = 1
        noMore.value = false
    }

    function loadMore() {
        if (loading.value || noMore.value) return
        loading.value = true
        setTimeout(() => {
            page.value += 1
            if (displayItems.value.length >= total.value) {
                noMore.value = true
            }
            loading.value = false
        }, 200)
    }

    // 触底检测
    function onScroll(e: Event) {
        const el = e.target as HTMLElement
        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
        if (nearBottom) {
            loadMore()
        }
    }

    function getCategoryName(categoryId: string) {
        return categoriesStore.categoryById(categoryId)?.name ?? '未分类'
    }

    function getCabinetName(cabinetId: string) {
        return cabinetsStore.cabinetById(cabinetId)?.name ?? '未知储物柜'
    }

    onMounted(() => {
        const qCategory = route.query.categoryId as string
        if (qCategory) {
            categoryId.value = qCategory
        }
    })

    return {
        keyword,
        categoryId,
        dateRange,
        page,
        loading,
        noMore,
        displayItems,
        total,
        loadMore,
        onScroll,
        getCategoryName,
        getCabinetName,
        categoriesOptions: computed(() => categoriesStore.sortedCategories),
    }
}
