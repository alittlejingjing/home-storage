<script setup lang="ts">
import { inject, computed } from 'vue'
import { cn } from '@/utils/cn'

const props = defineProps<{
  value: string
  class?: string
}>()

const ctx = inject<any>('tabs')
const isActive = computed(() => ctx?.activeTab.value === props.value)
</script>

<template>
  <button
    :data-state="isActive ? 'active' : 'inactive'"
    :class="cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      isActive && 'bg-background text-foreground shadow',
      props.class
    )"
    @click="ctx?.setActiveTab(value)"
  >
    <slot />
  </button>
</template>
