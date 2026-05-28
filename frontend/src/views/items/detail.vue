<template>
    <div v-if="item" class="fd-item-detail">
        <!-- 照片轮播 -->
        <div class="fd-item-detail__carousel-wrap">
            <el-carousel v-if="item.photos?.length" :interval="4000" type="card" indicator-position="outside"
                arrow="hover">
                <el-carousel-item v-for="(photo, idx) in item.photos" :key="idx">
                    <img :src="photo" class="fd-item-detail__carousel-img" alt="" @click="openPreview(photo)" />
                </el-carousel-item>
            </el-carousel>
            <div v-else class="fd-item-detail__no-photo">
                <el-icon :size="48">
                    <Picture />
                </el-icon>
                <span>暂无照片</span>
            </div>
        </div>

        <!-- 名称大标题 -->
        <h1 class="fd-item-detail__name">{{ item.name }}</h1>

        <!-- 基本信息组 -->
        <div class="fd-item-detail__group">
            <h2 class="fd-item-detail__group-title">基本信息</h2>
            <div class="fd-item-detail__row">
                <div class="fd-item-detail__icon-wrap">
                    <el-icon :size="16">
                        <CollectionTag />
                    </el-icon>
                </div>
                <span class="fd-item-detail__label">分类</span>
                <span class="fd-item-detail__tag">
                    {{ categoryName }}
                </span>
            </div>
            <div v-if="item.note" class="fd-item-detail__row">
                <div class="fd-item-detail__icon-wrap">
                    <el-icon :size="16">
                        <Document />
                    </el-icon>
                </div>
                <span class="fd-item-detail__label">备注</span>
                <span class="fd-item-detail__value fd-item-detail__note">{{ item.note }}</span>
            </div>
        </div>

        <!-- 存放信息组 -->
        <div class="fd-item-detail__group">
            <h2 class="fd-item-detail__group-title">存放信息</h2>
            <div class="fd-item-detail__row">
                <div class="fd-item-detail__icon-wrap">
                    <el-icon :size="16">
                        <Calendar />
                    </el-icon>
                </div>
                <span class="fd-item-detail__label">存放日期</span>
                <span class="fd-item-detail__value">存放于 {{ item.storageDate }}</span>
            </div>
            <div class="fd-item-detail__row" @click="goCabinet">
                <div class="fd-item-detail__icon-wrap">
                    <el-icon :size="16">
                        <Cabinet />
                    </el-icon>
                </div>
                <span class="fd-item-detail__label">储物柜</span>
                <span class="fd-item-detail__value fd-item-detail__link">
                    {{ cabinetName }}
                    <el-icon :size="14">
                        <ArrowRight />
                    </el-icon>
                </span>
            </div>
            <div class="fd-item-detail__row">
                <div class="fd-item-detail__icon-wrap">
                    <el-icon :size="16">
                        <Clock />
                    </el-icon>
                </div>
                <span class="fd-item-detail__label">创建时间</span>
                <span class="fd-item-detail__value">{{ formatDateTime(item.createdAt) }}</span>
            </div>
        </div>

        <!-- 操作按钮 -->
        <div class="fd-item-detail__actions">
            <el-button class="fd-item-detail__btn-edit" plain @click="goEdit">
                <el-icon :size="16">
                    <Edit />
                </el-icon>
                <span>编辑</span>
            </el-button>
            <el-button class="fd-item-detail__btn-delete" plain type="danger" @click="confirmDelete">
                <el-icon :size="16">
                    <Delete />
                </el-icon>
                <span>删除</span>
            </el-button>
        </div>

        <!-- 图片预览弹窗 -->
        <el-dialog v-model="previewVisible" :show-close="true" :modal="true" :append-to-body="true" align-center
            width="90%" class="fd-item-detail__preview">
            <img v-if="previewUrl" :src="previewUrl" class="fd-item-detail__preview-img" alt="" />
        </el-dialog>
    </div>

    <!-- 物品不存在 -->
    <div v-else class="fd-item-detail__notfound">
        <p>物品不存在或已被删除</p>
        <el-button type="primary" @click="goBack">返回列表</el-button>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
    Picture,
    CollectionTag,
    Document,
    Calendar,
    OfficeBuilding,
    ArrowRight,
    Clock,
    Edit,
    Delete,
} from '@element-plus/icons-vue'
import { useItemsStore } from '@/stores/items'
import { useCategoriesStore } from '@/stores/categories'
import { useCabinetsStore } from '@/stores/cabinets'

const route = useRoute()
const router = useRouter()
const itemsStore = useItemsStore()
const categoriesStore = useCategoriesStore()
const cabinetsStore = useCabinetsStore()

const itemId = computed(() => route.params.id as string)
const item = computed(() => itemsStore.itemById(itemId.value))

const categoryName = computed(() =>
    categoriesStore.categoryById(item.value?.categoryId || '')?.name ?? '未分类',
)
const cabinetName = computed(() =>
    cabinetsStore.cabinetById(item.value?.cabinetId || '')?.name ?? '未知储物柜',
)

const previewVisible = ref(false)
const previewUrl = ref('')

function openPreview(url: string) {
    previewUrl.value = url
    previewVisible.value = true
}

function goCabinet() {
    if (item.value) {
        router.push(`/cabinets/${item.value.cabinetId}`)
    }
}

function goEdit() {
    router.push(`/items/${itemId.value}/edit`)
}

function goBack() {
    router.push('/items')
}

function confirmDelete() {
    if (!item.value) return
    ElMessageBox.confirm(
        '确定删除该物品？删除后所属储物柜物品数量将减少。',
        '确认删除',
        {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning',
        },
    )
        .then(() => {
            itemsStore.deleteItem(itemId.value).then(() => {
                ElMessage.success('删除成功')
                router.push('/items')
            })
        })
        .catch(() => { })
}

function formatDateTime(dateStr: string) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${day} ${h}:${min}`
}

// Cabinet 图标不存在，使用 OfficeBuilding 别名
const Cabinet = OfficeBuilding
</script>

<style lang="less" scoped>
.fd-item-detail {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    background: var(--fd-cozy-cream);
    font-family: var(--fd-cozy-font-body);
    padding-bottom: 24px;

    // 顶部导航
    &__nav {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        position: sticky;
        top: 0;
        background: var(--fd-cozy-glass);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--fd-cozy-butter);
        z-index: 20;
    }

    &__back {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: var(--fd-cozy-white);
        border: 1px solid var(--fd-cozy-butter);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--fd-cozy-ink);
        cursor: pointer;

        &:active {
            background: var(--fd-cozy-cream-deep);
        }
    }

    &__nav-title {
        flex: 1;
        text-align: center;
        font-size: 16px;
        font-weight: 600;
        color: var(--fd-cozy-ink);
    }

    &__nav-spacer {
        width: 36px;
    }

    // 轮播
    &__carousel-wrap {
        padding: 16px;
    }

    &__carousel-img {
        width: 100%;
        height: 220px;
        object-fit: cover;
        border-radius: 16px;
        cursor: pointer;
        transition: transform 0.2s;

        &:hover {
            transform: scale(1.02);
        }
    }

    &__no-photo {
        height: 220px;
        border-radius: 16px;
        background: var(--fd-cozy-cream-deep);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: var(--fd-cozy-ink-soft);
        font-size: 14px;
    }

    // 名称
    &__name {
        font-size: 22px;
        font-weight: 700;
        color: var(--fd-cozy-ink);
        padding: 0 16px 8px;
        margin: 0;
        font-family: var(--fd-cozy-font-display);
    }

    // 信息分组
    &__group {
        margin: 8px 16px 16px;
        padding: 16px;
        background: var(--fd-cozy-white);
        border-radius: 16px;
        border: 1px solid var(--fd-cozy-butter);
        box-shadow: 0 2px 8px rgba(45, 138, 120, 0.06);
        animation: fd-detail-group-enter 0.4s ease forwards;
        opacity: 0;
        transform: translateY(12px);

        &:nth-child(3) {
            animation-delay: 0.05s;
        }

        &:nth-child(4) {
            animation-delay: 0.1s;
        }

        &:nth-child(5) {
            animation-delay: 0.15s;
        }
    }

    @keyframes fd-detail-group-enter {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    &__group-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--fd-cozy-amber-deep);
        margin: 0 0 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--fd-cozy-butter);
    }

    &__row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
        min-height: 44px;

        &:not(:last-child) {
            border-bottom: 1px solid rgba(184, 224, 214, 0.4);
        }

        &--link {
            cursor: pointer;
        }
    }

    &__icon-wrap {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: var(--fd-cozy-cream-deep);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--fd-cozy-amber-deep);
        flex-shrink: 0;
    }

    &__label {
        font-size: 14px;
        color: var(--fd-cozy-ink-soft);
        width: 72px;
        flex-shrink: 0;
    }

    &__value {
        flex: 1;
        font-size: 14px;
        color: var(--fd-cozy-ink);
        text-align: right;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__tag {
        display: inline-flex;
        align-items: center;
        flex: 0 0 auto;
        margin-left: auto;
        padding: 2px 10px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
        background: var(--fd-cozy-cream-deep);
        color: var(--fd-cozy-amber-deep);
        border: 1px solid var(--fd-cozy-butter);
        white-space: nowrap;
        max-width: 100%;
    }

    &__note {
        white-space: pre-wrap;
        text-align: right;
        word-break: break-word;
    }

    &__link {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 4px;
        color: var(--fd-cozy-amber-deep);
        cursor: pointer;

        &:hover {
            text-decoration: underline;
        }
    }

    // 操作按钮
    &__actions {
        display: flex;
        gap: 12px;
        padding: 0 16px;
        margin-top: 8px;

        :deep(.el-button) {
            flex: 1;
            height: 48px;
            border-radius: 14px;
            font-size: 15px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }
    }

    &__btn-edit {
        &:deep(.el-button) {
            background: var(--fd-cozy-white);
            border: 1px solid var(--fd-cozy-butter);
            color: var(--fd-cozy-amber-deep);
        }
    }

    &__btn-delete {
        &:deep(.el-button) {
            background: #ffebee;
            border: 1px solid #ef9a9a;
            color: #c62828;
        }
    }

    // 图片预览
    &__preview {
        :deep(.el-dialog__body) {
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }

    &__preview-img {
        max-width: 100%;
        max-height: 70vh;
        object-fit: contain;
        border-radius: 8px;
    }

    // 物品不存在
    &__notfound {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        gap: 16px;
        color: var(--fd-cozy-ink-soft);
        font-size: 15px;
    }
}
</style>
