<script setup lang="ts">
import { ref, computed, h, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Image as ImageIcon,
  Calendar,
  Archive,
  Clock,
  FileText,
  Edit as EditIcon,
  Trash2 as Trash2Icon,
  Tag as TagIcon,
} from 'lucide-vue-next'
import { useItemsStore } from '@/stores/items'
import { useCategoriesStore } from '@/stores/categories'
import { useCabinetsStore } from '@/stores/cabinets'
import { toast } from '@/components/ui/toast/useToast'
import {
  Card,
  CardContent,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui'

const router = useRouter()
const route = useRoute()
const itemsStore = useItemsStore()
const categoriesStore = useCategoriesStore()
const cabinetsStore = useCabinetsStore()

const itemId = computed(() => route.params.id as string)
const item = computed(() => itemsStore.itemById(itemId.value))

const showDeleteDialog = ref(false)

/* 轮播圆点指示器（需注入 Carousel 上下文） */
const CarouselDots = {
  setup() {
    const ctx = inject<any>('carousel')
    return () => {
      const total = ctx?.totalItems.value ?? 0
      if (total <= 1) return null
      return h(
        'div',
        { class: 'flex justify-center gap-1.5 mt-2' },
        Array.from({ length: total }).map((_, idx) =>
          h('div', {
            class: [
              'w-2 h-2 rounded-full transition-colors',
              idx === ctx?.currentIndex.value ? 'bg-primary' : 'bg-muted-foreground/30',
            ],
          })
        )
      )
    }
  },
}

function goEdit() {
  router.push(`/items/${itemId.value}/edit`)
}

function goCabinet() {
  if (item.value) {
    router.push(`/cabinets/${item.value.cabinetId}`)
  }
}

function confirmDelete() {
  showDeleteDialog.value = true
}

function doDelete() {
  if (item.value) {
    itemsStore.deleteItem(item.value.id)
    toast({ title: '删除成功' })
    router.push('/items')
  }
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}
</script>

<template>
  <div v-if="item" class="page-container p-0 pb-6 h-full overflow-auto">
    <!-- 顶部照片轮播区（ins风圆角） -->
    <div class="relative p-4">
      <div class="rounded-2xl overflow-hidden">
        <Carousel class="h-56">
          <CarouselContent>
            <CarouselItem
              v-for="idx in Math.max(1, item.photos.length)"
              :key="idx"
              class="pl-0"
            >
              <div class="h-56 w-full">
                <img
                  v-if="item.photos.length > 0"
                  :src="item.photos[idx - 1]"
                  class="w-full h-full object-cover"
                  alt=""
                />
                <div
                  v-else
                  class="w-full h-full bg-muted flex flex-col items-center justify-center"
                >
                  <ImageIcon class="h-10 w-10 text-muted-foreground mb-2" />
                  <span class="text-sm text-muted-foreground">暂无照片</span>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>

          <CarouselPrevious
            v-if="item.photos.length > 1"
            class="left-3 top-1/2 -translate-y-1/2"
          />
          <CarouselNext
            v-if="item.photos.length > 1"
            class="right-3 top-1/2 -translate-y-1/2"
          />
          <CarouselDots />
        </Carousel>
      </div>
    </div>

    <!-- 物品名称大标题 -->
    <h1 class="px-4 text-xl font-bold text-foreground">{{ item.name }}</h1>

    <!-- 信息分组卡片（ins风） -->
    <Card class="card-mobile mx-4 mt-4 border-0 shadow-sm bg-card/80">
      <CardContent class="p-4 space-y-3.5">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <TagIcon class="h-4 w-4 text-primary" />
          </div>
          <span class="text-sm text-muted-foreground shrink-0">分类</span>
          <Badge variant="secondary" class="ml-auto rounded-full bg-gradient-to-r from-amber-200 to-orange-300 text-white/90 border-0">
            {{ categoriesStore.categoryById(item.categoryId)?.name ?? '未分类' }}
          </Badge>
        </div>

        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Calendar class="h-4 w-4 text-primary" />
          </div>
          <span class="text-sm text-muted-foreground">存放日期</span>
          <span class="text-sm text-foreground ml-auto">{{ item.storageDate }}</span>
        </div>

        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Archive class="h-4 w-4 text-primary" />
          </div>
          <span class="text-sm text-muted-foreground">储物柜</span>
          <button
            class="text-sm text-primary underline-offset-2 hover:underline ml-auto"
            @click="goCabinet"
          >
            {{ cabinetsStore.cabinetById(item.cabinetId)?.name ?? '未知储物柜' }}
          </button>
        </div>

        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Clock class="h-4 w-4 text-primary" />
          </div>
          <span class="text-sm text-muted-foreground">创建时间</span>
          <span class="text-sm text-foreground ml-auto">{{ formatDateTime(item.createdAt) }}</span>
        </div>

        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <FileText class="h-4 w-4 text-primary" />
          </div>
          <span class="text-sm text-muted-foreground">备注</span>
          <span class="text-sm text-foreground ml-auto text-right">{{ item.note || '无备注' }}</span>
        </div>
      </CardContent>
    </Card>

    <!-- 底部操作按钮组 -->
    <div class="p-4 flex gap-3 mt-4 max-w-lg mx-auto w-full">
      <Button variant="outline" class="flex-1 h-11 rounded-xl border-primary/20" @click="goEdit">
        <EditIcon class="h-4 w-4 mr-2" />
        编辑
      </Button>
      <Button variant="destructive" class="flex-1 h-11 rounded-xl" @click="confirmDelete">
        <Trash2Icon class="h-4 w-4 mr-2" />
        删除
      </Button>
    </div>

    <!-- 删除确认弹窗 -->
    <Dialog :open="showDeleteDialog" @update:open="showDeleteDialog = $event">
      <DialogContent class="sm:max-w-[320px]">
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>确定要删除该物品吗？删除后不可恢复。</DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex flex-col gap-2 mt-4">
          <Button variant="outline" class="w-full rounded-xl h-11" @click="showDeleteDialog = false">
            取消
          </Button>
          <Button variant="destructive" class="w-full rounded-xl h-11" @click="doDelete">
            确认删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>

  <!-- 物品不存在 -->
  <div v-else class="page-container p-4 flex flex-col items-center justify-center h-full text-center">
    <p class="text-muted-foreground">物品不存在或已被删除</p>
    <Button class="mt-4 rounded-xl" @click="router.push('/items')">返回列表</Button>
  </div>
</template>

<style scoped>
.page-container {
  -webkit-overflow-scrolling: touch;
}
</style>
