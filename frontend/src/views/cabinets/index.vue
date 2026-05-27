<template>
    <div class="fd-cabinets">
        <!-- 筛选栏 -->
        <div class="fd-cabinets__filter">
            <div class="fd-cabinets__filter-row">
                <el-input v-model="keyword" placeholder="搜索储物柜名称或位置" class="fd-cabinets__filter-search" clearable>
                    <template #prefix>
                        <el-icon>
                            <Search />
                        </el-icon>
                    </template>
                </el-input>
            </div>
            <div class="fd-cabinets__filter-row fd-cabinets__filter-row--date">
                <FdDateRangePicker v-model="dateRange" class="fd-cabinets__filter-date" />
            </div>
        </div>

        <!-- 列表容器 -->
        <div class="fd-cabinets__list" @scroll="onScroll">
            <template v-if="displayItems.length > 0">
                <div v-for="cab in displayItems" :key="cab.id" class="fd-cabinets__card-wrap" @click="goDetail(cab.id)">
                    <div class="fd-cabinets__card">
                        <!-- 缩略图 -->
                        <div class="fd-cabinets__thumb">
                            <img v-if="cab.photos && cab.photos.length > 0" :src="cab.photos[0]"
                                class="fd-cabinets__thumb-img" alt="" />
                            <el-icon v-else class="fd-cabinets__thumb-placeholder">
                                <OfficeBuilding />
                            </el-icon>
                        </div>
                        <!-- 信息区 -->
                        <div class="fd-cabinets__info">
                            <div class="fd-cabinets__name">{{ cab.name }}</div>
                            <div class="fd-cabinets__meta">
                                <el-icon :size="12">
                                    <Location />
                                </el-icon>
                                <span>{{ cab.location || '暂无位置描述' }}</span>
                            </div>
                            <div class="fd-cabinets__sub">
                                {{ formatDate(cab.createdAt) }}
                            </div>
                        </div>
                        <!-- 物品数量角标 -->
                        <div class="fd-cabinets__badge">
                            <span>{{ getItemCount(cab.id) }}件</span>
                        </div>
                    </div>
                </div>

                <!-- 加载更多 / 没有更多 -->
                <div v-if="loading" class="fd-cabinets__more">
                    <el-icon class="is-loading">
                        <Loading />
                    </el-icon>
                </div>
                <div v-else-if="noMore && displayItems.length > 0" class="fd-cabinets__more-tip">
                    没有更多了
                </div>
            </template>

            <!-- 空状态 -->
            <div v-else class="fd-cabinets__empty">
                <el-icon :size="48" class="fd-cabinets__empty-icon">
                    <OfficeBuilding />
                </el-icon>
                <div class="fd-cabinets__empty-title">暂无储物柜</div>
                <div class="fd-cabinets__empty-desc">快去添加第一个储物柜吧</div>
            </div>
        </div>

        <!-- 底部浮动添加按钮 -->
        <button class="fd-cabinets__fab" @click="goCreate">
            <el-icon :size="24">
                <Plus />
            </el-icon>
        </button>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import {
    Search,
    OfficeBuilding,
    Plus,
    Location,
    Loading,
} from '@element-plus/icons-vue'
import { useCabinetList } from './index.ts'
import FdDateRangePicker from '@/components/fd-date-range-picker/index.vue'

const router = useRouter()
const itemsStore = useItemsStore()

const {
    keyword,
    dateRange,
    displayItems,
    loading,
    noMore,
    onScroll,
} = useCabinetList()

function goDetail(id: string) {
    router.push(`/cabinets/${id}`)
}

function goCreate() {
    router.push('/cabinets/create')
}

function getItemCount(cabinetId: string) {
    return itemsStore.items.filter(i => i.cabinetId === cabinetId).length
}

function formatDate(iso: string) {
    const d = new Date(iso)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}
</script>

<style lang="less" scoped>
.fd-cabinets {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background: var(--fd-cozy-cream);
    font-family: var(--fd-cozy-font-body);

    &__filter {
        flex-shrink: 0;
        padding: 12px 16px;
        background: var(--fd-cozy-glass);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--fd-cozy-butter);
        z-index: 10;

        &-row {
            display: flex;
            gap: 8px;
            align-items: center;

            &--date {
                margin-top: 8px;
            }
        }

        &-search {
            flex: 1;

            :deep(.el-input__wrapper) {
                border-radius: 12px;
                background: var(--fd-cozy-white);
                box-shadow: 0 1px 4px rgba(45, 138, 120, 0.06);
                border: 1px solid var(--fd-cozy-butter);
            }

            :deep(.el-input__inner) {
                font-size: 14px;
                color: var(--fd-cozy-ink);
            }
        }

        &-date {
            width: 100%;
        }
    }

    &__list {
        flex: 1;
        overflow-y: auto;
        padding: 12px 16px 24px;
        -webkit-overflow-scrolling: touch;
    }

    &__card-wrap {
        margin-bottom: 10px;
        cursor: pointer;
    }

    &__card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: var(--fd-cozy-white);
        border-radius: 16px;
        border: 1px solid var(--fd-cozy-butter);
        box-shadow: 0 2px 8px rgba(45, 138, 120, 0.06);
        transition: transform 0.2s ease;
        opacity: 0;
        animation: fd-cabinets-card-enter 0.4s ease forwards;

        &:hover {
            box-shadow: 0 6px 16px rgba(45, 138, 120, 0.1);
        }

        &:active {
            transform: scale(0.98);
        }
    }

    &__card-wrap:nth-child(1) &__card {
        animation-delay: 0.03s;
    }

    &__card-wrap:nth-child(2) &__card {
        animation-delay: 0.06s;
    }

    &__card-wrap:nth-child(3) &__card {
        animation-delay: 0.09s;
    }

    &__card-wrap:nth-child(4) &__card {
        animation-delay: 0.12s;
    }

    &__card-wrap:nth-child(5) &__card {
        animation-delay: 0.15s;
    }

    &__card-wrap:nth-child(6) &__card {
        animation-delay: 0.18s;
    }

    &__card-wrap:nth-child(7) &__card {
        animation-delay: 0.21s;
    }

    &__card-wrap:nth-child(8) &__card {
        animation-delay: 0.24s;
    }

    @keyframes fd-cabinets-card-enter {
        to {
            opacity: 1;
        }
    }

    &__thumb {
        width: 64px;
        height: 64px;
        border-radius: 12px;
        overflow: hidden;
        flex-shrink: 0;
        background: var(--fd-cozy-cream-deep);
        display: flex;
        align-items: center;
        justify-content: center;

        &-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        &-placeholder {
            font-size: 24px;
            color: var(--fd-cozy-butter);
        }
    }

    &__info {
        flex: 1;
        min-width: 0;
    }

    &__name {
        font-size: 15px;
        font-weight: 600;
        color: var(--fd-cozy-ink);
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__meta {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 4px;
        font-size: 12px;
        color: var(--fd-cozy-ink-soft);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__sub {
        font-size: 12px;
        color: var(--fd-cozy-ink-soft);
        margin-top: 2px;
        opacity: 0.6;
    }

    &__badge {
        flex-shrink: 0;
        padding: 2px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        background: var(--fd-cozy-cream-deep);
        color: var(--fd-cozy-amber-deep);
        border: 1px solid var(--fd-cozy-butter);
    }

    &__more {
        text-align: center;
        padding: 16px 0;
    }

    &__more-tip {
        text-align: center;
        padding: 16px 0;
        font-size: 13px;
        color: var(--fd-cozy-ink-soft);
        opacity: 0.6;
    }

    &__empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px 24px;

        &-icon {
            margin-bottom: 12px;
            color: var(--fd-cozy-butter);
        }

        &-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--fd-cozy-ink);
            margin-bottom: 4px;
        }

        &-desc {
            font-size: 13px;
            color: var(--fd-cozy-ink-soft);
        }
    }

    &__fab {
        position: fixed;
        bottom: 80px;
        right: 16px;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: var(--fd-cozy-amber-deep);
        color: #fff;
        border: none;
        box-shadow: 0 4px 16px rgba(45, 138, 120, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 24px;
        transition: transform 0.2s, box-shadow 0.2s;
        z-index: 50;

        &:active {
            transform: scale(0.92);
            box-shadow: 0 2px 8px rgba(45, 138, 120, 0.25);
        }
    }
}
</style>
