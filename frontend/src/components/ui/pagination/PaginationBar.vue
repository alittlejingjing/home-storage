<template>
  <div
    v-if="total > 0"
    class="pagination-bar"
  >
    <span
      v-if="showTotal"
      class="pagination-total"
    >
      共 {{ total }} 条
    </span>

    <div class="pagination-nav">
      <button
        type="button"
        class="pagination-btn yzw-pagination-nav-btn"
        :disabled="page <= 1"
        aria-label="上一页"
        @click="goPage(page - 1)"
      >
        <ChevronLeft
          class="pagination-nav-icon"
          aria-hidden="true"
          :stroke-width="2"
        />
      </button>

      <button
        v-for="item in pageNumbers"
        :key="`${item}-${page}`"
        type="button"
        class="pagination-btn yzw-pagination-page-btn"
        :class="{ 'is-active': item === page, 'is-ellipsis': item === 'ellipsis' }"
        :disabled="item === 'ellipsis' || item === page"
        @click="typeof item === 'number' && goPage(item)"
      >
        {{ item === 'ellipsis' ? '···' : item }}
      </button>

      <button
        type="button"
        class="pagination-btn yzw-pagination-nav-btn"
        :disabled="page >= totalPages"
        aria-label="下一页"
        @click="goPage(page + 1)"
      >
        <ChevronRight
          class="pagination-nav-icon"
          aria-hidden="true"
          :stroke-width="2"
        />
      </button>
    </div>

    <div
      v-if="showSizeChanger"
      class="pagination-sizer"
    >
      <select
        :value="pageSize"
        class="pagination-sizer-select"
        aria-label="每页条数"
        @change="onPageSizeChange"
      >
        <option
          v-for="size in pageSizes"
          :key="size"
          :value="size"
        >
          {{ size }}条/页
        </option>
      </select>
    </div>

    <div
      v-if="showQuickJumper"
      class="pagination-jumper"
    >
      <span>跳至</span>
      <input
        v-model="jumpValue"
        class="pagination-jump-input yzw-pagination-jump-input"
        type="text"
        inputmode="numeric"
        @keydown.enter="onJump"
      />
      <span>页</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { computed, ref } from 'vue'

type PageItem = number | 'ellipsis'

interface Props {
  total: number
  page?: number
  pageSize?: number
  pageSizes?: number[]
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  page: 1,
  pageSize: 10,
  pageSizes: () => [10, 20, 50, 100],
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: true,
})

const emit = defineEmits<{
  (e: 'update:page', value: number): void
  (e: 'update:pageSize', value: number): void
}>()

const jumpValue = ref('')

const totalPages = computed(() =>
  props.total <= 0 ? 1 : Math.max(1, Math.ceil(props.total / props.pageSize))
)

const pageNumbers = computed<PageItem[]>(() => {
  const pages: PageItem[] = []
  const showPages = 5

  if (totalPages.value <= showPages + 2) {
    for (let i = 1; i <= totalPages.value; i += 1) pages.push(i)
    return pages
  }

  pages.push(1)

  if (props.page > 3) pages.push('ellipsis')

  const start = Math.max(2, props.page - 1)
  const end = Math.min(totalPages.value - 1, props.page + 1)

  for (let i = start; i <= end; i += 1) pages.push(i)

  if (props.page < totalPages.value - 2) pages.push('ellipsis')

  pages.push(totalPages.value)
  return pages
})

function goPage(p: number) {
  const next = Math.max(1, Math.min(p, totalPages.value))
  if (next !== props.page) emit('update:page', next)
}

function onPageSizeChange(e: Event) {
  const val = Number((e.target as HTMLSelectElement).value)
  if (!Number.isNaN(val) && val !== props.pageSize) {
    emit('update:pageSize', val)
    emit('update:page', 1)
  }
}

function onJump() {
  const page = Number.parseInt(jumpValue.value, 10)
  if (Number.isNaN(page)) return
  if (page >= 1 && page <= totalPages.value) {
    goPage(page)
    jumpValue.value = ''
  }
}
</script>

<style scoped>
.pagination-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--yzw-muted-foreground, var(--muted-foreground));
}

.pagination-total {
  margin-right: 0.25rem;
  color: var(--yzw-muted-foreground, var(--muted-foreground));
}

.pagination-nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination-nav-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.pagination-btn {
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  border: 1px solid var(--yzw-input, var(--border));
  border-radius: 3px;
  background: #fff;
  color: #4b4f57;
  font-size: 0.875rem;
  cursor: pointer;
}

.pagination-btn.yzw-pagination-nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--yzw-primary, var(--primary));
}

.pagination-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.yzw-pagination-page-btn.is-active {
  border-color: var(--yzw-primary, var(--primary));
  background: var(--yzw-primary, var(--primary));
  color: #ffffff;
  opacity: 1;
}

.yzw-pagination-page-btn.is-ellipsis {
  border-color: transparent;
}

.pagination-sizer {
  margin-left: 0.25rem;
}

.pagination-sizer-select {
  height: 2rem;
  padding: 0 0.5rem;
  border: 1px solid var(--yzw-input, var(--border));
  border-radius: 3px;
  background: #fff;
  color: #4b4f57;
  font-size: 0.875rem;
  cursor: pointer;
}

.pagination-jumper {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.25rem;
  color: var(--yzw-muted-foreground, var(--muted-foreground));
}

.pagination-jump-input {
  width: 3rem;
  height: 2rem;
  padding: 0 0.375rem;
  border: 1px solid var(--yzw-input, var(--border));
  border-radius: 3px;
  background: #fff;
  color: #4b4f57;
  text-align: center;
}
</style>
