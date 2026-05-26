<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useItemsStore, type Item } from '@/stores/items'
import { useCabinetsStore, type Cabinet } from '@/stores/cabinets'
import { useCategoriesStore, type Category } from '@/stores/categories'
import {
  Card,
  CardContent,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Alert,
  AlertTitle,
  AlertDescription,
  RadioGroup,
  RadioGroupItem,
  Label,
} from '@/components/ui'
import {
  Download as DownloadIcon,
  Upload as UploadIcon,
  FileJson as FileJsonIcon,
  AlertTriangle as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon,
  RefreshCw as RefreshCwIcon,
  ChevronLeft as ChevronLeftIcon,
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const itemsStore = useItemsStore()
const cabinetsStore = useCabinetsStore()
const categoriesStore = useCategoriesStore()

// 导出进度状态
const exportProgress = ref(0)
const isExporting = ref(false)
const exportSuccess = ref(false)

// 导入状态
const importDialogOpen = ref(false)
const importMode = ref<'merge' | 'overwrite'>('merge')
const importFile = ref<File | null>(null)
const importError = ref('')
const isImporting = ref(false)
const importSuccess = ref(false)
const importStats = ref({ items: 0, cabinets: 0, categories: 0 })

const fileInputRef = ref<HTMLInputElement | null>(null)

interface BackupData {
  version: string
  exportTime: string
  user: { name: string; email: string }
  items: Item[]
  cabinets: Cabinet[]
  categories: Category[]
}

const dataSummary = computed(() => [
  { label: '物品', count: itemsStore.totalCount },
  { label: '储物柜', count: cabinetsStore.totalCount },
  { label: '分类', count: categoriesStore.categories.length },
])

function goBack() {
  router.push('/profile')
}

// 读取 localStorage 中的原始照片数据
function getPhotoFromStorage(itemId: string, index: number): string | null {
  try {
    const key = `jiaxiang-photo-${itemId}-${index}`
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function getCabinetPhotoFromStorage(cabinetId: string, index: number): string | null {
  try {
    const key = `jiaxiang-cabinet-photo-${cabinetId}-${index}`
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

async function handleExport() {
  isExporting.value = true
  exportProgress.value = 10

  // 收集照片数据
  const itemPhotos: Record<string, string[]> = {}
  for (const item of itemsStore.items) {
    const photos: string[] = []
    for (let i = 0; i < item.photos.length; i++) {
      const photo = getPhotoFromStorage(item.id, i)
      if (photo) {
        photos.push(photo)
      } else if (item.photos[i]?.startsWith('data:')) {
        photos.push(item.photos[i])
      }
    }
    if (photos.length > 0) itemPhotos[item.id] = photos
  }

  const cabinetPhotos: Record<string, string[]> = {}
  for (const cab of cabinetsStore.cabinets) {
    const photos: string[] = []
    for (let i = 0; i < cab.photos.length; i++) {
      const photo = getCabinetPhotoFromStorage(cab.id, i)
      if (photo) {
        photos.push(photo)
      } else if (cab.photos[i]?.startsWith('data:')) {
        photos.push(cab.photos[i])
      }
    }
    if (photos.length > 0) cabinetPhotos[cab.id] = photos
  }

  exportProgress.value = 50

  const backupData: BackupData & { itemPhotos: Record<string, string[]>; cabinetPhotos: Record<string, string[]> } = {
    version: '1.0',
    exportTime: new Date().toISOString(),
    user: { name: authStore.user?.name ?? '', email: authStore.user?.email ?? '' },
    items: itemsStore.items,
    cabinets: cabinetsStore.cabinets,
    categories: categoriesStore.categories,
    itemPhotos,
    cabinetPhotos,
  }

  exportProgress.value = 80

  const jsonStr = JSON.stringify(backupData, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const filename = `家享收纳备份_${timestamp}.json`

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  exportProgress.value = 100
  exportSuccess.value = true
  isExporting.value = false

  setTimeout(() => {
    exportSuccess.value = false
    exportProgress.value = 0
  }, 3000)
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  importFile.value = file
  importError.value = ''
  importSuccess.value = false
  importDialogOpen.value = true

  // 重置 input
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

async function handleImport() {
  if (!importFile.value) return

  isImporting.value = true
  importError.value = ''

  try {
    const text = await importFile.value.text()
    const data = JSON.parse(text) as BackupData & { itemPhotos?: Record<string, string[]>; cabinetPhotos?: Record<string, string[]> }

    // R017: 校验必填字段
    if (!data.version || !data.items || !Array.isArray(data.items)) {
      throw new Error('备份文件格式错误：缺少必要的 items 字段')
    }
    if (!data.cabinets || !Array.isArray(data.cabinets)) {
      throw new Error('备份文件格式错误：缺少必要的 cabinets 字段')
    }
    if (!data.categories || !Array.isArray(data.categories)) {
      throw new Error('备份文件格式错误：缺少必要的 categories 字段')
    }

    // R018: 导入策略
    if (importMode.value === 'overwrite') {
      // 覆盖模式：清空现有数据
      itemsStore.items = []
      cabinetsStore.cabinets = []
      categoriesStore.categories = []
      // 清除照片存储
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('jiaxiang-photo-') || key.startsWith('jiaxiang-cabinet-photo-')) {
          localStorage.removeItem(key)
        }
      })
    }

    // 导入分类
    for (const cat of data.categories) {
      if (!cat.id || !cat.name) continue
      const exists = categoriesStore.categories.some(c => c.id === cat.id || c.name === cat.name)
      if (!exists) {
        categoriesStore.categories.push({
          ...cat,
          sortOrder: cat.sortOrder ?? categoriesStore.categories.length + 1,
        })
      } else if (importMode.value === 'overwrite') {
        const idx = categoriesStore.categories.findIndex(c => c.id === cat.id)
        if (idx >= 0) {
          categoriesStore.categories[idx] = cat
        }
      }
    }

    // 导入储物柜
    for (const cab of data.cabinets) {
      if (!cab.id || !cab.name) continue
      const exists = cabinetsStore.cabinets.some(c => c.id === cab.id)
      if (!exists) {
        cabinetsStore.cabinets.push(cab)
      } else if (importMode.value === 'overwrite') {
        const idx = cabinetsStore.cabinets.findIndex(c => c.id === cab.id)
        if (idx >= 0) {
          cabinetsStore.cabinets[idx] = cab
        }
      }
    }

    // 导入物品
    for (const item of data.items) {
      if (!item.id || !item.name) continue
      const exists = itemsStore.items.some(i => i.id === item.id)
      if (!exists) {
        itemsStore.items.push(item)
      } else if (importMode.value === 'overwrite') {
        const idx = itemsStore.items.findIndex(i => i.id === item.id)
        if (idx >= 0) {
          itemsStore.items[idx] = item
        }
      }
    }

    // 恢复照片
    if (data.itemPhotos) {
      for (const [itemId, photos] of Object.entries(data.itemPhotos)) {
        photos.forEach((photo, index) => {
          localStorage.setItem(`jiaxiang-photo-${itemId}-${index}`, photo)
        })
      }
    }
    if (data.cabinetPhotos) {
      for (const [cabId, photos] of Object.entries(data.cabinetPhotos)) {
        photos.forEach((photo, index) => {
          localStorage.setItem(`jiaxiang-cabinet-photo-${cabId}-${index}`, photo)
        })
      }
    }

    // 保存到存储
    localStorage.setItem('jiaxiang-items', JSON.stringify(itemsStore.items))
    localStorage.setItem('jiaxiang-cabinets', JSON.stringify(cabinetsStore.cabinets))
    localStorage.setItem('jiaxiang-categories', JSON.stringify(categoriesStore.categories))

    importStats.value = {
      items: data.items.length,
      cabinets: data.cabinets.length,
      categories: data.categories.length,
    }

    importSuccess.value = true
    importDialogOpen.value = false
  } catch (err: any) {
    importError.value = err.message || '导入失败，请检查文件格式'
  } finally {
    isImporting.value = false
  }
}
</script>

<template>
  <div class="page-container p-4 pb-6 space-y-5 h-full overflow-y-auto">
    <!-- 顶部导航（移动端风格） -->
    <div class="flex items-center gap-3 sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-2 -mx-4 px-4 -mt-4 pt-4">
      <button
        class="w-9 h-9 flex items-center justify-center rounded-full bg-muted active:bg-muted/80 transition-colors"
        @click="goBack"
      >
        <ChevronLeftIcon class="h-5 w-5 text-foreground" />
      </button>
      <h1 class="text-lg font-semibold">数据备份</h1>
    </div>

    <!-- 数据概览 -->
    <div class="space-y-3">
      <h2 class="text-base font-semibold px-1">当前数据</h2>
      <div class="grid grid-cols-3 gap-2.5">
        <Card
          v-for="s in dataSummary"
          :key="s.label"
          class="card-mobile border-0 shadow-sm text-center p-3 bg-card/80"
        >
          <p class="text-2xl font-bold text-foreground">{{ s.count }}</p>
          <p class="text-xs text-muted-foreground mt-1">{{ s.label }}</p>
        </Card>
      </div>
    </div>

    <!-- 导出区域 -->
    <Card class="card-mobile border-0 shadow-sm overflow-hidden">
      <CardContent class="p-5 space-y-4">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <DownloadIcon class="h-5 w-5 text-primary" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-semibold">数据导出</h3>
            <p class="text-sm text-muted-foreground mt-0.5">
              将全量数据打包为 JSON 文件下载到本地，包含物品、储物柜、分类及照片
            </p>
          </div>
        </div>

        <div class="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground space-y-1">
          <p>• 文件名自动包含时间戳</p>
          <p>• 照片将以 Base64 编码存储</p>
          <p>• 建议在换机前执行导出</p>
        </div>

        <Button
          class="w-full rounded-xl h-12 text-base font-medium"
          :disabled="isExporting"
          @click="handleExport"
        >
          <DownloadIcon v-if="!isExporting && !exportSuccess" class="h-4 w-4 mr-1.5" />
          <CheckCircleIcon v-else-if="exportSuccess" class="h-4 w-4 mr-1.5" />
          <RefreshCwIcon v-else class="h-4 w-4 mr-1.5 animate-spin" />
          {{ exportSuccess ? '导出成功' : isExporting ? '正在导出...' : '立即导出' }}
        </Button>

        <!-- 导出进度 -->
        <div v-if="isExporting" class="space-y-2">
          <div class="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              class="h-full bg-primary rounded-full transition-all duration-300"
              :style="{ width: exportProgress + '%' }"
            />
          </div>
          <p class="text-xs text-muted-foreground text-center">正在打包数据...</p>
        </div>
      </CardContent>
    </Card>

    <!-- 导入区域 -->
    <Card class="card-mobile border-0 shadow-sm overflow-hidden">
      <CardContent class="p-5 space-y-4">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <UploadIcon class="h-5 w-5 text-amber-600" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-semibold">数据导入</h3>
            <p class="text-sm text-muted-foreground mt-0.5">
              选择之前导出的备份文件，恢复数据到新设备
            </p>
          </div>
        </div>

        <div class="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground space-y-1">
          <p>• 支持合并（智能去重）和覆盖两种模式</p>
          <p>• 导入前请确认备份文件完整</p>
          <p>• 操作成功后建议刷新页面</p>
        </div>

        <!-- 文件选择按钮 -->
        <input
          ref="fileInputRef"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleFileSelect"
        >
        <Button
          variant="outline"
          class="w-full rounded-xl h-12 text-base font-medium border-dashed border-2 hover:border-primary hover:bg-primary/5"
          @click="fileInputRef?.click()"
        >
          <FileJsonIcon class="h-4 w-4 mr-1.5" />
          选择备份文件
        </Button>
      </CardContent>
    </Card>

    <!-- 导入成功提示 -->
    <Alert v-if="importSuccess" class="rounded-xl border-emerald-200 bg-emerald-50/50">
      <CheckCircleIcon class="h-4 w-4 text-emerald-600" />
      <AlertTitle>导入成功</AlertTitle>
      <AlertDescription>
        已恢复 {{ importStats.items }} 件物品、{{ importStats.cabinets }} 个储物柜、{{ importStats.categories }} 个分类
      </AlertDescription>
    </Alert>

    <!-- 导入确认 Dialog -->
    <Dialog v-model:open="importDialogOpen">
      <DialogContent class="sm:max-w-[320px]">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <AlertTriangleIcon class="h-5 w-5 text-amber-500" />
            确认导入数据
          </DialogTitle>
          <DialogDescription>
            导入前请备份当前数据，此操作不可撤销。
          </DialogDescription>
        </DialogHeader>

        <div v-if="importFile" class="flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
          <FileJsonIcon class="h-5 w-5 text-primary shrink-0" />
          <span class="text-sm truncate flex-1">{{ importFile.name }}</span>
        </div>

        <div class="space-y-3">
          <p class="text-sm font-medium">导入模式</p>
          <RadioGroup v-model="importMode" class="space-y-2">
            <div class="flex items-center space-x-2 p-3 rounded-xl border border-border bg-card">
              <RadioGroupItem value="merge" id="merge" />
              <Label for="merge" class="text-sm flex-1 cursor-pointer">
                <span class="font-medium">合并模式</span>
                <span class="block text-xs text-muted-foreground">智能去重，以新数据为准</span>
              </Label>
            </div>
            <div class="flex items-center space-x-2 p-3 rounded-xl border border-border bg-card">
              <RadioGroupItem value="overwrite" id="overwrite" />
              <Label for="overwrite" class="text-sm flex-1 cursor-pointer">
                <span class="font-medium">覆盖模式</span>
                <span class="block text-xs text-muted-foreground">清空现有数据后恢复</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Alert v-if="importError" variant="destructive" class="rounded-xl">
          <AlertTriangleIcon class="h-4 w-4" />
          <AlertDescription>{{ importError }}</AlertDescription>
        </Alert>

        <DialogFooter class="flex flex-col gap-2 mt-2">
          <Button variant="outline" class="w-full rounded-xl h-11" @click="importDialogOpen = false">
            取消
          </Button>
          <Button
            class="w-full rounded-xl h-11"
            :disabled="isImporting"
            @click="handleImport"
          >
            <RefreshCwIcon v-if="isImporting" class="h-4 w-4 mr-1.5 animate-spin" />
            <UploadIcon v-else class="h-4 w-4 mr-1.5" />
            {{ isImporting ? '正在导入...' : '确认导入' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
