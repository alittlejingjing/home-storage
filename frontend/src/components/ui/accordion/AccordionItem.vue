<script setup lang="ts">
import { inject, computed } from 'vue'
import { cn } from '@/utils/cn'

const props = defineProps<{
  value: string
  class?: string
}>()

const accordion = inject<any>('accordion')
const isOpen = computed(() => accordion?.openItems.value.includes(props.value))

const toggle = () => {
  accordion?.toggle(props.value)
}
</script>

<template>
  <div :class="cn('border-b', props.class)">
    <slot :is-open="isOpen" :toggle="toggle" />
  </div>
</template>
