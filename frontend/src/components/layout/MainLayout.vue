<template>
  <div class="h-screen w-full max-w-[430px] mx-auto overflow-hidden flex flex-col bg-background relative">
    <!-- 顶部标题栏 -->
    <header
      v-if="showHeader"
      class="flex-shrink-0 flex items-center justify-between h-12 px-4 border-b border-border/50 bg-card/80 backdrop-blur safe-area-top z-10"
    >
      <div class="w-10">
        <button
          v-if="showBack"
          class="min-touch flex items-center justify-center text-foreground -ml-2"
          @click="goBack"
        >
          <ArrowLeft class="h-5 w-5" />
        </button>
      </div>
      <h1 class="text-base font-semibold text-foreground truncate text-center flex-1">
        {{ pageTitle }}
      </h1>
      <div class="w-10 flex justify-end">
        <button
          v-if="showAdd"
          class="min-touch flex items-center justify-center text-foreground -mr-2"
          @click="goAdd"
        >
          <Plus class="h-5 w-5" />
        </button>
      </div>
    </header>

    <!-- 内容滚动区域 -->
    <main class="flex-1 overflow-auto">
      <router-view />
    </main>

    <!-- 底部Tab导航栏 -->
    <nav
      v-if="showTab"
      class="flex-shrink-0 flex items-center justify-around h-14 border-t border-border/50 bg-card/95 backdrop-blur tab-bar-safe z-10"
    >
      <button
        v-for="tab in tabs"
        :key="tab.path"
        class="flex flex-col items-center justify-center gap-0.5 min-touch flex-1"
        @click="router.push(tab.path)"
      >
        <component
          :is="tab.icon"
          :class="cn('h-5 w-5 transition-colors', isActive(tab.path) ? 'text-primary' : 'text-muted-foreground')"
          :stroke-width="isActive(tab.path) ? 2.5 : 1.5"
        />
        <span
          :class="cn('text-xs transition-colors', isActive(tab.path) ? 'text-primary font-medium' : 'text-muted-foreground')"
        >
          {{ tab.label }}
        </span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Plus, Home, Package, Archive, User } from 'lucide-vue-next'
import { cn } from '@/utils/cn'

const route = useRoute()
const router = useRouter()

const pageTitle = computed(() => (route.meta.title as string) || '家享收纳')
const showBack = computed(() => !!route.meta.showBack)
const showAdd = computed(() => !!route.meta.showAdd)
const showTab = computed(() => !!route.meta.showTab)
const showHeader = computed(() => showBack.value || showAdd.value || !!route.meta.title)

const tabs = [
  { path: '/home', label: '首页', icon: Home },
  { path: '/items', label: '物品', icon: Package },
  { path: '/cabinets', label: '储物柜', icon: Archive },
  { path: '/profile', label: '我的', icon: User },
]

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}

function goBack() {
  router.back()
}

function goAdd() {
  if (route.path.startsWith('/items')) {
    router.push('/items/create')
  } else if (route.path.startsWith('/cabinets')) {
    router.push('/cabinets/create')
  }
}
</script>
