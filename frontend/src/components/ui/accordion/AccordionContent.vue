<script setup lang="ts">
import { inject, computed } from 'vue'
import { cn } from '@/utils/cn'

const props = defineProps<{
  value: string
  class?: string
}>()

const accordion = inject<any>('accordion')
const isOpen = computed(() => accordion?.openItems.value.includes(props.value))
</script>

<template>
  <div
    v-show="isOpen"
    class="overflow-hidden text-sm transition-all"
  >
    <div :class="cn('pb-4 pt-0', props.class)">
      <slot />
    </div>
  </div>
</template>
