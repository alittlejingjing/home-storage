<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCabinetsStore } from '@/stores/cabinets'
import {
  Card,
  CardContent,
  Input,
  Label,
  Textarea,
  Button,
  Upload,
} from '@/components/ui'
import { toast } from '@/components/ui'
import type { UploadFile } from '@/components/ui/Upload.vue'

const route = useRoute()
const router = useRouter()
const cabinetsStore = useCabinetsStore()

const cabinetId = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!cabinetId.value)

const name = ref('')
const photos = ref<string[]>([])
const location = ref('')

const uploadFiles = ref<UploadFile[]>([])

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
    if (photos.value.length >= 3) {
      toast({ title: '最多上传3张照片', variant: 'destructive' })
      break
    }
    try {
      const base64 = await fileToBase64(file)
      photos.value.push(base64)
    } catch {
      toast({ title: '图片读取失败', variant: 'destructive' })
    }
  }
}

function handleRemovePhoto(index: number) {
  photos.value.splice(index, 1)
}

function validate(): string | null {
  const n = name.value.trim()
  if (!n) return '储物柜名称不能为空'
  if (n.length < 2 || n.length > 30) return '储物柜名称需在2-30个字符之间'

  // 唯一性校验（编辑时排除自身）
  const duplicate = cabinetsStore.cabinets.find(
    c => c.name.trim() === n && c.id !== cabinetId.value
  )
  if (duplicate) return '已存在同名储物柜，请更换名称'

  return null
}

function handleSave() {
  const error = validate()
  if (error) {
    toast({ title: error, variant: 'destructive' })
    return
  }

  const data = {
    name: name.value.trim(),
    photos: photos.value,
    location: location.value.trim(),
  }

  if (isEdit.value && cabinetId.value) {
    const success = cabinetsStore.updateCabinet(cabinetId.value, data)
    if (success) {
      toast({ title: '保存成功' })
      router.push('/cabinets')
    } else {
      toast({ title: '保存失败', variant: 'destructive' })
    }
  } else {
    cabinetsStore.addCabinet(data)
    toast({ title: '创建成功' })
    router.push('/cabinets')
  }
}

onMounted(() => {
  if (isEdit.value && cabinetId.value) {
    const cabinet = cabinetsStore.cabinetById(cabinetId.value)
    if (cabinet) {
      name.value = cabinet.name
      photos.value = [...cabinet.photos]
      location.value = cabinet.location
    } else {
      toast({ title: '储物柜不存在', variant: 'destructive' })
      router.push('/cabinets')
    }
  }
})
</script>

<template>
  <div class="page-container p-4 pb-24 space-y-5 h-full overflow-auto">
    <Card>
      <CardContent class="p-4 space-y-5">
        <!-- 储物柜名称 -->
        <div class="space-y-2">
          <Label for="cabinet-name">储物柜名称 <span class="text-destructive">*</span></Label>
          <Input
            id="cabinet-name"
            v-model="name"
            placeholder="请输入储物柜名称（2-30字符）"
            maxlength="30"
          />
        </div>

        <!-- 照片上传 -->
        <div class="space-y-2">
          <Label>照片</Label>
          <Upload
            accept="image/*"
            :max-count="3"
            :show-file-list="false"
            hint="最多上传3张照片"
            @file-change="handleFileChange"
          />
          <!-- 已上传照片预览 -->
          <div v-if="photos.length > 0" class="flex flex-wrap gap-2 mt-2">
            <div
              v-for="(photo, index) in photos"
              :key="index"
              class="relative w-20 h-20 rounded-lg overflow-hidden border border-border"
            >
              <img :src="photo" class="w-full h-full object-cover" alt="照片预览" />
              <button
                type="button"
                class="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center text-xs"
                @click="handleRemovePhoto(index)"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- 位置描述 -->
        <div class="space-y-2">
          <Label for="cabinet-location">位置描述</Label>
          <Textarea
            id="cabinet-location"
            v-model="location"
            placeholder="请输入储物柜的详细位置描述"
            :rows="3"
          />
        </div>
      </CardContent>
    </Card>

    <!-- 底部固定保存按钮 -->
    <div class="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border z-50">
      <div class="max-w-lg mx-auto">
        <Button class="w-full h-11 rounded-xl" @click="handleSave">
          {{ isEdit ? '保存修改' : '创建储物柜' }}
        </Button>
      </div>
    </div>
  </div>
</template>
