<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import { useCabinetsStore } from '@/stores/cabinets'
import { useCategoriesStore, dynamicColorPool } from '@/stores/categories'
import {
  Card,
  CardContent,
  Empty,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
} from '@/components/ui'
import {
  Search,
  Shirt,
  Wrench,
  Pill,
  FileText,
  Sparkles,
  Package,
  RotateCw,
  PackageOpen,
  Archive,
  Layers,
  ArrowRight,
  Plus,
  Tag,
  Heart,
} from 'lucide-vue-next'

const router = useRouter()
const itemsStore = useItemsStore()
const cabinetsStore = useCabinetsStore()
const categoriesStore = useCategoriesStore()

// 分类图标映射
const categoryIconMap: Record<string, any> = {
  'cat-1': Sparkles,
  'cat-2': Shirt,
  'cat-3': Wrench,
  'cat-4': Pill,
  'cat-5': FileText,
}
function getCategoryIcon(categoryId: string) {
  return categoryIconMap[categoryId] || Package
}

// 动态获取分类颜色（支持自定义分类）
function getCategoryColors(categoryId: string) {
  // 预设分类
  const presetMap: Record<string, { from: string; to: string }> = {
    'cat-1': { from: 'from-amber-300', to: 'to-orange-400' },
    'cat-2': { from: 'from-rose-300', to: 'to-red-400' },
    'cat-3': { from: 'from-emerald-300', to: 'to-teal-500' },
    'cat-4': { from: 'from-sky-300', to: 'to-blue-500' },
    'cat-5': { from: 'from-violet-300', to: 'to-purple-500' },
  }
  if (presetMap[categoryId]) return presetMap[categoryId]
  // 自定义分类：根据id哈希取色
  const hash = categoryId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const colorIdx = hash % dynamicColorPool.length
  return dynamicColorPool[colorIdx]
}

// 下拉刷新
const pullState = ref<'idle' | 'pulling' | 'refreshing'>('idle')
const pullDistance = ref(0)
const startY = ref(0)
const PULL_THRESHOLD = 80
const REFRESH_DURATION = 1200

function onTouchStart(e: TouchEvent) {
  if (window.scrollY > 0) return
  startY.value = e.touches[0].clientY
  pullState.value = 'pulling'
}

function onTouchMove(e: TouchEvent) {
  if (pullState.value !== 'pulling') return
  const diff = e.touches[0].clientY - startY.value
  if (diff > 0) {
    e.preventDefault()
    pullDistance.value = Math.min(diff * 0.5, PULL_THRESHOLD + 20)
  }
}

function onTouchEnd() {
  if (pullState.value !== 'pulling') return
  if (pullDistance.value >= PULL_THRESHOLD) {
    pullState.value = 'refreshing'
    pullDistance.value = PULL_THRESHOLD
    setTimeout(() => {
      pullState.value = 'idle'
      pullDistance.value = 0
    }, REFRESH_DURATION)
  } else {
    pullState.value = 'idle'
    pullDistance.value = 0
  }
}

const showPullIndicator = computed(() => pullState.value !== 'idle')
const pullProgress = computed(() => Math.min(pullDistance.value / PULL_THRESHOLD, 1))

// 统计数据
const stats = computed(() => [
  { label: '物品', value: itemsStore.items.length, icon: Package },
  { label: '储物柜', value: cabinetsStore.cabinets.length, icon: Archive },
  { label: '分类', value: categoriesStore.categories.length, icon: Layers },
])

function goToSearch() {
  router.push('/search')
}

function goToItems(categoryId?: string) {
  if (categoryId) {
    router.push({ path: '/items', query: { categoryId } })
  } else {
    router.push('/items')
  }
}

// 自定义分类 Dialog
const customDialogOpen = ref(false)
const newCategoryName = ref('')

function openCustomCategoryDialog() {
  newCategoryName.value = ''
  customDialogOpen.value = true
}

function addCustomCategory() {
  const name = newCategoryName.value.trim()
  if (!name) return
  categoriesStore.addCategory(name)
  customDialogOpen.value = false
  newCategoryName.value = ''
}
</script>

<template>
  <div
    class="page-container h-full overflow-y-auto p-4 pb-6 space-y-5"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <!-- 下拉刷新指示器 -->
    <div
      v-show="showPullIndicator"
      class="flex items-center justify-center overflow-hidden transition-all duration-200"
      :style="{ height: `${pullDistance}px` }"
    >
      <div class="flex flex-col items-center gap-1">
        <RotateCw
          :class="[
            'h-5 w-5 text-primary transition-transform duration-300',
            pullState === 'refreshing' && 'animate-spin',
          ]"
          :style="{ transform: `rotate(${pullProgress * 360}deg)` }"
        />
        <span class="text-xs text-muted-foreground">
          {{ pullState === 'refreshing' ? '刷新中...' : '松开刷新' }}
        </span>
      </div>
    </div>

    <!-- 欢迎语 -->
    <div class="space-y-1 pt-2">
      <div class="flex items-center gap-2">
        <Heart class="h-5 w-5 text-primary fill-primary/30" />
        <h1 class="text-xl font-bold text-foreground tracking-tight">家享收纳</h1>
      </div>
      <p class="text-sm text-muted-foreground">温暖的家，从整理开始</p>
    </div>

    <!-- 搜索栏 -->
    <Card
      class="card-mobile cursor-pointer border-0 shadow-sm bg-gradient-to-r from-primary/60 to-amber-500/60"
      @click="goToSearch"
    >
      <CardContent class="py-3.5 px-4">
        <div class="flex items-center gap-3 text-white/80">
          <div class="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center backdrop-blur-sm">
            <Search class="h-4 w-4 text-white" />
          </div>
          <span class="text-sm font-medium">搜索物品、储物柜...</span>
          <ArrowRight class="h-4 w-4 ml-auto text-white/60" />
        </div>
      </CardContent>
    </Card>

    <!-- 统计概览（ins风卡片） -->
    <div class="grid grid-cols-3 gap-2.5">
      <Card
        v-for="stat in stats"
        :key="stat.label"
        class="card-mobile border-0 shadow-sm cursor-pointer bg-card/80"
        @click="stat.label === '物品' ? goToItems() : stat.label === '储物柜' ? router.push('/cabinets') : router.push('/categories')"
      >
        <CardContent class="py-3 px-2 text-center">
          <component :is="stat.icon" class="h-5 w-5 mx-auto mb-1.5 text-primary/70" />
          <p class="text-lg font-bold text-foreground">{{ stat.value }}</p>
          <p class="text-xs text-muted-foreground">{{ stat.label }}</p>
        </CardContent>
      </Card>
    </div>

    <!-- 分类浏览（2列瀑布网格 + 自定义分类） -->
    <div class="space-y-3">
      <div class="flex items-center justify-between px-0.5">
        <h2 class="text-base font-semibold text-foreground">物品分类</h2>
      </div>

      <div
        v-if="categoriesStore.categoriesWithCount.length > 0"
        class="grid grid-cols-2 gap-2.5"
      >
        <Card
          v-for="cat in categoriesStore.categoriesWithCount"
          :key="cat.id"
          class="card-mobile border-0 shadow-sm cursor-pointer overflow-hidden"
          @click="goToItems(cat.id)"
        >
          <div
            class="bg-gradient-to-br p-4 h-full relative"
            :class="[
              getCategoryColors(cat.id).from,
              getCategoryColors(cat.id).to,
            ]"
          >
            <!-- 装饰圆 -->
            <div class="absolute -top-3 -right-3 w-14 h-14 rounded-full bg-white/10" />
            <div class="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-white/10" />

            <div class="flex items-start justify-between relative z-10">
              <component
                :is="getCategoryIcon(cat.id)"
                class="h-5 w-5 text-white/90"
              />
              <span class="text-xs font-medium text-white/80">{{ cat.count }} 件</span>
            </div>
            <p class="text-sm font-semibold text-white mt-3 relative z-10">{{ cat.name }}</p>
          </div>
        </Card>

        <!-- 自定义分类按钮 -->
        <Card
          class="card-mobile border-2 border-dashed border-primary/30 shadow-none cursor-pointer bg-transparent hover:bg-primary/5 transition-colors"
          @click="openCustomCategoryDialog"
        >
          <div class="p-4 h-full flex flex-col items-center justify-center gap-2 text-primary/60">
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus class="h-5 w-5" />
            </div>
            <span class="text-xs font-medium">自定义分类</span>
          </div>
        </Card>
      </div>

      <Empty
        v-else
        title="暂无分类"
        description="去添加分类吧"
        class="py-6"
      >
        <template #icon>
          <PackageOpen class="h-10 w-10 text-muted-foreground" />
        </template>
      </Empty>
    </div>

    <!-- 快捷入口 -->
    <div class="grid grid-cols-2 gap-2.5">
      <Card
        class="card-mobile border-0 shadow-sm cursor-pointer bg-gradient-to-br from-amber-50/80 to-orange-50/80"
        @click="router.push('/items')"
      >
        <CardContent class="py-3.5 px-4 flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Package class="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <p class="text-sm font-semibold text-foreground">全部物品</p>
            <p class="text-xs text-muted-foreground">查看所有</p>
          </div>
        </CardContent>
      </Card>

      <Card
        class="card-mobile border-0 shadow-sm cursor-pointer bg-gradient-to-br from-stone-50/80 to-amber-50/80"
        @click="router.push('/cabinets')"
      >
        <CardContent class="py-3.5 px-4 flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-amber-200/60 flex items-center justify-center">
            <Archive class="h-4.5 w-4.5 text-amber-700" />
          </div>
          <div>
            <p class="text-sm font-semibold text-foreground">储物柜</p>
            <p class="text-xs text-muted-foreground">空间管理</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 新增自定义分类 Dialog -->
    <Dialog v-model:open="customDialogOpen">
      <DialogContent class="sm:max-w-[320px]">
        <DialogHeader>
          <DialogTitle>添加自定义分类</DialogTitle>
          <DialogDescription>创建一个新的物品分类</DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <Input
            v-model="newCategoryName"
            placeholder="请输入分类名称"
            class="h-11 rounded-xl"
            @keyup.enter="addCustomCategory"
          />
        </div>
        <DialogFooter class="flex flex-col gap-2">
          <Button variant="outline" class="w-full rounded-xl h-11" @click="customDialogOpen = false">取消</Button>
          <Button class="w-full rounded-xl h-11" @click="addCustomCategory">添加</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
.page-container {
  -webkit-overflow-scrolling: touch;
}
</style>
