<template>
    <div v-if="cabinet" class="fd-cabinet-detail">
        <!-- 照片轮播 -->
        <div class="fd-cabinet-detail__carousel-wrap">
            <el-carousel v-if="cabinet.photos?.length" :interval="4000" indicator-position="outside" arrow="hover">
                <el-carousel-item v-for="(photo, idx) in cabinet.photos" :key="idx">
                    <img :src="photo" class="fd-cabinet-detail__carousel-img" alt="" @click="openPreview(photo)" />
                </el-carousel-item>
            </el-carousel>
            <div v-else class="fd-cabinet-detail__no-photo">
                <el-icon :size="48">
                    <Picture />
                </el-icon>
                <span>暂无照片</span>
            </div>
        </div>

        <!-- 名称大标题 -->
        <h1 class="fd-cabinet-detail__name">{{ cabinet.name }}</h1>

        <!-- 基本信息组 -->
        <div class="fd-cabinet-detail__group">
            <h2 class="fd-cabinet-detail__group-title">基本信息</h2>
            <div class="fd-cabinet-detail__row">
                <div class="fd-cabinet-detail__icon-wrap">
                    <el-icon :size="16">
                        <Location />
                    </el-icon>
                </div>
                <span class="fd-cabinet-detail__label">位置描述</span>
                <span class="fd-cabinet-detail__value">{{ cabinet.location || '未填写位置' }}</span>
            </div>
            <div class="fd-cabinet-detail__row">
                <div class="fd-cabinet-detail__icon-wrap">
                    <el-icon :size="16">
                        <Clock />
                    </el-icon>
                </div>
                <span class="fd-cabinet-detail__label">创建时间</span>
                <span class="fd-cabinet-detail__value">{{ formatDateTime(cabinet.createdAt) }}</span>
            </div>
        </div>

        <!-- 柜内物品组 -->
        <div class="fd-cabinet-detail__group">
            <h2 class="fd-cabinet-detail__group-title">
                柜内物品（共 {{ cabinet.itemCount }} 件）
            </h2>
            <template v-if="cabinetItems.length > 0">
                <div v-for="item in cabinetItems" :key="item.id" class="fd-cabinet-detail__item-card"
                    @click="goItemDetail(item.id)">
                    <div class="fd-cabinet-detail__item-thumb">
                        <img v-if="item.photo" :src="item.photo" alt="" />
                        <el-icon v-else :size="20">
                            <Box />
                        </el-icon>
                    </div>
                    <div class="fd-cabinet-detail__item-info">
                        <div class="fd-cabinet-detail__item-name">{{ item.name }}</div>
                        <div class="fd-cabinet-detail__item-meta">存放于 {{ item.storageDate }}</div>
                    </div>
                    <el-icon :size="14" class="fd-cabinet-detail__item-arrow">
                        <ArrowRight />
                    </el-icon>
                </div>
            </template>
            <div v-else class="fd-cabinet-detail__empty-items">
                <el-empty description="该储物柜暂无物品" />
            </div>
        </div>

        <!-- 操作按钮 -->
        <div class="fd-cabinet-detail__actions">
            <el-button class="fd-cabinet-detail__btn-edit" plain @click="goEdit">
                <el-icon :size="16">
                    <Edit />
                </el-icon>
                <span>编辑</span>
            </el-button>
            <el-tooltip v-if="!canDelete" content="该储物柜还有物品，请先移出后再删除" placement="top">
                <el-button class="fd-cabinet-detail__btn-delete" plain type="danger" disabled>
                    <el-icon :size="16">
                        <Delete />
                    </el-icon>
                    <span>删除</span>
                </el-button>
            </el-tooltip>
            <el-button v-else class="fd-cabinet-detail__btn-delete" plain type="danger" @click="confirmDelete">
                <el-icon :size="16">
                    <Delete />
                </el-icon>
                <span>删除</span>
            </el-button>
        </div>

        <!-- 图片预览弹窗 -->
        <el-dialog v-model="previewVisible" :show-close="true" :modal="true" :append-to-body="true" align-center
            width="90%" class="fd-cabinet-detail__preview">
            <img v-if="previewUrl" :src="previewUrl" class="fd-cabinet-detail__preview-img" alt="" />
        </el-dialog>
    </div>

    <!-- 储物柜不存在 -->
    <div v-else class="fd-cabinet-detail__notfound">
        <p>储物柜不存在或已被删除</p>
        <el-button type="primary" @click="goBack">返回列表</el-button>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
    Picture,
    Location,
    Clock,
    Box,
    ArrowRight,
    Edit,
    Delete,
} from '@element-plus/icons-vue'
import { useCabinetDetail } from './detail.ts'

const {
    cabinet,
    cabinetItems,
    canDelete,
    goEdit,
    goItemDetail,
    goBack,
    confirmDelete,
    formatDateTime,
} = useCabinetDetail()

const previewVisible = ref(false)
const previewUrl = ref('')

function openPreview(url: string) {
    previewUrl.value = url
    previewVisible.value = true
}
</script>

<style lang="less" scoped>
.fd-cabinet-detail {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    background: var(--fd-cozy-cream);
    font-family: var(--fd-cozy-font-body);
    padding-bottom: 24px;

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

    &__name {
        font-size: 22px;
        font-weight: 700;
        color: var(--fd-cozy-ink);
        padding: 0 16px 8px;
        margin: 0;
        font-family: var(--fd-cozy-font-display);
    }

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

    &__item-card {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        background: var(--fd-cozy-cream);
        border-radius: 12px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        border: 1px solid var(--fd-cozy-butter);

        &:hover {
            box-shadow: 0 2px 8px rgba(45, 138, 120, 0.1);
        }

        &:active {
            transform: scale(0.98);
        }
    }

    &__item-thumb {
        width: 48px;
        height: 48px;
        border-radius: 10px;
        overflow: hidden;
        flex-shrink: 0;
        background: var(--fd-cozy-cream-deep);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--fd-cozy-butter);

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    &__item-info {
        flex: 1;
        min-width: 0;
    }

    &__item-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--fd-cozy-ink);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__item-meta {
        font-size: 12px;
        color: var(--fd-cozy-ink-soft);
        margin-top: 2px;
    }

    &__item-arrow {
        color: var(--fd-cozy-ink-soft);
        flex-shrink: 0;
    }

    &__empty-items {
        padding: 16px 0;
    }

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
        :deep(.el-button) {
            background: var(--fd-cozy-white);
            border: 1px solid var(--fd-cozy-butter);
            color: var(--fd-cozy-amber-deep);
        }
    }

    &__btn-delete {
        :deep(.el-button) {
            background: #ffebee;
            border: 1px solid #ef9a9a;
            color: #c62828;
        }

        &:deep(.el-button.is-disabled) {
            background: #f5f5f5;
            border-color: #e0e0e0;
            color: #bdbdbd;
        }
    }

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
