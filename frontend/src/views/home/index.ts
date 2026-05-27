/**
 * @file index.ts
 * @version 1.0.0
 * @author wuwg <wuwg@thunisoft.com>
 * @createTime 2026-05-27
 * @copyright thunisoft fd
 * @see [jsDoc中文文档]{@link http://www.dba.cn/book/jsdoc/JSDOCKuaiBiaoQianBLOCKTAGS/CONSTRUCTS.html}
 * @description 首页 composable：仪表盘聚合、下拉刷新、路由跳转
 * @updateTime 2026-05-27
 */

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Component } from 'vue'
import {
    Box,
    Goods,
    ShoppingBag,
    Tools,
    FirstAidKit,
    Document,
} from '@element-plus/icons-vue'
import { useItemsStore } from '@/stores/items'
import { useCabinetsStore } from '@/stores/cabinets'
import { useCategoriesStore } from '@/stores/categories'
import type { DashboardVO } from '@/types/dashboard'

const PULL_THRESHOLD = 80
const REFRESH_DURATION = 1200

/**
 * 预设分类图标（Element Plus）
 */
const categoryIconMap: Record<string, Component> = {
    'cat-1': Goods,
    'cat-2': ShoppingBag,
    'cat-3': Tools,
    'cat-4': FirstAidKit,
    'cat-5': Document,
}

/**
 * 暖色分类卡片色调索引（无紫色）
 */
const warmToneCount = 6

/**
 * 首页仪表盘逻辑
 * V2 可将 buildDashboard 替换为 dashboardRepository.getDashboard()
 */
export function useHomeDashboard() {
    const router = useRouter()
    const itemsStore = useItemsStore()
    const cabinetsStore = useCabinetsStore()
    const categoriesStore = useCategoriesStore()

    const refreshTick = ref(0)
    const pullState = ref<'idle' | 'pulling' | 'refreshing'>('idle')
    const pullDistance = ref(0)
    const startY = ref(0)

    const customDialogOpen = ref(false)
    const newCategoryName = ref('')

    function getCategoryIcon(categoryId: string): Component {
        return categoryIconMap[categoryId] || Box
    }

    function getCategoryToneIndex(categoryId: string): number {
        const hash = categoryId
            .split('')
            .reduce((a, c) => a + c.charCodeAt(0), 0)
        return hash % warmToneCount
    }

    function buildDashboard(): DashboardVO {
        void refreshTick.value

        const categoryStats = categoriesStore.categoriesWithCount.map((c) => ({
            categoryId: c.id,
            name: c.name,
            count: c.count,
        }))

        return {
            categoryStats,
            totalItems: itemsStore.items.length,
            totalCabinets: cabinetsStore.cabinets.length,
        }
    }

    const dashboard = computed(() => buildDashboard())

    const stats = computed(() => [
        {
            label: '物品',
            value: dashboard.value.totalItems,
            path: '/items',
        },
        {
            label: '储物柜',
            value: dashboard.value.totalCabinets,
            path: '/cabinets',
        },
        {
            label: '分类',
            value: categoriesStore.categories.length,
            path: '/categories',
        },
    ])

    const showPullIndicator = computed(() => pullState.value !== 'idle')
    const pullProgress = computed(() =>
        Math.min(pullDistance.value / PULL_THRESHOLD, 1),
    )

    function refreshDashboard() {
        return new Promise<void>((resolve) => {
            refreshTick.value += 1
            setTimeout(resolve, REFRESH_DURATION)
        })
    }

    function onTouchStart(e: TouchEvent) {
        if (window.scrollY > 0) {
            return
        }
        startY.value = e.touches[0].clientY
        pullState.value = 'pulling'
    }

    function onTouchMove(e: TouchEvent) {
        if (pullState.value !== 'pulling') {
            return
        }
        const diff = e.touches[0].clientY - startY.value
        if (diff > 0) {
            e.preventDefault()
            pullDistance.value = Math.min(diff * 0.5, PULL_THRESHOLD + 20)
        }
    }

    async function onTouchEnd() {
        if (pullState.value !== 'pulling') {
            return
        }
        if (pullDistance.value >= PULL_THRESHOLD) {
            pullState.value = 'refreshing'
            pullDistance.value = PULL_THRESHOLD
            await refreshDashboard()
            pullState.value = 'idle'
            pullDistance.value = 0
        } else {
            pullState.value = 'idle'
            pullDistance.value = 0
        }
    }

    function goToSearch() {
        router.push('/search')
    }

    function goToItems(categoryId?: string) {
        if (categoryId) {
            router.push({ path: '/items', query: { categoryId } })
        } else {
            router.push('/items')
        }
    }

    function goToPath(path: string) {
        router.push(path)
    }

    function openCustomCategoryDialog() {
        newCategoryName.value = ''
        customDialogOpen.value = true
    }

    function addCustomCategory() {
        const name = newCategoryName.value.trim()
        if (!name) {
            return
        }
        categoriesStore.addCategory(name)
        customDialogOpen.value = false
        newCategoryName.value = ''
        refreshTick.value += 1
    }

    return {
        dashboard,
        stats,
        pullState,
        pullDistance,
        showPullIndicator,
        pullProgress,
        customDialogOpen,
        newCategoryName,
        getCategoryIcon,
        getCategoryToneIndex,
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        goToSearch,
        goToItems,
        goToPath,
        openCustomCategoryDialog,
        addCustomCategory,
    }
}
