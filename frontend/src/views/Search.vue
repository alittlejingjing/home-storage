<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import { useCabinetsStore } from '@/stores/cabinets'
import { useCategoriesStore, dynamicColorPool } from '@/stores/categories'
import {
  Input,
  Card,
  CardContent,
  Badge,
  Empty,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui'
import { Search, X, Package, Archive } from 'lucide-vue-next'

const router = useRouter()
const itemsStore = useItemsStore()
const cabinetsStore = useCabinetsStore()
const categoriesStore = useCategoriesStore()

const searchKeyword = ref('')
const activeTab = ref('items')
let debounceTimer: ReturnType<typeof setTimeout> | null = null
const debouncedKeyword = ref('')

watch(searchKeyword, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedKeyword.value = searchKeyword.value
  }, 300)
})

function clearSearch() {
  searchKeyword.value = ''
  debouncedKeyword.value = ''
}

// 分类颜色
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

// 物品搜索结果（无关键词时展示全部）
const itemResults = computed(() => {
  if (!debouncedKeyword.value.trim()) {
    return itemsStore.filteredItems()
  }
  return itemsStore.filteredItems(debouncedKeyword.value.trim())
})

// 储物柜搜索结果（无关键词时展示全部）
const cabinetResults = computed(() => {
  if (!debouncedKeyword.value.trim()) {
    return cabinetsStore.filteredCabinets()
  }
  return cabinetsStore.filteredCabinets(debouncedKeyword.value.trim())
})

function goToItemDetail(id: string) {
  router.push(`/items/${id}`)
}

function goToCabinetDetail(id: string) {
  router.push(`/cabinets/${id}`)
}

function getCategoryName(categoryId: string) {
  return categoriesStore.categoryById(categoryId)?.name || '未分类'
}

function getCabinetName(cabinetId: string) {
  return cabinetsStore.cabinetById(cabinetId)?.name || '未知储物柜'
}

const hasItemResults = computed(() => itemResults.value.length > 0)
const hasCabinetResults = computed(() => cabinetResults.value.length > 0)
const showItemEmpty = computed(
  () => debouncedKeyword.value.trim().length > 0 && !hasItemResults.value
)
const showCabinetEmpty = computed(
  () => debouncedKeyword.value.trim().length > 0 && !hasCabinetResults.value
)

</script>

<template>
  <div class="page-container h-full flex flex-col overflow-hidden p-4 pb-6 space-y-4">
    <!-- 搜索输入框 -->
    <Card class="card-mobile border-0 shadow-sm bg-card/80 shrink-0">
      <CardContent class="py-3">
        <div class="relative flex items-center">
          <Search class="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            v-model="searchKeyword"
            class="pl-9 pr-9 bg-muted/50 border-0"
            placeholder="搜索物品、储物柜..."
          />
          <button
            v-if="searchKeyword"
            class="absolute right-3 inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            @click="clearSearch"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>

    <!-- Tab 切换 -->
    <Tabs v-model="activeTab" class="flex-1 flex flex-col overflow-hidden min-h-0">
      <TabsList class="shrink-0 w-full grid grid-cols-2 bg-muted/50 rounded-xl p-1">
        <TabsTrigger value="items" class="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
          物品
        </TabsTrigger>
        <TabsTrigger value="cabinets" class="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
          储物柜
        </TabsTrigger>
      </TabsList>

      <div class="flex-1 overflow-y-auto min-h-0">
        <!-- 物品结果 -->
        <TabsContent value="items" class="space-y-2">
          <div v-if="hasItemResults" class="space-y-2">
            <Card
              v-for="item in itemResults"
              :key="item.id"
              class="card-mobile cursor-pointer border-0 shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.99]"
              @click="goToItemDetail(item.id)"
            >
              <CardContent class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-14 h-14 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden"
                  >
                    <img
                      v-if="item.photos && item.photos.length > 0"
                      :src="item.photos[0]"
                      class="w-full h-full object-cover"
                      alt=""
                    />
                    <Package v-else class="h-6 w-6 text-muted-foreground/60" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="text-sm font-medium text-foreground truncate">
                        {{ item.name }}
                      </p>
                      <Badge
                        variant="secondary"
                        class="shrink-0 text-xs rounded-full border-0"
                        :class="[
                          'bg-gradient-to-r',
                          getCategoryColors(item.categoryId || '').from,
                          getCategoryColors(item.categoryId || '').to,
                          'text-white/90',
                        ]"
                      >
                        {{ getCategoryName(item.categoryId) }}
                      </Badge>
                    </div>
                    <p class="text-xs text-muted-foreground mt-1">
                      {{ getCabinetName(item.cabinetId) }}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Empty
            v-else-if="showItemEmpty"
            title="未找到相关结果"
            description="换个关键词试试"
            class="!py-4 !items-start !justify-start"
          >
            <template #icon>
              <Search class="h-10 w-10 text-muted-foreground" />
            </template>
          </Empty>
          <Empty
            v-else
            title="暂无物品"
            description="快去添加第一件物品吧"
            class="!py-4 !items-start !justify-start"
          >
            <template #icon>
              <Package class="h-10 w-10 text-muted-foreground" />
            </template>
          </Empty>
        </TabsContent>

        <!-- 储物柜结果 -->
        <TabsContent value="cabinets" class="space-y-2">
          <div v-if="hasCabinetResults" class="space-y-2">
            <Card
              v-for="cabinet in cabinetResults"
              :key="cabinet.id"
              class="card-mobile cursor-pointer border-0 shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.99]"
              @click="goToCabinetDetail(cabinet.id)"
            >
              <CardContent class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center shrink-0"
                  >
                    <Archive class="h-6 w-6 text-amber-400/70" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-foreground truncate">
                      {{ cabinet.name }}
                    </p>
                    <p class="text-xs text-muted-foreground mt-1 truncate">
                      {{ cabinet.location }}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Empty
            v-else-if="showCabinetEmpty"
            title="未找到相关结果"
            description="换个关键词试试"
            class="!py-4 !items-start !justify-start"
          >
            <template #icon>
              <Search class="h-10 w-10 text-muted-foreground" />
            </template>
          </Empty>
          <Empty
            v-else
            title="暂无储物柜"
            description="快去添加第一个储物柜吧"
            class="!py-4 !items-start !justify-start"
          >
            <template #icon>
              <Archive class="h-10 w-10 text-muted-foreground" />
            </template>
          </Empty>
        </TabsContent>
      </div>
    </Tabs>
  </div>
</template>

<style scoped>
.page-container {
  -webkit-overflow-scrolling: touch;
}
</style>
