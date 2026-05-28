<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import { useCabinetsStore } from '@/stores/cabinets'
import { useCategoriesStore } from '@/stores/categories'
import { getBackupRepository } from '@/repositories'
import type { BackupImportMode } from '@/types/backup'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    Download,
    Upload,
    Document,
    Warning,
    CircleCheck,
    Refresh,
    ArrowLeft,
} from '@element-plus/icons-vue'

const router = useRouter()
const itemsStore = useItemsStore()
const cabinetsStore = useCabinetsStore()
const categoriesStore = useCategoriesStore()
const backupRepo = getBackupRepository()

// 导出进度状态
const exportProgress = ref(0)
const isExporting = ref(false)
const exportSuccess = ref(false)

// 导入状态
const importDialogVisible = ref(false)
const importMode = ref<BackupImportMode>('MERGE')
const importFile = ref<File | null>(null)
const importError = ref('')
const isImporting = ref(false)
const importSuccess = ref(false)
const importStats = ref({ items: 0, cabinets: 0, categories: 0 })

const dataSummary = computed(() => [
    { label: '物品', count: itemsStore.items?.length ?? 0 },
    { label: '储物柜', count: cabinetsStore.cabinets?.length ?? 0 },
    { label: '分类', count: categoriesStore.categories?.length ?? 0 },
])

async function handleExport() {
    isExporting.value = true
    exportProgress.value = 10

    try {
        exportProgress.value = 40

        const { blob, filename } = await backupRepo.exportAll()

        exportProgress.value = 80

        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        exportProgress.value = 100
        exportSuccess.value = true
        ElMessage.success('导出成功')
    } catch {
        ElMessage.error('导出失败，请重试')
    } finally {
        isExporting.value = false

        setTimeout(() => {
            exportSuccess.value = false
            exportProgress.value = 0
        }, 3000)
    }
}

function handleFileChange(uploadFile: any) {
    const file = uploadFile.raw as File
    if (!file) return

    importFile.value = file
    importError.value = ''
    importSuccess.value = false
    importDialogVisible.value = true
}

async function handleImport() {
    if (!importFile.value) return

    isImporting.value = true
    importError.value = ''

    try {
        const text = await importFile.value.text()
        const data = JSON.parse(text)

        // R017: 校验
        const validation = backupRepo.validateBackup(data)
        if (!validation.valid) {
            importError.value = validation.error || '备份文件格式错误'
            return
        }

        // R018/R019: 二次确认已在弹窗完成，直接导入
        const result = await backupRepo.importAll(importFile.value, importMode.value)

        importStats.value = {
            items: result.items,
            cabinets: result.cabinets,
            categories: result.categories,
        }

        importSuccess.value = true
        importDialogVisible.value = false

        ElMessage.success(`导入成功：已恢复 ${result.items} 件物品、${result.cabinets} 个储物柜、${result.categories} 个分类`)
        ElMessage.info('页面即将刷新以确保数据一致性')

        setTimeout(() => {
            window.location.reload()
        }, 1500)
    } catch (err: any) {
        importError.value = err.message || '导入失败，请检查文件格式'
    } finally {
        isImporting.value = false
    }
}

function cancelImport() {
    importDialogVisible.value = false
    importFile.value = null
    importError.value = ''
}

async function handleClearCache() {
    try {
        await ElMessageBox.confirm('清除后所有本地数据将被删除，不可恢复，是否继续？', '确认清除缓存', {
            confirmButtonText: '确认清除',
            cancelButtonText: '取消',
            type: 'warning',
        })
        const systemRepo = (await import('@/repositories')).getSystemRepository()
        await systemRepo.clearCache()
        ElMessage.success('缓存已清除')
        // 刷新页面
        window.location.reload()
    } catch {
        // 用户取消
    }
}
</script>

<template>
    <div class="fd-backup">

        <!-- 数据概览 -->
        <div class="fd-backup__section">
            <h2 class="fd-backup__section-title">当前数据</h2>
            <div class="fd-backup__summary">
                <div v-for="s in dataSummary" :key="s.label" class="fd-backup__summary-card">
                    <span class="fd-backup__summary-num">{{ s.count }}</span>
                    <span class="fd-backup__summary-label">{{ s.label }}</span>
                </div>
            </div>
        </div>

        <!-- 导出区域 -->
        <div class="fd-backup__card">
            <div class="fd-backup__card-accent" aria-hidden="true" />
            <div class="fd-backup__card-body">
                <div class="fd-backup__feature">
                    <div class="fd-backup__icon-wrap fd-backup__icon-wrap--export">
                        <el-icon :size="22">
                            <Download />
                        </el-icon>
                    </div>
                    <div class="fd-backup__feature-info">
                        <h3 class="fd-backup__feature-title">数据导出</h3>
                        <p class="fd-backup__feature-desc">
                            将全量数据打包为 JSON 文件下载到本地，包含物品、储物柜、分类及照片
                        </p>
                    </div>
                </div>

                <div class="fd-backup__tips">
                    <p>文件名自动包含时间戳</p>
                    <p>照片将以 Base64 编码存储</p>
                    <p>建议在换机前执行导出</p>
                </div>

                <el-button type="primary" class="fd-backup__action-btn" :loading="isExporting"
                    :icon="exportSuccess ? CircleCheck : isExporting ? Refresh : Download" @click="handleExport">
                    {{ exportSuccess ? '导出成功' : isExporting ? '正在导出...' : '立即导出' }}
                </el-button>

                <!-- 导出进度 -->
                <div v-if="isExporting" class="fd-backup__progress">
                    <el-progress :percentage="exportProgress" :show-text="false" :stroke-width="6" color="#4a9e88" />
                    <p class="fd-backup__progress-text">正在打包数据...</p>
                </div>
            </div>
        </div>

        <!-- 导入区域 -->
        <div class="fd-backup__card">
            <div class="fd-backup__card-accent" :style="{ background: 'linear-gradient(90deg, #d4a373, #f5e6d3)' }"
                aria-hidden="true" />
            <div class="fd-backup__card-body">
                <div class="fd-backup__feature">
                    <div class="fd-backup__icon-wrap fd-backup__icon-wrap--import">
                        <el-icon :size="22">
                            <Upload />
                        </el-icon>
                    </div>
                    <div class="fd-backup__feature-info">
                        <h3 class="fd-backup__feature-title">数据导入</h3>
                        <p class="fd-backup__feature-desc">
                            选择之前导出的备份文件，恢复数据到新设备
                        </p>
                    </div>
                </div>

                <div class="fd-backup__tips">
                    <p>支持合并（智能去重）和覆盖两种模式</p>
                    <p>导入前请确认备份文件完整</p>
                    <p>操作成功后建议刷新页面</p>
                </div>

                <el-upload action="#" :auto-upload="false" accept=".json" :show-file-list="false"
                    :on-change="handleFileChange" class="fd-backup__upload">
                    <el-button class="fd-backup__action-btn fd-backup__action-btn--outline" :icon="Document">
                        选择备份文件
                    </el-button>
                </el-upload>
            </div>
        </div>

        <!-- 清除缓存 -->
        <div class="fd-backup__card">
            <div class="fd-backup__card-accent" :style="{ background: 'linear-gradient(90deg, #d2847a, #f5dedb)' }"
                aria-hidden="true" />
            <div class="fd-backup__card-body">
                <div class="fd-backup__feature">
                    <div class="fd-backup__icon-wrap fd-backup__icon-wrap--danger">
                        <el-icon :size="22">
                            <Warning />
                        </el-icon>
                    </div>
                    <div class="fd-backup__feature-info">
                        <h3 class="fd-backup__feature-title">清除缓存</h3>
                        <p class="fd-backup__feature-desc">
                            一键清除所有本地数据，操作前请确保已备份
                        </p>
                    </div>
                </div>

                <el-button class="fd-backup__action-btn fd-backup__action-btn--danger" :icon="Warning"
                    @click="handleClearCache">
                    清除全部数据
                </el-button>
            </div>
        </div>

        <!-- 导入成功提示 -->
        <el-alert v-if="importSuccess"
            :title="`导入成功：已恢复 ${importStats.items} 件物品、${importStats.cabinets} 个储物柜、${importStats.categories} 个分类`"
            type="success" show-icon :closable="false" class="fd-backup__alert" />

        <!-- 导入确认弹窗 -->
        <el-dialog v-model="importDialogVisible" title="确认导入数据" width="90%" :show-close="false"
            class="fd-backup__dialog" align-center>
            <template #default>
                <div class="fd-backup__dialog-body">
                    <p class="fd-backup__dialog-hint">
                        导入前请备份当前数据，此操作不可撤销。
                    </p>

                    <div v-if="importFile" class="fd-backup__file">
                        <el-icon :size="18" color="#4a9e88">
                            <Document />
                        </el-icon>
                        <span class="fd-backup__file-name">{{ importFile.name }}</span>
                    </div>

                    <div class="fd-backup__mode">
                        <p class="fd-backup__mode-label">导入模式</p>
                        <el-radio-group v-model="importMode" class="fd-backup__radio-group">
                            <el-radio label="MERGE" border class="fd-backup__radio">
                                <div class="fd-backup__radio-body">
                                    <span class="fd-backup__radio-title">合并模式</span>
                                    <span class="fd-backup__radio-desc">智能去重，以新数据为准</span>
                                </div>
                            </el-radio>
                            <el-radio label="OVERWRITE" border class="fd-backup__radio">
                                <div class="fd-backup__radio-body">
                                    <span class="fd-backup__radio-title">覆盖模式</span>
                                    <span class="fd-backup__radio-desc">清空现有数据后恢复</span>
                                </div>
                            </el-radio>
                        </el-radio-group>
                    </div>

                    <el-alert v-if="importError" :title="importError" type="error" show-icon :closable="false" />
                </div>
            </template>

            <template #footer>
                <div class="fd-backup__dialog-footer">
                    <el-button class="fd-backup__dialog-btn" @click="cancelImport">
                        取消
                    </el-button>
                    <el-button type="primary" class="fd-backup__dialog-btn fd-backup__dialog-btn--primary"
                        :loading="isImporting" @click="handleImport">
                        {{ isImporting ? '正在导入...' : '确认导入' }}
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<style lang="less" scoped>
/*
   fd-backup — 数据备份
   温暖有机｜蓝绿护眼｜与 fd-home / fd-search 同频
   ----------------------------------------------------------- */

.fd-backup {
    --bk-bg: #f3f9f6;
    --bk-ink: #2d4139;
    --bk-ink-soft: #5f7d72;
    --bk-ink-ghost: #8ca89e;
    --bk-green: #4a9e88;
    --bk-green-light: #9ed7c8;
    --bk-green-pale: #d4ece6;
    --bk-card-bg: rgba(255, 255, 255, 0.72);
    --bk-card-border: rgba(74, 158, 136, 0.10);
    --bk-card-shadow: 0 2px 8px rgba(45, 130, 110, 0.05);
    --bk-card-hover-shadow: 0 6px 20px rgba(45, 130, 110, 0.10);

    position: relative;
    min-height: 100%;
    padding: 1rem 0.875rem 1.5rem;
    background: var(--bk-bg);
    background-image:
        radial-gradient(circle at 12% 10%, rgba(158, 215, 200, 0.10) 0%, transparent 40%),
        radial-gradient(circle at 88% 90%, rgba(212, 236, 230, 0.25) 0%, transparent 45%);
    color: var(--bk-ink);

    /* ---------- 顶部导航 ---------- */
    &__header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    &__back {
        width: 2.25rem;
        height: 2.25rem;
        color: var(--bk-ink-soft);

        &:hover {
            color: var(--bk-green);
            background: rgba(74, 158, 136, 0.06);
        }
    }

    &__title {
        font-size: 1.125rem;
        font-weight: 600;
        margin: 0;
        color: var(--bk-ink);
    }

    /* ---------- 分区标题 ---------- */
    &__section {
        margin-bottom: 0.875rem;
    }

    &__section-title {
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--bk-ink);
        margin: 0 0 0.625rem;
    }

    /* ---------- 概览卡片 ---------- */
    &__summary {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.625rem;
    }

    &__summary-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.875rem 0.5rem;
        border: 1px solid var(--bk-card-border);
        border-radius: 1rem;
        background: var(--bk-card-bg);
        backdrop-filter: blur(10px);
        box-shadow: var(--bk-card-shadow);
        transition: box-shadow 0.25s ease;

        &:hover {
            box-shadow: var(--bk-card-hover-shadow);
        }
    }

    &__summary-num {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--bk-green);
        line-height: 1.2;
    }

    &__summary-label {
        font-size: 0.75rem;
        color: var(--bk-ink-ghost);
        margin-top: 0.25rem;
    }

    /* ---------- 功能卡片 ---------- */
    &__card {
        position: relative;
        border: 1px solid var(--bk-card-border);
        border-radius: 1rem;
        background: var(--bk-card-bg);
        backdrop-filter: blur(12px) saturate(130%);
        box-shadow: var(--bk-card-shadow);
        overflow: hidden;
        margin-bottom: 0.875rem;
        transition: box-shadow 0.3s ease, border-color 0.3s ease;

        &:hover {
            box-shadow: var(--bk-card-hover-shadow);
            border-color: rgba(74, 158, 136, 0.18);
        }
    }

    &__card-accent {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--bk-green), var(--bk-green-light));
        opacity: 0.55;
        border-radius: 1rem 1rem 0 0;
        pointer-events: none;
    }

    &__card-body {
        position: relative;
        z-index: 1;
        padding: 1rem 0.875rem 0.875rem;
    }

    /* ---------- 功能行 ---------- */
    &__feature {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
    }

    &__icon-wrap {
        width: 2.75rem;
        height: 2.75rem;
        border-radius: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: var(--bk-green);
        background: rgba(74, 158, 136, 0.08);

        &--import {
            color: #d4a373;
            background: rgba(212, 163, 115, 0.12);
        }

        &--danger {
            color: #d2847a;
            background: rgba(210, 132, 122, 0.10);
        }
    }

    &__feature-info {
        flex: 1;
        min-width: 0;
    }

    &__feature-title {
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--bk-ink);
        margin: 0 0 0.125rem;
    }

    &__feature-desc {
        font-size: 0.8125rem;
        color: var(--bk-ink-ghost);
        margin: 0;
        line-height: 1.4;
    }

    /* ---------- 提示 ---------- */
    &__tips {
        background: rgba(74, 158, 136, 0.04);
        border-radius: 0.75rem;
        padding: 0.625rem 0.75rem;
        margin-bottom: 0.875rem;

        p {
            margin: 0;
            font-size: 0.75rem;
            color: var(--bk-ink-ghost);
            line-height: 1.6;

            &::before {
                content: '•';
                margin-right: 0.375rem;
                color: var(--bk-green-light);
            }
        }
    }

    /* ---------- 操作按钮 ---------- */
    &__action-btn {
        width: 100%;
        height: 2.75rem;
        border-radius: 0.75rem !important;
        font-weight: 500;
        font-size: 0.9375rem;
        background: linear-gradient(135deg, var(--bk-green), #5aad96) !important;
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

        &--outline {
            background: transparent !important;
            border: 1.5px dashed rgba(74, 158, 136, 0.35) !important;
            box-shadow: none !important;
            color: var(--bk-green) !important;

            :deep(.el-icon) {
                color: var(--bk-green) !important;
            }

            &:hover {
                border-color: var(--bk-green) !important;
                background: rgba(74, 158, 136, 0.04) !important;
                box-shadow: none !important;
                transform: translateY(-1px);
            }
        }

        &--danger {
            background: linear-gradient(135deg, #d2847a, #c06a60) !important;
            box-shadow: 0 2px 8px rgba(210, 132, 122, 0.25) !important;

            &:hover {
                box-shadow: 0 4px 12px rgba(210, 132, 122, 0.32) !important;
            }
        }
    }

    /* ---------- 上传组件 ---------- */
    &__upload {
        :deep(.el-upload) {
            display: block;
        }
    }

    /* ---------- 进度条 ---------- */
    &__progress {
        margin-top: 0.75rem;

        :deep(.el-progress-bar__inner) {
            border-radius: 999px;
        }

        :deep(.el-progress-bar__outer) {
            border-radius: 999px;
            background: rgba(74, 158, 136, 0.1);
        }
    }

    &__progress-text {
        margin: 0.375rem 0 0;
        font-size: 0.75rem;
        color: var(--bk-ink-ghost);
        text-align: center;
    }

    /* ---------- 成功提示 ---------- */
    &__alert {
        border-radius: 0.75rem;
        margin-bottom: 0.75rem;

        :deep(.el-alert__content) {
            padding: 0;
        }
    }

    /* ---------- 导入弹窗 ---------- */
    &__dialog {
        :deep(.el-dialog) {
            border-radius: 1rem;
            overflow: hidden;
        }

        :deep(.el-dialog__header) {
            margin-right: 0;
            padding: 1rem 1.25rem 0.75rem;
            border-bottom: 1px solid rgba(74, 158, 136, 0.08);
        }

        :deep(.el-dialog__title) {
            font-size: 1rem;
            font-weight: 600;
            color: var(--bk-ink);
        }

        :deep(.el-dialog__body) {
            padding: 0;
        }

        :deep(.el-dialog__footer) {
            padding: 0.75rem 1.25rem 1rem;
            border-top: 1px solid rgba(74, 158, 136, 0.08);
        }
    }

    &__dialog-body {
        padding: 1rem 1.25rem;
    }

    &__dialog-hint {
        margin: 0 0 0.75rem;
        font-size: 0.8125rem;
        color: var(--bk-ink-soft);
        line-height: 1.5;
    }

    &__file {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.625rem 0.75rem;
        background: rgba(74, 158, 136, 0.04);
        border-radius: 0.625rem;
        margin-bottom: 0.75rem;
    }

    &__file-name {
        font-size: 0.8125rem;
        color: var(--bk-ink);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    &__mode {
        margin-bottom: 0.75rem;
    }

    &__mode-label {
        margin: 0 0 0.5rem;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--bk-ink-soft);
    }

    &__radio-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
    }

    &__radio {
        margin-right: 0;
        width: 100%;
        height: auto;
        padding: 0.625rem 0.75rem;
        border-radius: 0.625rem;

        :deep(.el-radio__input) {
            align-self: center;
        }

        :deep(.el-radio__label) {
            padding-left: 0.5rem;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    &__radio-body {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
    }

    &__radio-title {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--bk-ink);
    }

    &__radio-desc {
        font-size: 0.75rem;
        color: var(--bk-ink-ghost);
    }

    &__dialog-footer {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    &__dialog-btn {
        width: 100%;
        height: 2.5rem;
        border-radius: 0.75rem !important;
        font-weight: 500;

        &--primary {
            background: linear-gradient(135deg, var(--bk-green), #5aad96) !important;
            border: none !important;
        }
    }
}
</style>
