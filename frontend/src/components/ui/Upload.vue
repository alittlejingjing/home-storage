<script setup lang="ts">
import { ref } from 'vue'
import { Upload as UploadIcon, X, File, Image, FileText, Film, Music, Archive, CheckCircle2, AlertCircle, Loader2 } from 'lucide-vue-next'
import { cn } from '@/utils/cn'
import Button from './Button.vue'

export interface UploadFile {
  id: string
  file: File
  name: string
  size: number
  type: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress?: number
  error?: string
  url?: string
}

const props = withDefaults(defineProps<{
  maxSize?: number
  maxCount?: number
  accept?: string
  multiple?: boolean
  disabled?: boolean
  hint?: string
  showFileList?: boolean
  variant?: 'default' | 'compact' | 'avatar'
  class?: string
}>(), {
  maxSize: 10 * 1024 * 1024,
  multiple: false,
  disabled: false,
  showFileList: true,
  variant: 'default',
})

const emit = defineEmits<{
  fileChange: [files: File[]]
  upload: [files: File[]]
  remove: [file: UploadFile]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)
const fileList = ref<UploadFile[]>([])

const generateId = () => Math.random().toString(36).substring(2, 9)

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image
  if (type.startsWith('video/')) return Film
  if (type.startsWith('audio/')) return Music
  if (type.includes('pdf') || type.includes('document') || type.includes('text')) return FileText
  if (type.includes('zip') || type.includes('rar') || type.includes('tar') || type.includes('7z')) return Archive
  return File
}

const validateFile = (file: File): string | null => {
  if (props.maxSize && file.size > props.maxSize) {
    return `文件大小超过限制（最大 ${formatFileSize(props.maxSize)}）`
  }
  if (props.accept) {
    const acceptTypes = props.accept.split(',').map(t => t.trim())
    const fileType = file.type
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
    const isValid = acceptTypes.some(type => {
      if (type.startsWith('.')) return fileExt === type.toLowerCase()
      if (type.endsWith('/*')) return fileType.startsWith(type.replace('/*', '/'))
      return fileType === type
    })
    if (!isValid) return '不支持的文件类型'
  }
  return null
}

const handleFiles = (files: FileList | File[]) => {
  const fileArray = Array.from(files)
  if (props.maxCount && fileList.value.length + fileArray.length > props.maxCount) {
    alert(`最多只能上传 ${props.maxCount} 个文件`)
    return
  }
  const validFiles: File[] = []
  fileArray.forEach(file => {
    const error = validateFile(file)
    const uploadFile: UploadFile = {
      id: generateId(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: error ? 'error' : 'pending',
      error: error || undefined,
    }
    fileList.value.push(uploadFile)
    if (!error) validFiles.push(file)
  })
  if (validFiles.length > 0) {
    emit('fileChange', validFiles)
    emit('upload', validFiles)
  }
}

const handleButtonClick = () => {
  if (props.disabled) return
  inputRef.value?.click()
}

const handleChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) handleFiles(files)
  if (inputRef.value) inputRef.value.value = ''
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  if (!props.disabled) isDragOver.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = false
  if (props.disabled) return
  const files = e.dataTransfer?.files
  if (files && files.length > 0) handleFiles(files)
}

const handleRemove = (uploadFile: UploadFile) => {
  fileList.value = fileList.value.filter(f => f.id !== uploadFile.id)
  emit('remove', uploadFile)
}
</script>

<template>
  <div :class="cn('space-y-4', props.class)">
    <input
      ref="inputRef"
      type="file"
      class="hidden"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      @change="handleChange"
    />

    <!-- 紧凑模式 -->
    <template v-if="variant === 'compact'">
      <Button type="button" variant="outline" size="sm" :disabled="disabled" class="gap-2" @click="handleButtonClick">
        <UploadIcon class="h-4 w-4" />
        选择文件
      </Button>
    </template>

    <!-- 头像上传模式 -->
    <template v-else-if="variant === 'avatar'">
      <div
        :class="cn(
          'relative w-24 h-24 rounded-full border-2 border-dashed cursor-pointer transition-all duration-200',
          'flex items-center justify-center overflow-hidden group',
          isDragOver ? 'border-primary bg-primary/10 scale-105' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )"
        @click="handleButtonClick"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <div class="flex flex-col items-center text-muted-foreground">
          <UploadIcon class="h-6 w-6 mb-1" />
          <span class="text-xs">上传头像</span>
        </div>
      </div>
    </template>

    <!-- 默认拖拽区域模式 -->
    <template v-else>
      <div
        :class="cn(
          'relative border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300',
          'flex flex-col items-center justify-center py-10 px-6',
          'bg-gradient-to-b from-muted/30 to-muted/10',
          isDragOver
            ? 'border-primary bg-primary/5 scale-[1.02] shadow-lg shadow-primary/10'
            : 'border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/30 hover:shadow-md',
          disabled && 'opacity-50 cursor-not-allowed hover:border-muted-foreground/20 hover:bg-transparent hover:shadow-none'
        )"
        @click="handleButtonClick"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <!-- 上传图标 -->
        <div :class="cn(
          'relative mb-4 p-4 rounded-full transition-all duration-300',
          isDragOver ? 'bg-primary/15 scale-110' : 'bg-muted/50'
        )">
          <UploadIcon :class="cn('h-8 w-8 transition-colors duration-300', isDragOver ? 'text-primary' : 'text-muted-foreground')" />
        </div>

        <!-- 文字提示 -->
        <div class="text-center space-y-2">
          <p :class="cn('text-sm font-medium transition-colors', isDragOver ? 'text-primary' : 'text-foreground')">
            {{ isDragOver ? '释放文件以上传' : '拖拽文件到此处上传' }}
          </p>
          <p class="text-xs text-muted-foreground">
            或 <span class="text-primary hover:underline">点击选择文件</span>
          </p>
        </div>

        <!-- 提示信息 -->
        <div v-if="hint || maxSize || accept" class="mt-4 pt-4 border-t border-border/50 text-center">
          <p class="text-xs text-muted-foreground">
            {{ hint || '' }}
            <template v-if="!hint">
              <span v-if="accept">支持 {{ accept.replace(/\./g, '').replace(/,/g, ', ') }} 格式</span>
              <span v-if="accept && maxSize" class="mx-1">·</span>
              <span v-if="maxSize">最大 {{ formatFileSize(maxSize) }}</span>
              <span v-if="maxCount" class="mx-1">·</span>
              <span v-if="maxCount">最多 {{ maxCount }} 个文件</span>
            </template>
          </p>
        </div>
      </div>

      <!-- 文件列表 -->
      <div v-if="showFileList && fileList.length > 0" class="space-y-2">
        <div
          v-for="uploadFile in fileList"
          :key="uploadFile.id"
          :class="cn(
            'flex items-center gap-3 p-3 rounded-lg border transition-all',
            'bg-card hover:bg-muted/30',
            uploadFile.status === 'error' && 'border-destructive/50 bg-destructive/5',
            uploadFile.status === 'success' && 'border-green-500/50 bg-green-500/5'
          )"
        >
          <!-- 文件图标 -->
          <div :class="cn(
            'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
            uploadFile.status === 'error' ? 'bg-destructive/10 text-destructive' :
            uploadFile.status === 'success' ? 'bg-green-500/10 text-green-600' :
            'bg-primary/10 text-primary'
          )">
            <Loader2 v-if="uploadFile.status === 'uploading'" class="h-5 w-5 animate-spin" />
            <CheckCircle2 v-else-if="uploadFile.status === 'success'" class="h-5 w-5" />
            <AlertCircle v-else-if="uploadFile.status === 'error'" class="h-5 w-5" />
            <component v-else :is="getFileIcon(uploadFile.type)" class="h-5 w-5" />
          </div>

          <!-- 文件信息 -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ uploadFile.name }}</p>
            <p :class="cn('text-xs', uploadFile.status === 'error' ? 'text-destructive' : 'text-muted-foreground')">
              {{ uploadFile.status === 'error' ? uploadFile.error :
                 uploadFile.status === 'uploading' ? `上传中 ${uploadFile.progress || 0}%` :
                 uploadFile.status === 'success' ? '上传成功' :
                 formatFileSize(uploadFile.size) }}
            </p>
          </div>

          <!-- 进度条 -->
          <div v-if="uploadFile.status === 'uploading' && uploadFile.progress !== undefined" class="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
            <div class="h-full bg-primary transition-all duration-300 rounded-full" :style="{ width: `${uploadFile.progress}%` }" />
          </div>

          <!-- 删除按钮 -->
          <button
            type="button"
            class="flex-shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            @click.stop="handleRemove(uploadFile)"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
