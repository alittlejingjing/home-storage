<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoriesStore, dynamicColorPool } from '@/stores/categories'
import { useToast } from '@/components/ui/toast/useToast'
import {
  Card,
  CardContent,
  Input,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Empty,
} from '@/components/ui'
import {
  Tag as TagIcon,
  Pencil as PencilIcon,
  Trash2 as Trash2Icon,
  ChevronUp as ChevronUpIcon,
  ChevronDown as ChevronDownIcon,
  Check as CheckIcon,
  X as XIcon,
  Plus,
} from 'lucide-vue-next'

const categoriesStore = useCategoriesStore()
const { categoriesWithCount } = storeToRefs(categoriesStore)
const { toast } = useToast()

const editingId = ref<string | null>(null)
const editingName = ref('')

const newCategoryName = ref('')

// 删除相关状态
const deleteDialogOpen = ref(false)
const simpleDeleteDialogOpen = ref(false)
const deleteTargetId = ref<string | null>(null)
const deleteTargetCount = ref(0)

// 自定义分类颜色映射
function getCategoryColor(categoryId: string) {
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

function startEdit(category: { id: string; name: string }) {
  editingId.value = category.id
  editingName.value = category.name
}

function cancelEdit() {
  editingId.value = null
  editingName.value = ''
}

function saveEdit(id: string) {
  const result = categoriesStore.updateCategory(id, editingName.value)
  if (!result) {
    toast({
      title: '保存失败',
      description: '分类名称已存在或格式不正确（1-20字符）',
      variant: 'destructive',
    })
    return
  }
  editingId.value = null
  editingName.value = ''
}

function handleDeleteClick(category: { id: string; count: number }) {
  deleteTargetId.value = category.id
  deleteTargetCount.value = category.count
  if (category.count > 0) {
    deleteDialogOpen.value = true
  } else {
    simpleDeleteDialogOpen.value = true
  }
}

function confirmDelete(mode: 'delete' | 'uncategorized') {
  if (!deleteTargetId.value) return
  categoriesStore.deleteCategory(deleteTargetId.value, mode)
  deleteDialogOpen.value = false
  simpleDeleteDialogOpen.value = false
  deleteTargetId.value = null
  deleteTargetCount.value = 0
}

function cancelDelete() {
  deleteDialogOpen.value = false
  simpleDeleteDialogOpen.value = false
  deleteTargetId.value = null
  deleteTargetCount.value = 0
}

function addCategory() {
  const name = newCategoryName.value.trim()
  if (!name) {
    toast({ title: '添加失败', description: '分类名称不能为空', variant: 'destructive' })
    return
  }
  if (name.length > 20) {
    toast({ title: '添加失败', description: '分类名称不能超过20个字符', variant: 'destructive' })
    return
  }
  const result = categoriesStore.addCategory(name)
  if (!result) {
    toast({ title: '添加失败', description: '分类名称已存在或格式不正确', variant: 'destructive' })
    return
  }
  newCategoryName.value = ''
}
</script>

<template>
  <div class="page-container p-4 pb-28 space-y-4 h-full overflow-y-auto">
    <!-- 分类列表 -->
    <div v-if="categoriesWithCount.length > 0" class="space-y-3">
      <Card
        v-for="(category, index) in categoriesWithCount"
        :key="category.id"
        class="card-mobile border-0 shadow-sm overflow-hidden"
      >
        <CardContent class="p-0">
          <!-- 正常模式 -->
          <div
            v-if="editingId !== category.id"
            class="flex items-center justify-between gap-2 p-3"
          >
            <div class="flex items-center gap-3 min-w-0">
              <!-- 分类色块 -->
              <div
                class="w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0"
                :class="[getCategoryColor(category.id).from, getCategoryColor(category.id).to]"
              >
                <TagIcon class="h-4 w-4 text-white/80" />
              </div>
              <div class="min-w-0">
                <span class="font-medium truncate block">{{ category.name }}</span>
                <span class="text-xs text-muted-foreground">{{ category.count }} 件物品</span>
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                class="min-touch h-8 w-8"
                :disabled="index === 0"
                @click="categoriesStore.reorderCategories(category.id, 'up')"
              >
                <ChevronUpIcon class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="min-touch h-8 w-8"
                :disabled="index === categoriesWithCount.length - 1"
                @click="categoriesStore.reorderCategories(category.id, 'down')"
              >
                <ChevronDownIcon class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="min-touch h-8 w-8"
                @click="startEdit(category)"
              >
                <PencilIcon class="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="min-touch h-8 w-8 text-destructive"
                @click="handleDeleteClick(category)"
              >
                <Trash2Icon class="h-4 w-4" />
              </Button>
            </div>
          </div>

          <!-- 编辑模式 -->
          <div v-else class="flex items-center gap-2 p-3">
            <Input
              v-model="editingName"
              class="flex-1 h-10"
              placeholder="分类名称"
              autofocus
              @keyup.enter="saveEdit(category.id)"
            />
            <Button
              variant="default"
              size="sm"
              class="min-touch h-9 w-9 p-0"
              @click="saveEdit(category.id)"
            >
              <CheckIcon class="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              class="min-touch h-9 w-9 p-0"
              @click="cancelEdit"
            >
              <XIcon class="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 空状态 -->
    <Empty v-else title="暂无分类" description="请添加您的第一个分类">
      <template #icon>
        <TagIcon class="h-12 w-12" />
      </template>
    </Empty>

    <!-- 删除确认 Dialog（有关联物品） -->
    <Dialog v-model:open="deleteDialogOpen">
      <DialogContent class="sm:max-w-[320px]">
        <DialogHeader>
          <DialogTitle>该分类下还有 {{ deleteTargetCount }} 件物品</DialogTitle>
          <DialogDescription>请选择处理方式</DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex flex-col gap-2 mt-4">
          <Button variant="destructive" class="w-full rounded-xl h-11" @click="confirmDelete('delete')">
            一并删除
          </Button>
          <Button variant="secondary" class="w-full rounded-xl h-11" @click="confirmDelete('uncategorized')">
            转移至未分类
          </Button>
          <Button variant="outline" class="w-full rounded-xl h-11" @click="cancelDelete">取消</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 删除确认 Dialog（无关联物品） -->
    <Dialog v-model:open="simpleDeleteDialogOpen">
      <DialogContent class="sm:max-w-[320px]">
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>删除后不可恢复，是否继续？</DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex flex-col gap-2 mt-4">
          <Button variant="outline" class="w-full rounded-xl h-11" @click="cancelDelete">取消</Button>
          <Button variant="destructive" class="w-full rounded-xl h-11" @click="confirmDelete('delete')">
            确认删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 新增输入框（底部固定） -->
    <div class="fixed bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur border-t border-border/50 z-40">
      <div class="flex gap-2 max-w-lg mx-auto">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-amber-300/30 flex items-center justify-center shrink-0">
          <Plus class="h-5 w-5 text-primary" />
        </div>
        <Input
          v-model="newCategoryName"
          placeholder="输入新分类名称"
          class="flex-1 h-10 bg-muted/50 border-0 rounded-xl"
          @keyup.enter="addCategory"
        />
        <Button class="h-10 px-4 rounded-xl" @click="addCategory">添加</Button>
      </div>
    </div>
  </div>
</template>

