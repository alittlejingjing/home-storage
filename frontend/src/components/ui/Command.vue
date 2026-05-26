<script setup lang="ts">
import { ref } from 'vue'
import { Search } from 'lucide-vue-next'
import { cn } from '@/utils/cn'
import Input from './Input.vue'
import Card from './Card.vue'

const props = withDefaults(defineProps<{
  placeholder?: string
  class?: string
}>(), {
  placeholder: '搜索...',
})

const emit = defineEmits<{
  search: [value: string]
}>()

const searchValue = ref('')

const handleSearch = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  searchValue.value = value
  emit('search', value)
}
</script>

<template>
  <Card :class="cn('overflow-hidden', props.class)">
    <div class="flex items-center border-b border-border px-3">
      <Search class="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
      <Input
        :placeholder="placeholder"
        :model-value="searchValue"
        class="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0"
        @input="handleSearch"
      />
    </div>
    <div class="p-1">
      <slot />
    </div>
  </Card>
</template>
