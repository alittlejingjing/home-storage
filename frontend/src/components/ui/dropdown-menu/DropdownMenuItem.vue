<script setup lang="ts">
import { inject } from 'vue'
import { cn } from '@/utils/cn'

defineProps<{
  inset?: boolean
  class?: string
}>()

const emit = defineEmits<{ select: [] }>()
const ctx = inject<any>('dropdown-menu')

const handleClick = () => {
  emit('select')
  ctx?.close()
}
</script>

<template>
  <div
    :class="cn(
      'relative flex cursor-default select-none items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-none transition-colors hover:bg-accent/70 hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      $props.class
    )"
    @click="handleClick"
  >
    <slot />
  </div>
</template>
