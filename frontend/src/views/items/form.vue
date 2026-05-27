<template>
    <div class="fd-item-form">
        <!-- 表单内容 -->
        <div class="fd-item-form__body">
            <!-- 物品名称 -->
            <div class="fd-item-form__field">
                <label class="fd-item-form__label">
                    物品名称 <span class="fd-item-form__required">*</span>
                </label>
                <el-input v-model="draft.name" placeholder="请输入物品名称" maxlength="50" show-word-limit
                    :class="{ 'fd-item-form__input--error': nameError }" @blur="validateName" />
                <span v-if="nameError" class="fd-item-form__error">{{ nameError }}</span>
            </div>

            <!-- 分类 -->
            <div class="fd-item-form__field">
                <label class="fd-item-form__label">
                    分类 <span class="fd-item-form__required">*</span>
                </label>
                <el-select v-model="draft.categoryId" placeholder="请选择分类" style="width: 100%">
                    <el-option v-for="cat in categoriesOptions" :key="cat.id" :label="cat.name" :value="cat.id" />
                </el-select>
            </div>

            <!-- 照片上传（缩略图占比大） -->
            <div class="fd-item-form__field">
                <label class="fd-item-form__label">
                    照片 <span class="fd-item-form__hint">（最多 {{ MAX_PHOTOS }} 张）</span>
                </label>
                <div class="fd-item-form__photos">
                    <!-- 已上传缩略图 -->
                    <div v-for="(photo, idx) in draft.photos" :key="idx" class="fd-item-form__photo-item">
                        <img :src="photo" alt="" @click="previewPhoto(photo)" />
                        <button type="button" class="fd-item-form__photo-remove" @click="removePhoto(idx)">
                            <el-icon :size="14">
                                <Close />
                            </el-icon>
                        </button>
                    </div>
                    <!-- 上传按钮 -->
                    <el-upload v-if="draft.photos.length < MAX_PHOTOS" class="fd-item-form__photo-upload"
                        :auto-upload="false" :show-file-list="false" accept="image/*" :on-change="handleFileChange">
                        <div class="fd-item-form__photo-upload-inner">
                            <el-icon :size="24">
                                <Plus />
                            </el-icon>
                            <span>上传</span>
                        </div>
                    </el-upload>
                </div>
            </div>

            <!-- 存放日期 -->
            <div class="fd-item-form__field">
                <label class="fd-item-form__label">
                    存放日期 <span class="fd-item-form__required">*</span>
                </label>
                <el-date-picker v-model="draft.storageDate" type="date" placeholder="选择存放日期" value-format="YYYY-MM-DD"
                    style="width: 100%" />
            </div>

            <!-- 储物柜 -->
            <div class="fd-item-form__field">
                <label class="fd-item-form__label">
                    储物柜 <span class="fd-item-form__required">*</span>
                </label>
                <el-select v-model="draft.cabinetId" placeholder="请选择储物柜" style="width: 100%">
                    <el-option v-for="cab in cabinetsOptions" :key="cab.id" :label="cab.name" :value="cab.id" />
                </el-select>
            </div>

            <!-- 备注 -->
            <div class="fd-item-form__field">
                <label class="fd-item-form__label">备注</label>
                <el-input v-model="draft.note" type="textarea" :rows="3" maxlength="200" show-word-limit
                    placeholder="请输入备注信息（可选）" />
            </div>
        </div>

        <!-- 底部保存按钮 -->
        <div class="fd-item-form__footer">
            <el-button type="primary" class="fd-item-form__save" :loading="saving" @click="handleSave">
                <el-icon :size="16">
                    <Check />
                </el-icon>
                <span>保存</span>
            </el-button>
        </div>

        <!-- 图片预览 -->
        <el-dialog v-model="previewVisible" :show-close="true" :modal="true" :append-to-body="true" align-center
            width="90%" class="fd-item-form__preview">
            <img v-if="previewUrl" :src="previewUrl" class="fd-item-form__preview-img" alt="" />
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { ElMessage, ElMessageBox, ElUpload } from 'element-plus'
import type { UploadFile } from 'element-plus'
import {
    Plus,
    Close,
    Check,
} from '@element-plus/icons-vue'
import { useItemForm } from './form.ts'
import { useItemsStore } from '@/stores/items'

const router = useRouter()
const itemsStore = useItemsStore()

const {
    draft,
    isEdit,
    itemId,
    isDirty,
    nameError,
    validate,
    validateName,
    handleUpload,
    removePhoto,
    buildPayload,
    categoriesOptions,
    cabinetsOptions,
} = useItemForm()

const MAX_PHOTOS = 3
const saving = ref(false)
const skipGuard = ref(false)
const previewVisible = ref(false)
const previewUrl = ref('')

function previewPhoto(url: string) {
    previewUrl.value = url
    previewVisible.value = true
}

async function handleFileChange(uploadFile: UploadFile) {
    if (!uploadFile.raw) return
    if (draft.value.photos.length >= MAX_PHOTOS) {
        ElMessage.warning(`最多上传 ${MAX_PHOTOS} 张照片`)
        return
    }
    const base64 = await handleUpload(uploadFile.raw)
    if (base64) {
        draft.value.photos.push(base64)
        ElMessage.success('上传成功')
    } else {
        ElMessage.error('图片处理失败')
    }
}

async function handleSave() {
    const error = validate()
    if (error) {
        ElMessage.warning(error)
        // 聚焦第一个无效字段
        const firstInput = document.querySelector('.fd-item-form__input--error input') as HTMLElement
        firstInput?.focus()
        return
    }

    saving.value = true
    try {
        const payload = buildPayload()
        if (isEdit.value && itemId.value) {
            await itemsStore.updateItem(itemId.value, payload)
            ElMessage.success('保存成功')
        } else {
            await itemsStore.addItem(payload)
            ElMessage.success('新增成功')
        }
        skipGuard.value = true
        router.push('/items')
    } catch {
        ElMessage.error('保存失败')
    } finally {
        saving.value = false
    }
}

// 未保存更改守卫：点击保存后 skipGuard=true，直接放行不再弹窗
onBeforeRouteLeave((_to, _from, next) => {
    if (skipGuard.value || !isDirty.value) {
        next()
        return
    }
    ElMessageBox.confirm(
        '有未保存的更改，确定要离开吗？',
        '提示',
        { confirmButtonText: '离开', cancelButtonText: '取消', type: 'warning' },
    )
        .then(() => next())
        .catch(() => next(false))
})
</script>

<style lang="less" scoped>
.fd-item-form {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--fd-cozy-cream);
    font-family: var(--fd-cozy-font-body);

    // 顶部导航
    &__nav {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        flex-shrink: 0;
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

    // 表单体
    &__body {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        -webkit-overflow-scrolling: touch;
    }

    &__field {
        margin-bottom: 16px;
        animation: fd-form-field-enter 0.35s ease forwards;
        opacity: 0;
        transform: translateY(8px);

        &:nth-child(1) {
            animation-delay: 0.03s;
        }

        &:nth-child(2) {
            animation-delay: 0.06s;
        }

        &:nth-child(3) {
            animation-delay: 0.09s;
        }

        &:nth-child(4) {
            animation-delay: 0.12s;
        }

        &:nth-child(5) {
            animation-delay: 0.15s;
        }

        &:nth-child(6) {
            animation-delay: 0.18s;
        }
    }

    @keyframes fd-form-field-enter {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    &__label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: var(--fd-cozy-ink);
        margin-bottom: 6px;
    }

    &__required {
        color: #ef5350;
    }

    &__hint {
        font-size: 12px;
        font-weight: 400;
        color: var(--fd-cozy-ink-soft);
    }

    &__error {
        display: block;
        font-size: 12px;
        color: #ef5350;
        margin-top: 4px;
    }

    &__input--error {
        :deep(.el-input__wrapper) {
            box-shadow: 0 0 0 1px #ef5350 inset;
        }
    }

    // 照片区（缩略图占比大）
    &__photos {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }

    &__photo-item {
        width: 100px;
        height: 100px;
        border-radius: 14px;
        overflow: hidden;
        position: relative;
        flex-shrink: 0;
        border: 1px solid var(--fd-cozy-butter);

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            cursor: pointer;

            &:hover {
                transform: scale(1.05);
            }
        }
    }

    &__photo-remove {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.5);
        color: #fff;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        &:hover {
            background: rgba(0, 0, 0, 0.7);
        }
    }

    &__photo-upload {
        width: 100px;
        height: 100px;
        flex-shrink: 0;

        :deep(.el-upload) {
            width: 100%;
            height: 100%;
        }
    }

    &__photo-upload-inner {
        width: 100%;
        height: 100%;
        border-radius: 14px;
        border: 2px dashed var(--fd-cozy-butter);
        background: var(--fd-cozy-cream-deep);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: var(--fd-cozy-amber);
        cursor: pointer;
        transition: all 0.2s;
        font-size: 12px;

        &:hover {
            border-color: var(--fd-cozy-amber);
            background: var(--fd-cozy-glass);
        }
    }

    // 底部保存
    &__footer {
        flex-shrink: 0;
        padding: 12px 16px;
        background: var(--fd-cozy-glass);
        backdrop-filter: blur(12px);
        border-top: 1px solid var(--fd-cozy-butter);
    }

    &__save {
        width: 100%;
        height: 48px;
        border-radius: 14px;
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        background: var(--fd-cozy-amber-deep);
        border: none;

        &:hover {
            background: var(--fd-cozy-amber);
        }
    }

    // 表单输入框统一风格
    :deep(.el-input__wrapper),
    :deep(.el-textarea__inner),
    :deep(.el-select .el-input__wrapper) {
        border-radius: 12px;
        background: var(--fd-cozy-white);
        box-shadow: 0 1px 4px rgba(45, 138, 120, 0.06);
        border: 1px solid var(--fd-cozy-butter);
    }

    :deep(.el-input__inner),
    :deep(.el-textarea__inner) {
        font-size: 14px;
        color: var(--fd-cozy-ink);
    }

    :deep(.el-input__count) {
        background: transparent;
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
}
</style>
