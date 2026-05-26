<script setup lang="ts">
import { inject, computed } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
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
  <div class="flex">
    <button
      :class="cn(
        'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline',
        props.class
      )"
      @click="toggle"
    >
      <slot />
      <ChevronDown
        :class="cn(
          'h-4 w-4 shrink-0 transition-transform duration-200',
          isOpen && 'rotate-180'
        )"
      />
    </button>
  </div>
</template>
