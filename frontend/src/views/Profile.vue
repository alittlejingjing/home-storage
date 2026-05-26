<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useItemsStore } from '@/stores/items'
import { useCabinetsStore } from '@/stores/cabinets'
import { useCategoriesStore } from '@/stores/categories'
import {
  Card,
  CardContent,
  Avatar,
  AvatarFallback,
  Button,
  Separator,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui'
import {
  ChevronRight as ChevronRightIcon,
  Tag as TagIcon,
  Trash2 as Trash2Icon,
  LogOut as LogOutIcon,
  Download as DownloadIcon,
  Heart,
  Package,
  Archive,
  Layers,
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const itemsStore = useItemsStore()
const cabinetsStore = useCabinetsStore()
const categoriesStore = useCategoriesStore()

const { user } = storeToRefs(authStore)

const clearCacheDialogOpen = ref(false)

const userNameInitial = computed(() => {
  return user.value?.name?.charAt(0) ?? '?'
})

const stats = computed(() => [
  { value: itemsStore.totalCount, label: '总物品', icon: Package },
  { value: cabinetsStore.totalCount, label: '总储物柜', icon: Archive },
  { value: categoriesStore.categories.length, label: '总分类', icon: Layers },
])

function goToCategories() {
  router.push('/categories')
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

function confirmClearCache() {
  localStorage.clear()
  clearCacheDialogOpen.value = false
  window.location.reload()
}
</script>

<template>
  <div class="page-container p-4 pb-6 space-y-5 h-full overflow-y-auto">
    <!-- 用户信息卡片（ins风） -->
    <Card class="card-mobile border-0 shadow-sm overflow-hidden bg-gradient-to-br from-primary/10 via-amber-50/50 to-background">
      <CardContent class="p-5">
        <div class="flex items-center gap-4">
          <div class="relative">
            <Avatar class="h-14 w-14 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
              <AvatarFallback class="text-lg font-semibold bg-gradient-to-br from-primary/80 to-amber-500/80 text-white">
                {{ userNameInitial }}
              </AvatarFallback>
            </Avatar>
            <div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-background" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-lg font-semibold truncate">{{ user?.name ?? '未登录' }}</p>
            <p class="text-sm text-muted-foreground flex items-center gap-1">
              <Heart class="h-3 w-3 text-primary fill-primary/30" />
              家庭管理员
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 功能入口列表 -->
    <Card class="card-mobile border-0 shadow-sm overflow-hidden">
      <div
        class="flex items-center justify-between p-4 cursor-pointer active:bg-muted/50 transition-colors"
        @click="goToCategories"
      >
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <TagIcon class="h-5 w-5 text-primary" />
          </div>
          <span class="text-sm font-medium">分类管理</span>
        </div>
        <ChevronRightIcon class="h-5 w-5 text-muted-foreground" />
      </div>
      <Separator class="mx-4 w-auto" />
      <div
        class="flex items-center justify-between p-4 cursor-pointer active:bg-muted/50 transition-colors"
        @click="router.push('/backup')"
      >
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <DownloadIcon class="h-5 w-5 text-amber-600" />
          </div>
          <span class="text-sm font-medium">数据备份</span>
        </div>
        <ChevronRightIcon class="h-5 w-5 text-muted-foreground" />
      </div>
      <Separator class="mx-4 w-auto" />
      <div
        class="flex items-center justify-between p-4 cursor-pointer active:bg-muted/50 transition-colors"
        @click="clearCacheDialogOpen = true"
      >
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
            <Trash2Icon class="h-5 w-5 text-muted-foreground" />
          </div>
          <span class="text-sm font-medium">清除缓存</span>
        </div>
        <ChevronRightIcon class="h-5 w-5 text-muted-foreground" />
      </div>
    </Card>

    <!-- 数据统计区 -->
    <div class="space-y-3">
      <h2 class="text-base font-semibold px-1">数据统计</h2>
      <div class="grid grid-cols-3 gap-2.5">
        <Card
          v-for="stat in stats"
          :key="stat.label"
          class="card-mobile border-0 shadow-sm text-center p-3 bg-card/80"
        >
          <component :is="stat.icon" class="h-5 w-5 mx-auto mb-1.5 text-primary/60" />
          <p class="text-2xl font-bold text-foreground">{{ stat.value }}</p>
          <p class="text-xs text-muted-foreground mt-1">{{ stat.label }}</p>
        </Card>
      </div>
    </div>

    <!-- 系统操作区 -->
    <Card class="card-mobile border-0 shadow-sm overflow-hidden">
      <div
        class="flex items-center justify-between p-4 text-destructive cursor-pointer active:bg-destructive/5 transition-colors"
        @click="handleLogout"
      >
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
            <LogOutIcon class="h-5 w-5 text-destructive" />
          </div>
          <span class="text-sm font-medium">退出登录</span>
        </div>
        <ChevronRightIcon class="h-5 w-5 text-destructive/60" />
      </div>
    </Card>

    <!-- 清除缓存确认 Dialog -->
    <Dialog v-model:open="clearCacheDialogOpen">
      <DialogContent class="sm:max-w-[320px]">
        <DialogHeader>
          <DialogTitle>确认清除缓存</DialogTitle>
          <DialogDescription>这将清除所有本地数据，不可恢复。</DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex flex-col gap-2 mt-4">
          <Button variant="outline" class="w-full rounded-xl h-11" @click="clearCacheDialogOpen = false">取消</Button>
          <Button variant="destructive" class="w-full rounded-xl h-11" @click="confirmClearCache">确认清除</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
