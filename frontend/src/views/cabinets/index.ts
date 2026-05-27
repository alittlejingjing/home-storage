import { ref, computed, watch } from 'vue'
import { useCabinetsStore } from '@/stores/cabinets'

const PAGE_SIZE = 20
const DEBOUNCE_MS = 300

export function useCabinetList() {
    const cabinetsStore = useCabinetsStore()

    const keyword = ref('')
    const dateRange = ref<[string, string] | null>(null)
    const page = ref(1)
    const loading = ref(false)
    const noMore = ref(false)

    const formattedDateStart = computed(() => dateRange.value?.[0] ?? undefined)
    const formattedDateEnd = computed(() => dateRange.value?.[1] ?? undefined)

    const allFiltered = computed(() => {
        return cabinetsStore.filteredCabinets(
            keyword.value,
            formattedDateStart.value,
            formattedDateEnd.value,
        )
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

    watch(dateRange, () => {
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

    function onScroll(e: Event) {
        const el = e.target as HTMLElement
        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
        if (nearBottom) {
            loadMore()
        }
    }

    return {
        keyword,
        dateRange,
        page,
        loading,
        noMore,
        displayItems,
        total,
        loadMore,
        onScroll,
    }
}
