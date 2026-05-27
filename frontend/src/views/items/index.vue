<template>
    <div class="fd-items">
        <!-- 筛选栏 -->
        <div class="fd-items__filter">
            <div class="fd-items__filter-row">
                <el-input v-model="keyword" placeholder="搜索物品名称" :prefix-icon="Search" class="fd-items__filter-search"
                    clearable />
                <el-select v-model="categoryId" placeholder="全部分类" class="fd-items__filter-select">
                    <el-option label="全部" value="all" />
                    <el-option v-for="cat in categoriesOptions" :key="cat.id" :label="cat.name" :value="cat.id" />
                </el-select>
            </div>
            <div class="fd-items__filter-row fd-items__filter-row--date">
                <FdDateRangePicker v-model="dateRange" class="fd-items__filter-date" />
            </div>
        </div>

        <!-- 物品列表 -->
        <div ref="listRef" class="fd-items__list" @scroll="onScroll">
            <div v-for="item in displayItems" :key="item.id" class="fd-items__card-wrap"
                @touchstart="onTouchStart($event, item.id)" @touchmove="onTouchMove($event, item.id)"
                @touchend="onTouchEnd($event, item.id)">
                <div class="fd-items__card" :style="cardStyle(item.id)" @click="goDetail(item.id)">
                    <!-- 缩略图 -->
                    <div class="fd-items__thumb">
                        <img v-if="item.photos?.length" :src="item.photos[0]" class="fd-items__thumb-img" alt=""
                            loading="lazy" />
                        <el-icon v-else class="fd-items__thumb-placeholder">
                            <Box />
                        </el-icon>
                    </div>

                    <!-- 信息 -->
                    <div class="fd-items__info">
                        <p class="fd-items__name">{{ item.name }}</p>
                        <div class="fd-items__meta">
                            <span class="fd-items__tag">
                                {{ getCategoryName(item.categoryId) }}
                            </span>
                        </div>
                        <p class="fd-items__sub">
                            <el-icon :size="11" style="vertical-align: -1px">
                                <Location />
                            </el-icon>
                            {{ getCabinetName(item.cabinetId) }}
                            <span class="fd-items__sub-sep">|</span>
                            <el-icon :size="11" style="vertical-align: -1px">
                                <Calendar />
                            </el-icon>
                            {{ item.storageDate }}
                        </p>
                    </div>

                    <!-- 备用删除按钮（非触摸设备） -->
                    <button v-if="!isTouchDevice" class="fd-items__delete-fallback" @click.stop="confirmDelete(item)">
                        <el-icon>
                            <Delete />
                        </el-icon>
                    </button>
                </div>

                <!-- 滑动删除背景层 -->
                <div v-if="isTouchDevice && swipeItemId === item.id" class="fd-items__delete"
                    @click="confirmDelete(item)">
                    <el-icon>
                        <Delete />
                    </el-icon>
                </div>
            </div>

            <!-- 加载更多 -->
            <div v-if="displayItems.length > 0 && displayItems.length < total" class="fd-items__more">
                <el-button text type="primary" class="fd-items__more-btn" :loading="loading" @click="loadMore">
                    {{ loading ? '加载中...' : '加载更多' }}
                </el-button>
            </div>
            <div v-else-if="displayItems.length > 0 && noMore" class="fd-items__more">
                <span class="fd-items__more-tip">— 没有更多了 —</span>
            </div>

            <!-- 空状态 -->
            <div v-if="total === 0" class="fd-items__empty">
                <el-icon class="fd-items__empty-icon">
                    <Box />
                </el-icon>
                <p class="fd-items__empty-title">暂无物品</p>
                <p class="fd-items__empty-desc">还没有添加任何物品</p>
            </div>
        </div>

        <!-- 浮动添加按钮 -->
        <button class="fd-items__fab" @click="goCreate">
            <el-icon :size="22">
                <Plus />
            </el-icon>
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
    Search,
    Delete,
    Plus,
    Box,
    Location,
    Calendar,
} from '@element-plus/icons-vue'
import { useItemList } from './index.ts'
import { useItemsStore } from '@/stores/items'
import FdDateRangePicker from '@/components/fd-date-range-picker/index.vue'
import type { ItemVO } from '@/types/item'

const router = useRouter()
const {
    keyword,
    categoryId,
    dateRange,
    loading,
    noMore,
    displayItems,
    total,
    loadMore,
    onScroll,
    getCategoryName,
    getCabinetName,
    categoriesOptions,
} = useItemList()

const isTouchDevice = ref(false)
const swipeItemId = ref<string | null>(null)
const swipeOffset = ref(0)
let touchStartX = 0
let touchStartY = 0

onMounted(() => {
    isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
})

function cardStyle(itemId: string) {
    if (swipeItemId.value === itemId && swipeOffset.value > 0) {
        return { transform: `translateX(-${swipeOffset.value}px)` }
    }
    return {}
}

function onTouchStart(e: TouchEvent, itemId: string) {
    if (!isTouchDevice.value) return
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
    if (swipeItemId.value && swipeItemId.value !== itemId) {
        swipeItemId.value = null
        swipeOffset.value = 0
    }
}

function onTouchMove(e: TouchEvent, itemId: string) {
    if (!isTouchDevice.value) return
    const dx = touchStartX - e.touches[0].clientX
    const dy = Math.abs(touchStartY - e.touches[0].clientY)
    if (dy > Math.abs(dx)) return // 垂直滑动，忽略
    if (dx > 0 && dx < 80) {
        e.preventDefault()
        swipeItemId.value = itemId
        swipeOffset.value = dx
    }
}

function onTouchEnd(_e: TouchEvent, itemId: string) {
    if (!isTouchDevice.value) return
    if (swipeItemId.value === itemId && swipeOffset.value < 40) {
        swipeItemId.value = null
        swipeOffset.value = 0
    }
}

function goDetail(id: string) {
    // 如果有滑动状态，先重置
    if (swipeItemId.value) {
        swipeItemId.value = null
        swipeOffset.value = 0
        return
    }
    router.push(`/items/${id}`)
}

function goCreate() {
    router.push('/items/create')
}

function confirmDelete(item: ItemVO) {
    ElMessageBox.confirm(
        `确定删除 "${item.name}" 吗？删除后所属储物柜物品数量将减少。`,
        '确认删除',
        {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            confirmButtonClass: 'el-button--danger',
            type: 'warning',
        },
    )
        .then(() => {
            const store = useItemsStore()
            store.deleteItem(item.id).then(() => {
                ElMessage.success('删除成功')
                swipeItemId.value = null
                swipeOffset.value = 0
            })
        })
        .catch(() => {
            swipeItemId.value = null
            swipeOffset.value = 0
        })
}
</script>

<style lang="less" scoped src="./index.less"></style>
