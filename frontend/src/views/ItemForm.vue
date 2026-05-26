<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { Save, Trash2 } from 'lucide-vue-next'
import { useItemsStore } from '@/stores/items'
import { useCategoriesStore } from '@/stores/categories'
import { useCabinetsStore } from '@/stores/cabinets'
import { toast } from '@/components/ui/toast/useToast'
import {
  Card,
  CardContent,
  Input,
  Select,
  SelectOption,
  DatePicker,
  Textarea,
  Label,
  Button,
  Upload,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui'


const router = useRouter()
const route = useRoute()
const itemsStore = useItemsStore()
const categoriesStore = useCategoriesStore()
const cabinetsStore = useCabinetsStore()

const itemId = computed(() => {
  const id = route.params.id as string
  if (id === 'create') return ''
  return id || ''
})

const isEdit = computed(() => !!itemId.value)

// R010 自动填充：物品创建时，存放时间默认填充当前日期
function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const form = ref({
  name: '',
  categoryId: '',
  photos: [] as string[],
  storageDate: getTodayStr(),
  cabinetId: '',
  note: '',
})

const initialForm = ref('')
const hasChanged = computed(() => JSON.stringify(form.value) !== initialForm.value)

const showLeaveDialog = ref(false)
const nextRoute = ref<any>(null)

function formatDate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function handleFileChange(files: File[]) {
  for (const file of files) {
    if (form.value.photos.length >= 3) {
      toast({ title: '最多上传3张照片', variant: 'destructive' })
      break
    }
    try {
      const base64 = await fileToBase64(file)
      form.value.photos.push(base64)
    } catch {
      toast({ title: '图片读取失败', variant: 'destructive' })
    }
  }
}

function removePhoto(index: number) {
  form.value.photos.splice(index, 1)
}

function validate(): string | null {
  const name = form.value.name.trim()
  if (!name) return '物品名称不能为空'
  if (name.length < 2 || name.length > 50) return '物品名称长度为2-50个字符'
  if (!form.value.categoryId) return '请选择分类'
  if (!form.value.cabinetId) return '请选择储物柜'
  return null
}

async function handleSave() {
  const error = validate()
  if (error) {
    toast({ title: error, variant: 'destructive' })
    return
  }

  const storageDateStr = form.value.storageDate instanceof Date
    ? formatDate(form.value.storageDate)
    : String(form.value.storageDate)

  const payload = {
    name: form.value.name.trim(),
    categoryId: form.value.categoryId,
    photos: form.value.photos,
    storageDate: storageDateStr,
    cabinetId: form.value.cabinetId,
    note: form.value.note.trim(),
  }

  if (isEdit.value) {
    itemsStore.updateItem(itemId.value, payload)
    toast({ title: '保存成功' })
  } else {
    itemsStore.addItem(payload)
    toast({ title: '新增成功' })
  }

  initialForm.value = JSON.stringify(form.value)
  router.push('/items')
}

onBeforeRouteLeave((to, from, next) => {
  if (hasChanged.value) {
    showLeaveDialog.value = true
    nextRoute.value = next
    return false
  }
  next()
})

function confirmLeave() {
  showLeaveDialog.value = false
  if (nextRoute.value) {
    nextRoute.value()
    nextRoute.value = null
  }
}

function cancelLeave() {
  showLeaveDialog.value = false
  nextRoute.value = null
}

onMounted(() => {
  if (isEdit.value) {
    const item = itemsStore.itemById(itemId.value)
    if (item) {
      form.value = {
        name: item.name,
        categoryId: item.categoryId,
        photos: [...item.photos],
        storageDate: item.storageDate,
        cabinetId: item.cabinetId,
        note: item.note,
      }
    } else {
      toast({ title: '物品不存在', variant: 'destructive' })
      router.push('/items')
    }
  }
  nextTick(() => {
    initialForm.value = JSON.stringify(form.value)
  })
})
</script>

<template>
  <div class="page-container p-4 pb-24 space-y-5 h-full overflow-auto">
    <Card class="card-mobile border-0 shadow-sm bg-card/80">
      <CardContent class="p-4 space-y-5">
        <!-- 物品名称 -->
        <div class="space-y-1.5">
          <Label>物品名称 <span class="text-destructive">*</span></Label>
          <Input v-model="form.name" placeholder="请输入物品名称" />
        </div>

        <!-- 分类选择器 -->
        <div class="space-y-1.5">
          <Label>分类 <span class="text-destructive">*</span></Label>
          <Select v-model="form.categoryId" placeholder="请选择分类">
            <SelectOption
              v-for="cat in categoriesStore.sortedCategories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </SelectOption>
          </Select>
        </div>

        <!-- 照片上传区 -->
        <div class="space-y-1.5">
          <Label>照片</Label>
          <Upload
            accept="image/*"
            :max-count="3"
            :show-file-list="false"
            @file-change="handleFileChange"
          />
          <!-- 已上传照片预览 -->
          <div v-if="form.photos.length > 0" class="flex gap-2 mt-2 flex-wrap">
            <div
              v-for="(photo, idx) in form.photos"
              :key="idx"
              class="relative w-20 h-20 rounded-lg overflow-hidden border border-border"
            >
              <img :src="photo" class="w-full h-full object-cover" alt="" />
              <button
                type="button"
                class="absolute top-0.5 right-0.5 p-0.5 bg-black/50 rounded-full text-white"
                @click="removePhoto(idx)"
              >
                <Trash2 class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        <!-- 存放日期 -->
        <div class="space-y-1.5">
          <Label>存放日期 <span class="text-destructive">*</span></Label>
          <DatePicker v-model="form.storageDate" placeholder="选择存放日期" />
        </div>

        <!-- 储物柜选择器 -->
        <div class="space-y-1.5">
          <Label>储物柜 <span class="text-destructive">*</span></Label>
          <Select v-model="form.cabinetId" placeholder="请选择储物柜">
            <SelectOption
              v-for="cab in cabinetsStore.cabinetsWithItemCount"
              :key="cab.id"
              :value="cab.id"
            >
              {{ cab.name }}
            </SelectOption>
          </Select>
        </div>

        <!-- 备注 -->
        <div class="space-y-1.5">
          <Label>备注</Label>
          <Textarea v-model="form.note" :rows="3" placeholder="请输入备注信息" />
        </div>
      </CardContent>
    </Card>

    <!-- 底部固定保存按钮 -->
    <div class="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
      <div class="max-w-lg mx-auto">
        <Button class="w-full h-11 rounded-xl" @click="handleSave">
          <Save class="h-4 w-4 mr-2" />
          保存
        </Button>
      </div>
    </div>

    <!-- 离开确认弹窗 -->
    <Dialog :open="showLeaveDialog" @update:open="showLeaveDialog = $event">
      <DialogContent class="sm:max-w-[320px]">
        <DialogHeader>
          <DialogTitle>确认离开</DialogTitle>
          <DialogDescription>您有未保存的更改，确定要离开吗？</DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex flex-col gap-2 mt-4">
          <Button variant="outline" class="w-full rounded-xl h-11" @click="cancelLeave">取消</Button>
          <Button variant="default" class="w-full rounded-xl h-11" @click="confirmLeave">确认离开</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
