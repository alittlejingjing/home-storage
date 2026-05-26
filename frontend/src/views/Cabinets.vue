<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCabinetsStore } from '@/stores/cabinets'
import { useItemsStore } from '@/stores/items'
import {
  Card,
  CardContent,
  Input,
  DatePicker,
  Badge,
  Button,
  Empty,
  Skeleton,
} from '@/components/ui'
import { Search, Archive, Plus, MapPin } from 'lucide-vue-next'

const router = useRouter()
const cabinetsStore = useCabinetsStore()
const itemsStore = useItemsStore()

const keyword = ref('')
const startDate = ref<Date | undefined>(undefined)
const endDate = ref<Date | undefined>(undefined)

// 瀑布流参数
const pageSize = 8
const displayCount = ref(pageSize)
const loadingMore = ref(false)
const noMore = ref(false)

function fmtDate(d: Date | undefined): string {
  if (!d) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const filteredList = computed(() => {
  return cabinetsStore.filteredCabinets(keyword.value, fmtDate(startDate.value), fmtDate(endDate.value))
})

const total = computed(() => filteredList.value.length)

const displayList = computed(() => {
  return filteredList.value.slice(0, displayCount.value)
})

// 监听筛选条件变化
watch([keyword, startDate, endDate], () => {
  displayCount.value = pageSize
  noMore.value = false
})

// 触底加载
function onScroll(e: Event) {
  const el = e.target as HTMLElement
  if (noMore.value || loadingMore.value) return
  const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100
  if (nearBottom && displayCount.value < total.value) {
    loadingMore.value = true
    setTimeout(() => {
      displayCount.value += pageSize
      if (displayCount.value >= total.value) {
        noMore.value = true
      }
      loadingMore.value = false
    }, 300)
  }
}

function getItemCount(cabinetId: string) {
  return itemsStore.itemsByCabinetId[cabinetId]?.length ?? 0
}

function goDetail(id: string) {
  router.push(`/cabinets/${id}`)
}

function goCreate() {
  router.push('/cabinets/create')
}
</script>

<template>
  <div class="page-container flex flex-col h-full overflow-hidden p-4 pb-6 space-y-4">
    <!-- 筛选区 -->
    <Card class="card-mobile border-0 shadow-sm bg-card/80 flex-shrink-0">
      <CardContent class="p-3 flex flex-wrap gap-2.5">
        <div class="flex-1 min-w-[200px]">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              v-model="keyword"
              placeholder="搜索储物柜名称或位置"
              class="pl-9 h-10 bg-muted/50 border-0"
            />
          </div>
        </div>
        <div class="w-full flex gap-2">
          <DatePicker v-model="startDate" placeholder="开始日期" class="flex-1" />
          <span class="text-muted-foreground self-center text-xs">至</span>
          <DatePicker v-model="endDate" placeholder="结束日期" class="flex-1" />
        </div>
      </CardContent>
    </Card>

    <!-- 瀑布流列表 -->
    <div class="flex-1 overflow-y-auto min-h-0 space-y-3" @scroll="onScroll">
      <template v-if="displayList.length > 0">
        <Card
          v-for="cabinet in displayList"
          :key="cabinet.id"
          class="cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99] border-0 shadow-sm"
          @click="goDetail(cabinet.id)"
        >
          <CardContent class="p-3 min-h-[72px] flex items-center gap-3">
            <!-- 照片缩略图 -->
            <div class="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-muted">
              <img
                v-if="cabinet.photos && cabinet.photos.length > 0"
                :src="cabinet.photos[0]"
                class="w-full h-full object-cover"
                alt="储物柜照片"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-amber-50">
                <Archive class="h-6 w-6 text-amber-400/70" />
              </div>
            </div>

            <!-- 中间信息 -->
            <div class="flex-1 min-w-0">
              <p class="font-medium text-foreground truncate text-[15px]">{{ cabinet.name }}</p>
              <div class="flex items-center gap-1 mt-1 text-muted-foreground">
                <MapPin class="h-3 w-3" />
                <p class="text-xs line-clamp-1">{{ cabinet.location }}</p>
              </div>
              <p class="text-xs text-muted-foreground/70 mt-0.5">
                {{ cabinet.createdAt }}
              </p>
            </div>

            <!-- 右侧角标 -->
            <Badge variant="outline" class="shrink-0 rounded-full border-primary/20 text-primary bg-primary/5">
              {{ getItemCount(cabinet.id) }}件物品
            </Badge>
          </CardContent>
        </Card>
      </template>

      <!-- 加载更多骨架屏 -->
      <div v-if="loadingMore" class="space-y-3">
        <Card v-for="i in 2" :key="i" class="border-0 shadow-sm">
          <CardContent class="p-3 flex items-center gap-3">
            <Skeleton class="w-16 h-16 rounded-xl shrink-0" />
            <div class="flex-1 space-y-2">
              <Skeleton class="h-4 w-3/4" />
              <Skeleton class="h-3 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 没有更多了 -->
      <div v-if="noMore && displayList.length > 0" class="text-center py-4">
        <p class="text-xs text-muted-foreground">— 没有更多了 —</p>
      </div>

      <Empty v-else-if="total === 0" class="justify-start pt-8" title="暂无储物柜" description="快去添加第一个储物柜吧">
        <template #icon>
          <Archive class="h-10 w-10" />
        </template>
      </Empty>
    </div>

    <!-- 悬浮添加按钮 -->
    <Button
      size="icon"
      class="fixed bottom-20 right-4 w-12 h-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
      @click="goCreate"
    >
      <Plus class="h-6 w-6" />
    </Button>
  </div>
</template>
