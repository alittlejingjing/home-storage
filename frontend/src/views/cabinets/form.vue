<template>
    <div class="fd-cabinet-form">
        <!-- 表单体 -->
        <div class="fd-cabinet-form__body">
            <!-- 储物柜名称 -->
            <div class="fd-cabinet-form__field">
                <label class="fd-cabinet-form__label">
                    储物柜名称 <span class="fd-cabinet-form__required">*</span>
                </label>
                <el-input v-model="draft.name" placeholder="请输入储物柜名称" maxlength="30" show-word-limit
                    :class="{ 'fd-cabinet-form__input--error': nameError }" @blur="validateName" />
                <span v-if="nameError" class="fd-cabinet-form__error">{{ nameError }}</span>
            </div>

            <!-- 照片上传 -->
            <div class="fd-cabinet-form__field">
                <label class="fd-cabinet-form__label">
                    照片 <span class="fd-cabinet-form__hint">（最多 {{ MAX_PHOTOS }} 张）</span>
                </label>
                <div class="fd-cabinet-form__photos">
                    <div v-for="(photo, idx) in draft.photos" :key="idx" class="fd-cabinet-form__photo-item">
                        <img :src="photo" alt="" @click="previewPhoto(photo)" />
                        <button type="button" class="fd-cabinet-form__photo-remove" @click="removePhoto(idx)">
                            <el-icon :size="14">
                                <Close />
                            </el-icon>
                        </button>
                    </div>
                    <el-upload v-if="draft.photos.length < MAX_PHOTOS" class="fd-cabinet-form__photo-upload"
                        :auto-upload="false" :show-file-list="false" accept="image/*" :on-change="handleFileChange">
                        <div class="fd-cabinet-form__photo-upload-inner">
                            <el-icon :size="24">
                                <Plus />
                            </el-icon>
                            <span>上传</span>
                        </div>
                    </el-upload>
                </div>
            </div>

            <!-- 位置描述 -->
            <div class="fd-cabinet-form__field">
                <label class="fd-cabinet-form__label">位置描述</label>
                <el-input v-model="draft.location" type="textarea" :rows="3" placeholder="请输入储物柜的详细位置描述（可选）" />
            </div>
        </div>

        <!-- 底部保存按钮 -->
        <div class="fd-cabinet-form__footer">
            <el-button type="primary" class="fd-cabinet-form__save" :loading="saving" @click="handleSave">
                <el-icon :size="16">
                    <Check />
                </el-icon>
                <span>保存</span>
            </el-button>
        </div>

        <!-- 图片预览 -->
        <el-dialog v-model="previewVisible" :show-close="true" :modal="true" :append-to-body="true" align-center
            width="90%" class="fd-cabinet-form__preview">
            <img v-if="previewUrl" :src="previewUrl" class="fd-cabinet-form__preview-img" alt="" />
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
import { useCabinetForm } from './form.ts'
import { useCabinetsStore } from '@/stores/cabinets'

const router = useRouter()
const cabinetsStore = useCabinetsStore()

const {
    draft,
    isEdit,
    cabinetId,
    isDirty,
    nameError,
    validate,
    validateName,
    handleUpload,
    removePhoto,
    buildPayload,
} = useCabinetForm()

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
        const firstInput = document.querySelector('.fd-cabinet-form__input--error input') as HTMLElement
        firstInput?.focus()
        return
    }

    saving.value = true
    try {
        const payload = buildPayload()
        if (isEdit.value && cabinetId.value) {
            await cabinetsStore.updateCabinet(cabinetId.value, payload)
            ElMessage.success('保存成功')
        } else {
            await cabinetsStore.addCabinet(payload)
            ElMessage.success('新增成功')
        }
        skipGuard.value = true
        router.push('/cabinets')
    } catch (err) {
        const message = err instanceof Error ? err.message : '保存失败'
        ElMessage.error(message)
    } finally {
        saving.value = false
    }
}

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
.fd-cabinet-form {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--fd-cozy-cream);
    font-family: var(--fd-cozy-font-body);

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

    :deep(.el-input__wrapper),
    :deep(.el-textarea__inner) {
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
