<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Package, Plus } from 'lucide-vue-next'
import { useItemsStore } from '@/stores/items'
import { useCategoriesStore, dynamicColorPool } from '@/stores/categories'
import { useCabinetsStore } from '@/stores/cabinets'
import {
  Card,
  CardContent,
  Input,
  Select,
  SelectOption,
  DatePicker,
  Badge,
  Button,
  Empty,
  Skeleton,
} from '@/components/ui'

const router = useRouter()
const route = useRoute()
const itemsStore = useItemsStore()
const categoriesStore = useCategoriesStore()
const cabinetsStore = useCabinetsStore()

const keyword = ref('')
const categoryId = ref('all')
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

const filteredItems = computed(() => {
  return itemsStore.filteredItems(
    keyword.value,
    categoryId.value,
    fmtDate(startDate.value),
    fmtDate(endDate.value)
  )
})

// 瀑布流：分批加载
const displayItems = computed(() => {
  return filteredItems.value.slice(0, displayCount.value)
})

const total = computed(() => filteredItems.value.length)

// 监听筛选条件变化，重置瀑布流
watch([keyword, categoryId, startDate, endDate], () => {
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

function goDetail(id: string) {
  router.push(`/items/${id}`)
}

function goCreate() {
  router.push('/items/create')
}

// 分类颜色映射
function getCategoryColors(categoryId: string) {
  const presetMap: Record<string, { from: string; to: string }> = {
    'cat-1': { from: 'from-amber-200', to: 'to-orange-300' },
    'cat-2': { from: 'from-rose-200', to: 'to-red-300' },
    'cat-3': { from: 'from-emerald-200', to: 'to-teal-300' },
    'cat-4': { from: 'from-sky-200', to: 'to-blue-300' },
    'cat-5': { from: 'from-violet-200', to: 'to-purple-300' },
  }
  if (presetMap[categoryId]) return presetMap[categoryId]
  const hash = categoryId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const colorIdx = hash % dynamicColorPool.length
  return dynamicColorPool[colorIdx]
}

onMounted(() => {
  const qCategory = route.query.categoryId as string
  if (qCategory) {
    categoryId.value = qCategory
  }
})
</script>

<template>
  <div class="page-container flex flex-col h-full overflow-hidden p-4 pb-6 space-y-4">
    <!-- 筛选区 -->
    <Card class="card-mobile border-0 shadow-sm bg-card/80 flex-shrink-0">
      <CardContent class="p-3">
        <div class="flex flex-wrap gap-2.5">
          <div class="flex-1 min-w-[140px]">
            <Input
              v-model="keyword"
              placeholder="搜索物品名称"
              class="h-10 bg-muted/50 border-0"
            />
          </div>
          <div class="w-28">
            <Select v-model="categoryId" placeholder="全部分类">
              <SelectOption value="all">全部</SelectOption>
              <SelectOption
                v-for="cat in categoriesStore.sortedCategories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </SelectOption>
            </Select>
          </div>
          <div class="w-full flex gap-2">
            <DatePicker
              v-model="startDate"
              placeholder="开始日期"
              class="flex-1"
            />
            <span class="text-muted-foreground self-center text-xs">至</span>
            <DatePicker
              v-model="endDate"
              placeholder="结束日期"
              class="flex-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 瀑布流物品列表 -->
    <div class="flex-1 overflow-y-auto min-h-0 space-y-3" @scroll="onScroll">
      <Card
        v-for="item in displayItems"
        :key="item.id"
        class="cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99] border-0 shadow-sm"
        @click="goDetail(item.id)"
      >
        <CardContent class="p-3 flex items-center gap-3 min-h-[72px]">
          <!-- 照片缩略图 -->
          <div class="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-muted flex items-center justify-center">
            <img
              v-if="item.photos && item.photos.length > 0"
              :src="item.photos[0]"
              class="w-full h-full object-cover"
              alt=""
            />
            <Package v-else class="h-6 w-6 text-muted-foreground/60" />
          </div>

          <!-- 中间信息 -->
          <div class="flex-1 min-w-0">
            <p class="font-medium text-foreground truncate text-[15px]">{{ item.name }}</p>
            <div class="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                class="text-xs px-2 py-0.5 rounded-full"
                :class="[
                  'bg-gradient-to-r',
                  getCategoryColors(item.categoryId || '').from,
                  getCategoryColors(item.categoryId || '').to,
                  'text-white/90 border-0',
                ]"
              >
                {{ categoriesStore.categoryById(item.categoryId)?.name ?? '未分类' }}
              </Badge>
            </div>
            <p class="text-xs text-muted-foreground mt-1 truncate">
              {{ cabinetsStore.cabinetById(item.cabinetId)?.name ?? '未知储物柜' }}
            </p>
            <p class="text-xs text-muted-foreground/70 mt-0.5">
              {{ item.storageDate }}
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- 加载更多骨架屏 -->
      <div v-if="loadingMore" class="space-y-3">
        <Card v-for="i in 2" :key="i" class="border-0 shadow-sm">
          <CardContent class="p-3 flex items-center gap-3">
            <Skeleton class="w-16 h-16 rounded-xl shrink-0" />
            <div class="flex-1 space-y-2">
              <Skeleton class="h-4 w-3/4" />
              <Skeleton class="h-3 w-1/2" />
              <Skeleton class="h-3 w-1/3" />
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 没有更多了 -->
      <div v-if="noMore && displayItems.length > 0" class="text-center py-4">
        <p class="text-xs text-muted-foreground">— 没有更多了 —</p>
      </div>

      <!-- 空状态 -->
      <Empty
        v-if="total === 0"
        class="justify-start pt-8"
        title="暂无物品"
        description="还没有添加任何物品"
      >
        <template #icon>
          <Package class="h-12 w-12" />
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
