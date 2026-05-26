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
  <div
    v-if="isActive"
    :class="cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2', props.class)"
  >
    <slot />
  </div>
</template>
