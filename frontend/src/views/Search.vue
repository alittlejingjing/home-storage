<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import { useCabinetsStore } from '@/stores/cabinets'
import { useCategoriesStore } from '@/stores/categories'
import { ElMessage } from 'element-plus'
import {
    Search,
    Close,
    Box,
    OfficeBuilding,
} from '@element-plus/icons-vue'

const router = useRouter()
const itemsStore = useItemsStore()
const cabinetsStore = useCabinetsStore()
const categoriesStore = useCategoriesStore()

const searchKeyword = ref('')
const activeTab = ref('items')
let debounceTimer: ReturnType<typeof setTimeout> | null = null
const debouncedKeyword = ref('')

watch(searchKeyword, () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
        debouncedKeyword.value = searchKeyword.value
    }, 300)
})

function clearSearch() {
    searchKeyword.value = ''
    debouncedKeyword.value = ''
}

// 温暖有机配色 —— 与分类管理页统一
const warmOrganicPalette: Record<string, string> = {
    'cat-1': '#d4a373',  // 暖琥珀
    'cat-2': '#d2847a',  // 陶土
    'cat-3': '#8cb369',  // 鼠尾草
    'cat-4': '#5da8a0',  // 青灰
    'cat-5': '#8fa6cb',  // 尘蓝
}

function getCategoryColor(categoryId: string): string {
    if (warmOrganicPalette[categoryId]) return warmOrganicPalette[categoryId]
    const colors = ['#d4a373', '#d2847a', '#8cb369', '#5da8a0', '#8fa6cb', '#c49ac8', '#d4b26a', '#7ab8a0']
    const hash = categoryId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    return colors[hash % colors.length]
}

// 物品搜索结果（无关键词时展示全部）
const itemResults = computed(() => {
    if (!debouncedKeyword.value.trim()) {
        return itemsStore.filteredItems()
    }
    return itemsStore.filteredItems({ keyword: debouncedKeyword.value.trim() })
})

// 储物柜搜索结果（无关键词时展示全部）
const cabinetResults = computed(() => {
    if (!debouncedKeyword.value.trim()) {
        return cabinetsStore.filteredCabinets()
    }
    return cabinetsStore.filteredCabinets(debouncedKeyword.value.trim())
})

function goToItemDetail(id: string) {
    router.push(`/items/${id}`)
}

function goToCabinetDetail(id: string) {
    router.push(`/cabinets/${id}`)
}

function getCategoryName(categoryId: string) {
    return categoriesStore.categoryById(categoryId)?.name || '未分类'
}

function getCabinetName(cabinetId: string) {
    return cabinetsStore.cabinetById(cabinetId)?.name || '未知储物柜'
}

const hasItemResults = computed(() => itemResults.value.length > 0)
const hasCabinetResults = computed(() => cabinetResults.value.length > 0)
const showItemEmpty = computed(
    () => debouncedKeyword.value.trim().length > 0 && !hasItemResults.value,
)
const showCabinetEmpty = computed(
    () => debouncedKeyword.value.trim().length > 0 && !hasCabinetResults.value,
)
</script>

<template>
    <div class="fd-search">
        <!-- 搜索输入框 -->
        <div class="fd-search__input-card">
            <div class="fd-search__input-accent" aria-hidden="true" />
            <div class="fd-search__input-body">
                <el-icon :size="18" class="fd-search__input-icon">
                    <Search />
                </el-icon>
                <el-input v-model="searchKeyword" class="fd-search__input" placeholder="搜索物品、储物柜..." clearable
                    @clear="clearSearch" />
            </div>
        </div>

        <!-- Tab 切换 -->
        <el-tabs v-model="activeTab" class="fd-search__tabs">
            <el-tab-pane label="物品" name="items">
                <div class="fd-search__results">
                    <!-- 物品结果列表 -->
                    <div v-if="hasItemResults" class="fd-search__list">
                        <div v-for="item in itemResults" :key="item.id" class="fd-search__card"
                            @click="goToItemDetail(item.id)">
                            <div class="fd-search__card-accent"
                                :style="{ background: 'linear-gradient(90deg, #4a9e88, #9ed7c8)' }" />
                            <div class="fd-search__card-body">
                                <div class="fd-search__thumb">
                                    <img v-if="item.photos && item.photos.length > 0" :src="item.photos[0]"
                                        class="fd-search__thumb-img" alt="" />
                                    <el-icon v-else :size="22" color="#9ab0a7">
                                        <Box />
                                    </el-icon>
                                </div>
                                <div class="fd-search__info">
                                    <div class="fd-search__name-wrap">
                                        <span class="fd-search__name">{{ item.name }}</span>
                                        <span class="fd-search__tag"
                                            :style="{ backgroundColor: getCategoryColor(item.categoryId || '') + '18', color: getCategoryColor(item.categoryId || '') }">
                                            {{ getCategoryName(item.categoryId) }}
                                        </span>
                                    </div>
                                    <p class="fd-search__sub">
                                        {{ getCabinetName(item.cabinetId) }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 物品空状态 -->
                    <div v-else-if="showItemEmpty" class="fd-search__empty">
                        <div class="fd-search__empty-orb">
                            <el-icon :size="28" color="#9ed7c8">
                                <Search />
                            </el-icon>
                        </div>
                        <div class="fd-search__empty-title">未找到相关结果</div>
                        <div class="fd-search__empty-desc">换个关键词试试</div>
                    </div>
                    <div v-else class="fd-search__empty">
                        <div class="fd-search__empty-orb">
                            <el-icon :size="28" color="#9ed7c8">
                                <Box />
                            </el-icon>
                        </div>
                        <div class="fd-search__empty-title">暂无物品</div>
                        <div class="fd-search__empty-desc">快去添加第一件物品吧</div>
                    </div>
                </div>
            </el-tab-pane>

            <el-tab-pane label="储物柜" name="cabinets">
                <div class="fd-search__results">
                    <!-- 储物柜结果列表 -->
                    <div v-if="hasCabinetResults" class="fd-search__list">
                        <div v-for="cabinet in cabinetResults" :key="cabinet.id" class="fd-search__card"
                            @click="goToCabinetDetail(cabinet.id)">
                            <div class="fd-search__card-accent"
                                :style="{ background: 'linear-gradient(90deg, #d4a373, #f5e6d3)' }" />
                            <div class="fd-search__card-body">
                                <div class="fd-search__thumb fd-search__thumb--cabinet">
                                    <el-icon :size="22" color="#d4a373">
                                        <OfficeBuilding />
                                    </el-icon>
                                </div>
                                <div class="fd-search__info">
                                    <span class="fd-search__name">{{ cabinet.name }}</span>
                                    <p class="fd-search__sub">
                                        {{ cabinet.location || '暂无位置描述' }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 储物柜空状态 -->
                    <div v-else-if="showCabinetEmpty" class="fd-search__empty">
                        <div class="fd-search__empty-orb">
                            <el-icon :size="28" color="#9ed7c8">
                                <Search />
                            </el-icon>
                        </div>
                        <div class="fd-search__empty-title">未找到相关结果</div>
                        <div class="fd-search__empty-desc">换个关键词试试</div>
                    </div>
                    <div v-else class="fd-search__empty">
                        <div class="fd-search__empty-orb">
                            <el-icon :size="28" color="#9ed7c8">
                                <OfficeBuilding />
                            </el-icon>
                        </div>
                        <div class="fd-search__empty-title">暂无储物柜</div>
                        <div class="fd-search__empty-desc">快去添加第一个储物柜吧</div>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<style lang="less" scoped>
/*
   fd-search — 全局搜索
   温暖有机｜蓝绿护眼｜与首页 fd-home 同频
   ----------------------------------------------------------- */

.fd-search {
    --search-bg: #f3f9f6;
    --search-ink: #2d4139;
    --search-ink-soft: #5f7d72;
    --search-ink-ghost: #8ca89e;
    --search-green: #4a9e88;
    --search-green-light: #9ed7c8;
    --search-green-pale: #d4ece6;
    --search-card-bg: rgba(255, 255, 255, 0.72);
    --search-card-border: rgba(74, 158, 136, 0.10);
    --search-card-shadow: 0 2px 8px rgba(45, 130, 110, 0.05);
    --search-card-hover-shadow: 0 6px 20px rgba(45, 130, 110, 0.10);

    position: relative;
    min-height: 100%;
    padding: 1rem 0.875rem 1.5rem;
    background: var(--search-bg);
    background-image:
        radial-gradient(circle at 12% 10%, rgba(158, 215, 200, 0.10) 0%, transparent 40%),
        radial-gradient(circle at 88% 90%, rgba(212, 236, 230, 0.25) 0%, transparent 45%);
    color: var(--search-ink);

    /* ---------- 搜索输入框 ---------- */
    &__input-card {
        position: relative;
        margin-bottom: 0.875rem;
        border: 1px solid rgba(74, 158, 136, 0.15);
        border-radius: 1rem;
        background: var(--search-card-bg);
        backdrop-filter: blur(14px) saturate(130%);
        box-shadow: var(--search-card-shadow);
        overflow: hidden;
        transition: box-shadow 0.25s ease, border-color 0.25s ease;

        &:hover {
            border-color: rgba(74, 158, 136, 0.25);
            box-shadow: var(--search-card-hover-shadow);
        }
    }

    &__input-accent {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        border-radius: 1rem 1rem 0 0;
        background: linear-gradient(90deg, var(--search-green), var(--search-green-light));
        opacity: 0.6;
    }

    &__input-body {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 0.875rem;
    }

    &__input-icon {
        color: var(--search-green);
        flex-shrink: 0;
    }

    &__input {
        flex: 1;

        :deep(.el-input__wrapper) {
            border-radius: 0.625rem;
            background: rgba(243, 249, 246, 0.6);
            box-shadow: inset 0 0 0 1px rgba(74, 158, 136, 0.1);
            transition: box-shadow 0.2s;
        }

        :deep(.el-input__inner) {
            font-size: 0.9375rem;
            color: var(--search-ink);

            &::placeholder {
                color: #aabfb7;
            }
        }

        :deep(.el-input__clear) {
            color: var(--search-ink-ghost);

            &:hover {
                color: var(--search-ink-soft);
            }
        }
    }

    /* ---------- 自定义 Tabs ---------- */
    :deep(.el-tabs__header) {
        margin-bottom: 0.75rem;
    }

    :deep(.el-tabs__nav-wrap::after) {
        height: 1px;
        background: rgba(74, 158, 136, 0.1);
    }

    :deep(.el-tabs__active-bar) {
        background: var(--search-green);
        height: 2.5px;
        border-radius: 2px;
    }

    :deep(.el-tabs__item) {
        font-size: 0.9375rem;
        font-weight: 500;
        color: var(--search-ink-ghost);
        padding: 0 1rem;
        transition: color 0.2s;

        &.is-active {
            color: var(--search-ink);
            font-weight: 600;
        }

        &:hover {
            color: var(--search-ink-soft);
        }
    }

    /* ---------- 结果列表 ---------- */
    &__results {
        padding-bottom: 0.5rem;
    }

    &__list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    &__card {
        position: relative;
        border: 1px solid var(--search-card-border);
        border-radius: 1rem;
        background: var(--search-card-bg);
        backdrop-filter: blur(10px);
        box-shadow: var(--search-card-shadow);
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.3s ease,
            border-color 0.3s ease;

        &:hover {
            transform: translateY(-2px);
            box-shadow: var(--search-card-hover-shadow);
            border-color: rgba(74, 158, 136, 0.18);
        }

        &:active {
            transform: translateY(0) scale(0.99);
        }
    }

    &__card-accent {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        opacity: 0.55;
        border-radius: 1rem 1rem 0 0;
        pointer-events: none;
    }

    &__card-body {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 0.875rem;
        padding: 0.875rem;
    }

    &__thumb {
        width: 3.25rem;
        height: 3.25rem;
        border-radius: 0.75rem;
        background: rgba(74, 158, 136, 0.06);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        overflow: hidden;

        &--cabinet {
            background: rgba(212, 163, 115, 0.1);
        }
    }

    &__thumb-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    &__info {
        flex: 1;
        min-width: 0;
    }

    &__name-wrap {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    &__name {
        font-size: 0.9375rem;
        font-weight: 500;
        color: var(--search-ink);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    &__tag {
        display: inline-block;
        padding: 0.125rem 0.5rem;
        border-radius: 999px;
        font-size: 0.6875rem;
        font-weight: 500;
        flex-shrink: 0;
    }

    &__sub {
        margin: 0.25rem 0 0;
        font-size: 0.75rem;
        color: var(--search-ink-ghost);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* ---------- 空状态 ---------- */
    &__empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 1rem;
    }

    &__empty-orb {
        width: 4rem;
        height: 4rem;
        border-radius: 50%;
        background: linear-gradient(135deg, #e8f4f1, #d4ece6);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
        box-shadow: 0 4px 12px rgba(74, 158, 136, 0.08);
    }

    &__empty-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--search-ink-soft);
        margin-bottom: 0.25rem;
    }

    &__empty-desc {
        font-size: 0.8125rem;
        color: var(--search-ink-ghost);
    }
}
</style>
