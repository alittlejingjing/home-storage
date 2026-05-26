<script setup lang="ts">
import { inject } from 'vue'
import { cn } from '@/utils/cn'

defineProps<{ class?: string }>()
const emit = defineEmits<{ select: [] }>()
const ctx = inject<any>('context-menu')

const handleClick = () => {
  emit('select')
  ctx?.close()
}
</script>

<template>
  <div
    :class="cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground',
      $props.class
    )"
    @click="handleClick"
  >
    <slot />
  </div>
</template>
