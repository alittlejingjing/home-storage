<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCabinetsStore } from '@/stores/cabinets'
import { useItemsStore } from '@/stores/items'
import {
  Card,
  CardContent,
  Button,
  Empty,
  Carousel,
  CarouselContent,
  CarouselItem,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Tooltip,
} from '@/components/ui'
import { toast } from '@/components/ui'
import {
  MapPin,
  Clock,
  Package,
  ChevronRight,
  Pencil,
  Trash2,
  Image,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const cabinetsStore = useCabinetsStore()
const itemsStore = useItemsStore()

const cabinetId = computed(() => route.params.id as string)
const cabinet = computed(() => cabinetsStore.cabinetById(cabinetId.value))
const cabinetItems = computed(() => itemsStore.itemsByCabinetId[cabinetId.value] ?? [])
const hasItems = computed(() => cabinetItems.value.length > 0)

const showDeleteDialog = ref(false)

function goEdit() {
  router.push(`/cabinets/${cabinetId.value}/edit`)
}

function goItemDetail(itemId: string) {
  router.push(`/items/${itemId}`)
}

function confirmDelete() {
  showDeleteDialog.value = true
}

function handleDelete() {
  const success = cabinetsStore.deleteCabinet(cabinetId.value)
  if (success) {
    toast({ title: '删除成功' })
    router.push('/cabinets')
  } else {
    toast({ title: '删除失败，请重试', variant: 'destructive' })
  }
  showDeleteDialog.value = false
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
</script>

<template>
  <div v-if="cabinet" class="page-container p-0 pb-6 h-full overflow-auto">
    <!-- 照片轮播区（ins风圆角） -->
    <div class="relative w-full p-4">
      <div class="rounded-2xl overflow-hidden bg-muted">
        <template v-if="cabinet.photos && cabinet.photos.length > 0">
          <Carousel class="h-56">
            <CarouselContent class="h-full">
              <CarouselItem v-for="(photo, index) in cabinet.photos" :key="index" class="h-full pl-0">
                <div class="h-56 w-full">
                  <img
                    :src="photo"
                    class="h-full w-full object-cover"
                    alt="储物柜照片"
                  />
                </div>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
          <!-- 圆点指示器 -->
          <div class="absolute bottom-7 left-1/2 -translate-x-1/2 flex gap-1.5">
            <span
              v-for="(_, index) in cabinet.photos"
              :key="index"
              class="w-2 h-2 rounded-full transition-colors"
              :class="index === 0 ? 'bg-primary' : 'bg-primary/30'"
            />
          </div>
        </template>
        <div v-else class="w-full h-56 flex flex-col items-center justify-center text-muted-foreground">
          <Image class="h-10 w-10 mb-2" />
          <span class="text-sm">暂无照片</span>
        </div>
      </div>
    </div>

    <!-- 储物柜名称 -->
    <h1 class="px-4 text-xl font-bold text-foreground">{{ cabinet.name }}</h1>

    <!-- 位置描述 + 创建时间 -->
    <Card class="card-mobile mx-4 border-0 shadow-sm bg-card/80">
      <CardContent class="p-4 space-y-3">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <MapPin class="h-4 w-4 text-primary" />
          </div>
          <span class="text-sm text-muted-foreground">位置</span>
          <span class="text-sm text-foreground ml-auto">{{ cabinet.location || '未填写位置' }}</span>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Clock class="h-4 w-4 text-primary" />
          </div>
          <span class="text-sm text-muted-foreground">创建时间</span>
          <span class="text-sm text-foreground ml-auto">{{ formatDate(cabinet.createdAt) }}</span>
        </div>
      </CardContent>
    </Card>

    <!-- 柜内物品组 -->
    <div class="mt-4">
      <h2 class="px-4 pb-0 text-base font-semibold text-foreground">
        柜内物品（共{{ cabinetItems.length }}件）
      </h2>

      <div class="px-4 mt-3 space-y-3">
        <template v-if="cabinetItems.length > 0">
          <Card
            v-for="item in cabinetItems"
            :key="item.id"
            class="card-mobile cursor-pointer border-0 shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.99]"
            @click="goItemDetail(item.id)"
          >
            <CardContent class="p-3 flex items-center gap-3">
              <!-- 左侧占位图 -->
              <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                <Package class="h-5 w-5 text-amber-400/70" />
              </div>
              <!-- 中间物品名称 -->
              <div class="flex-1 min-w-0">
                <p class="font-medium text-foreground truncate text-[15px]">{{ item.name }}</p>
              </div>
              <!-- 右侧箭头 -->
              <ChevronRight class="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardContent>
          </Card>
        </template>

        <Empty v-else title="该储物柜暂无物品" description="快去添加物品吧">
          <template #icon>
            <Package class="h-10 w-10" />
          </template>
        </Empty>
      </div>
    </div>

    <!-- 操作按钮组 -->
    <div class="p-4 flex gap-3">
      <Button variant="outline" class="flex-1 h-11 gap-2 rounded-xl border-primary/20" @click="goEdit">
        <Pencil class="h-4 w-4" />
        编辑
      </Button>

      <Tooltip v-if="hasItems" content="请先移出物品后再删除">
        <Button variant="destructive" class="flex-1 h-11 gap-2 rounded-xl" disabled>
          <Trash2 class="h-4 w-4" />
          删除
        </Button>
      </Tooltip>
      <Button v-else variant="destructive" class="flex-1 h-11 gap-2 rounded-xl" @click="confirmDelete">
        <Trash2 class="h-4 w-4" />
        删除
      </Button>
    </div>

    <!-- 删除确认弹窗 -->
    <Dialog :open="showDeleteDialog" @update:open="showDeleteDialog = $event">
      <DialogContent class="sm:max-w-[320px]">
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            删除后无法恢复，是否确认删除储物柜「{{ cabinet.name }}」？
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex flex-col gap-2 mt-4">
          <Button variant="outline" class="w-full rounded-xl h-11" @click="showDeleteDialog = false">
            取消
          </Button>
          <Button variant="destructive" class="w-full rounded-xl h-11" @click="handleDelete">
            确认删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>

  <!-- 储物柜不存在 -->
  <div v-else class="page-container p-4 h-full flex flex-col items-center justify-center">
    <Empty title="储物柜不存在" description="该储物柜可能已被删除">
      <template #icon>
        <Package class="h-10 w-10" />
      </template>
      <Button class="mt-4" @click="router.push('/cabinets')">返回列表</Button>
    </Empty>
  </div>
</template>
