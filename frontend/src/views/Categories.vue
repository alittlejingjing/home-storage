<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categories'
import { ElMessage, ElMessageBox, ElRadio, ElRadioGroup } from 'element-plus'
import {
    CollectionTag,
    Edit,
    Delete,
    Top,
    Bottom,
    Check,
    Close,
    Plus,
} from '@element-plus/icons-vue'

const categoriesStore = useCategoriesStore()
const { categoriesWithCount } = storeToRefs(categoriesStore)

onMounted(() => {
    categoriesStore.loadCategories()
})

const editingId = ref<string | null>(null)
const editingName = ref('')

const newCategoryName = ref('')

const deleteTargetId = ref<string | null>(null)
const deleteTargetCount = ref(0)

// 温暖有机的配色方案 —— 与首页同频但更柔和 earthy
const warmOrganicPalette: Record<string, { light: string; main: string; dark: string }> = {
    'cat-1': { light: '#f5e6d3', main: '#d4a373', dark: '#b5855d' },   // 暖琥珀 — 生活用品
    'cat-2': { light: '#f5dedb', main: '#d2847a', dark: '#b36a62' },   // 陶土 — 衣物
    'cat-3': { light: '#dce8cd', main: '#8cb369', dark: '#6f9451' },   // 鼠尾草 — 工具
    'cat-4': { light: '#d1e8e2', main: '#5da8a0', dark: '#4a8a83' },   // 青灰 — 药品
    'cat-5': { light: '#d8e0ef', main: '#8fa6cb', dark: '#7289b0' },   // 尘蓝 — 文件
}

function getCategoryColor(categoryId: string) {
    if (warmOrganicPalette[categoryId]) return warmOrganicPalette[categoryId]
    const colors = [
        { main: '#d4a373', light: '#f5e6d3' },
        { main: '#d2847a', light: '#f5dedb' },
        { main: '#8cb369', light: '#dce8cd' },
        { main: '#5da8a0', light: '#d1e8e2' },
        { main: '#8fa6cb', light: '#d8e0ef' },
        { main: '#c49ac8', light: '#ecdbf0' },
        { main: '#d4b26a', light: '#f0e6cc' },
        { main: '#7ab8a0', light: '#d1ebe3' },
    ]
    const hash = categoryId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    return colors[hash % colors.length]
}

function startEdit(category: { id: string; name: string }) {
    editingId.value = category.id
    editingName.value = category.name
}

function cancelEdit() {
    editingId.value = null
    editingName.value = ''
}

async function saveEdit(id: string) {
    const result = await categoriesStore.updateCategory(id, editingName.value)
    if (!result) {
        ElMessage.error('保存失败，分类名称已存在或格式不正确')
        return
    }
    ElMessage.success('保存成功')
    editingId.value = null
    editingName.value = ''
}

function handleDeleteClick(category: { id: string; count: number }) {
    deleteTargetId.value = category.id
    deleteTargetCount.value = category.count
    if (category.count > 0) {
        showStrategyDeleteDialog(category.count)
    } else {
        showSimpleDeleteDialog()
    }
}

async function showSimpleDeleteDialog() {
    try {
        await ElMessageBox.confirm('删除后不可恢复，是否继续？', '确认删除', {
            confirmButtonText: '确认删除',
            cancelButtonText: '取消',
            type: 'warning',
        })
        await confirmDelete('delete')
    } catch {
        cancelDelete()
    }
}

async function showStrategyDeleteDialog(count: number) {
    let selectedStrategy = 'MOVE_TO_UNCATEGORIZED'

    try {
        await ElMessageBox.confirm(
            '',
            '确认删除',
            {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'warning',
                message: h('div', { style: 'font-size: 14px;' }, [
                    h('div', { style: 'margin-bottom: 12px; color: #4a574f;' }, [
                        '该分类下还有 ',
                        h('strong', { style: 'color: #2d4139;' }, count),
                        ' 件物品，请选择处理方式',
                    ]),
                    h(ElRadioGroup, {
                        modelValue: selectedStrategy,
                        'onUpdate:modelValue': (val: string) => { selectedStrategy = val },
                        style: 'display: flex; flex-direction: column; gap: 8px;',
                    }, () => [
                        h(ElRadio, { label: 'DELETE_ITEMS', border: true, style: 'margin-right: 0;' }, () => '一并删除'),
                        h(ElRadio, { label: 'MOVE_TO_UNCATEGORIZED', border: true, style: 'margin-right: 0;' }, () => '转移至未分类'),
                    ]),
                ]),
            }
        )
        await confirmDelete(selectedStrategy === 'DELETE_ITEMS' ? 'delete' : 'uncategorized')
    } catch {
        cancelDelete()
    }
}

async function confirmDelete(mode: 'delete' | 'uncategorized') {
    if (!deleteTargetId.value) return
    await categoriesStore.deleteCategory(deleteTargetId.value, mode)
    deleteTargetId.value = null
    deleteTargetCount.value = 0
}

function cancelDelete() {
    deleteTargetId.value = null
    deleteTargetCount.value = 0
}

async function addCategory() {
    const name = newCategoryName.value.trim()
    if (!name) {
        ElMessage.warning('分类名称不能为空')
        return
    }
    if (name.length > 20) {
        ElMessage.warning('分类名称不能超过20个字符')
        return
    }
    const result = await categoriesStore.addCategory(name)
    if (!result) {
        ElMessage.error('添加失败，分类名称已存在或格式不正确')
        return
    }
    ElMessage.success('分类添加成功')
    newCategoryName.value = ''
}
</script>

<template>
    <div class="fd-categories">
        <!-- 列表 -->
        <div v-if="categoriesWithCount.length > 0" class="fd-categories__list">
            <div v-for="(category, index) in categoriesWithCount" :key="category.id" class="fd-categories__card"
                :style="{ animationDelay: (index * 0.06).toFixed(2) + 's' }">
                <!-- 正常模式 -->
                <div v-if="editingId !== category.id" class="fd-categories__row">
                    <div class="fd-categories__info">
                        <div class="fd-categories__orb"
                            :style="{ backgroundColor: getCategoryColor(category.id).light }">
                            <span class="fd-categories__orb-dot"
                                :style="{ backgroundColor: getCategoryColor(category.id).main }" />
                        </div>
                        <div class="fd-categories__text">
                            <span class="fd-categories__name">{{ category.name }}</span>
                            <span class="fd-categories__count">{{ category.count }} 件物品</span>
                        </div>
                    </div>
                    <div class="fd-categories__actions">
                        <el-button text :disabled="index === 0"
                            class="fd-categories__action-btn fd-categories__action-btn--sort"
                            @click="categoriesStore.reorderCategories(category.id, 'up')">
                            <el-icon>
                                <Top />
                            </el-icon>
                        </el-button>
                        <el-button text :disabled="index === categoriesWithCount.length - 1"
                            class="fd-categories__action-btn fd-categories__action-btn--sort"
                            @click="categoriesStore.reorderCategories(category.id, 'down')">
                            <el-icon>
                                <Bottom />
                            </el-icon>
                        </el-button>
                        <el-button text class="fd-categories__action-btn" @click="startEdit(category)">
                            <el-icon>
                                <Edit />
                            </el-icon>
                        </el-button>
                        <el-button text type="danger" class="fd-categories__action-btn"
                            @click="handleDeleteClick(category)">
                            <el-icon>
                                <Delete />
                            </el-icon>
                        </el-button>
                    </div>
                </div>

                <!-- 编辑模式 -->
                <div v-else class="fd-categories__row fd-categories__row--edit">
                    <el-input v-model="editingName" class="fd-categories__edit-input" placeholder="分类名称" maxlength="20"
                        show-word-limit @keyup.enter="saveEdit(category.id)" />
                    <el-button type="primary" circle class="fd-categories__action-btn" @click="saveEdit(category.id)">
                        <el-icon>
                            <Check />
                        </el-icon>
                    </el-button>
                    <el-button text circle class="fd-categories__action-btn" @click="cancelEdit">
                        <el-icon>
                            <Close />
                        </el-icon>
                    </el-button>
                </div>

                <!-- 顶部装饰色带 -->
                <div class="fd-categories__card-accent"
                    :style="{ background: 'linear-gradient(90deg, ' + getCategoryColor(category.id).main + ' 0%, ' + getCategoryColor(category.id).light + ' 100%)' }" />
            </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="fd-categories__empty">
            <div class="fd-categories__empty-orb">
                <el-icon :size="28" color="#9ed7c8">
                    <CollectionTag />
                </el-icon>
            </div>
            <div class="fd-categories__empty-title">暂无分类</div>
            <div class="fd-categories__empty-desc">在下方添加您的第一个分类</div>
        </div>

        <!-- 底部新增栏 -->
        <div class="fd-categories__footer">
            <div class="fd-categories__footer-inner">
                <div class="fd-categories__input-wrap">
                    <el-input v-model="newCategoryName" placeholder="输入新分类名称" class="fd-categories__new-input"
                        maxlength="20" show-word-limit @keyup.enter="addCategory">
                        <template #prefix>
                            <el-icon :size="16" color="#8ca89e">
                                <Plus />
                            </el-icon>
                        </template>
                    </el-input>
                </div>
                <el-button type="primary" class="fd-categories__add-btn" :icon="Plus" @click="addCategory">
                    添加
                </el-button>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
/*
   fd-categories — 分类管理
   温暖有机｜简约克制｜与首页 fd-home 同频
   ----------------------------------------------------------- */

.fd-categories {
    --cat-bg: #f3f9f6;
    --cat-ink: #2d4139;
    --cat-ink-soft: #5f7d72;
    --cat-ink-ghost: #8ca89e;
    --cat-green: #4a9e88;
    --cat-green-light: #9ed7c8;
    --cat-green-pale: #d4ece6;
    --cat-green-faint: #ecf5f2;
    --cat-card-bg: rgba(255, 255, 255, 0.72);
    --cat-card-border: rgba(74, 158, 136, 0.10);
    --cat-card-shadow: 0 2px 8px rgba(45, 130, 110, 0.05);
    --cat-card-hover-shadow: 0 6px 20px rgba(45, 130, 110, 0.10);

    position: relative;
    min-height: 100%;
    padding: 1rem 0.875rem;
    background: var(--cat-bg);
    background-image:
        radial-gradient(circle at 10% 15%, rgba(158, 215, 200, 0.10) 0%, transparent 40%),
        radial-gradient(circle at 90% 85%, rgba(212, 236, 230, 0.25) 0%, transparent 45%);
    font-family: var(--fd-cozy-font-body);
    color: var(--cat-ink);
}

/* ---------- 卡片列表 ---------- */
.fd-categories__list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.fd-categories__card {
    position: relative;
    border: 1px solid var(--cat-card-border);
    border-radius: 1rem;
    background: var(--cat-card-bg);
    backdrop-filter: blur(12px) saturate(130%);
    box-shadow: var(--cat-card-shadow);
    overflow: hidden;
    transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
        box-shadow 0.3s ease,
        border-color 0.3s ease;

    opacity: 0;
    animation: cat-pop-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.fd-categories__card:hover {
    transform: translateY(-2px);
    box-shadow: var(--cat-card-hover-shadow);
    border-color: rgba(74, 158, 136, 0.18);
}

.fd-categories__card:active {
    transform: translateY(0) scale(0.99);
}

/* 顶部色带 */
.fd-categories__card-accent {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    opacity: 0.65;
    border-radius: 1rem 1rem 0 0;
    pointer-events: none;
}

/* ---------- 卡片行内容 ---------- */
.fd-categories__row {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.875rem;

    &--edit {
        .fd-categories__edit-input {
            flex: 1;
        }
    }
}

.fd-categories__info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
    flex: 1;
}

/* 色球 —— 双环有机感 */
.fd-categories__orb {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fd-categories__card:hover .fd-categories__orb {
    transform: scale(1.08);
}

.fd-categories__orb-dot {
    width: 0.875rem;
    height: 0.875rem;
    border-radius: 50%;
    display: block;
}

.fd-categories__text {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.fd-categories__name {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--cat-ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.fd-categories__count {
    font-size: 0.75rem;
    color: var(--cat-ink-ghost);
    margin-top: 0.125rem;
}

/* ---------- 操作按钮 ---------- */
.fd-categories__actions {
    display: flex;
    align-items: center;
    gap: 0.125rem;
    flex-shrink: 0;
}

.fd-categories__action-btn {
    min-width: 2rem;
    min-height: 2rem;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem !important;
    transition: color 0.2s, background-color 0.2s, transform 0.15s;

    :deep(.el-icon) {
        font-size: 0.9375rem;
    }

    &:hover {
        color: var(--cat-green) !important;
        background: rgba(74, 158, 136, 0.06) !important;
    }

    &:active {
        transform: scale(0.92);
    }

    &--sort {
        &:hover {
            color: var(--cat-green) !important;
        }

        &:disabled {
            opacity: 0.25 !important;
            color: var(--cat-ink-ghost) !important;
            background: transparent !important;
        }
    }

    &[type='danger'] {
        &:hover {
            color: #ef4444 !important;
            background: rgba(239, 68, 68, 0.06) !important;
        }
    }
}

/* 编辑输入框 */
.fd-categories__edit-input {
    :deep(.el-input__wrapper) {
        border-radius: 0.625rem;
        background: #f8faf9;
        box-shadow: inset 0 0 0 1px rgba(74, 158, 136, 0.12);
        transition: box-shadow 0.2s;
    }

    :deep(.el-input__inner) {
        font-size: 0.9375rem;
    }
}

/* ---------- 空状态 ---------- */
.fd-categories__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5rem 1rem;
}

.fd-categories__empty-orb {
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

.fd-categories__empty-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--cat-ink-soft);
    margin-bottom: 0.25rem;
}

.fd-categories__empty-desc {
    font-size: 0.8125rem;
    color: var(--cat-ink-ghost);
}

/* ---------- 底部新增栏 ---------- */
.fd-categories__footer {
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 1.75rem);
    max-width: 410px;
    padding: 0.625rem 0.75rem;
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(16px) saturate(140%);
    border: 1px solid rgba(74, 158, 136, 0.12);
    border-radius: 1rem;
    box-shadow: 0 4px 20px rgba(45, 130, 110, 0.08), 0 1px 3px rgba(0, 0, 0, 0.03);
    z-index: 40;
}

.fd-categories__footer-inner {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.fd-categories__input-wrap {
    flex: 1;
}

.fd-categories__new-input {
    :deep(.el-input__wrapper) {
        border-radius: 0.75rem;
        background: #f4f7f6;
        box-shadow: inset 0 0 0 1px rgba(74, 158, 136, 0.08);
        padding-left: 0.625rem;
        transition: box-shadow 0.2s;
    }

    :deep(.el-input__inner) {
        font-size: 0.9375rem;
        color: var(--cat-ink);

        &::placeholder {
            color: #aabfb7;
        }
    }

    :deep(.el-input__count) {
        color: var(--cat-ink-ghost);
    }
}

.fd-categories__add-btn {
    height: 2.5rem;
    padding: 0 1.125rem;
    border-radius: 0.75rem !important;
    font-weight: 500;
    background: linear-gradient(135deg, var(--cat-green), #5aad96) !important;
    border: none !important;
    box-shadow: 0 2px 8px rgba(74, 158, 136, 0.25) !important;
    transition: transform 0.2s, box-shadow 0.2s !important;

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(74, 158, 136, 0.32) !important;
    }

    &:active {
        transform: translateY(0) scale(0.97);
    }
}

/* ---------- 动效 ---------- */
@keyframes cat-pop-in {
    from {
        opacity: 0;
        transform: translateY(10px) scale(0.97);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* 减少动画 */
@media (prefers-reduced-motion: reduce) {
    .fd-categories__card {
        animation: none;
        opacity: 1;
        transform: none;
    }
}
</style>
