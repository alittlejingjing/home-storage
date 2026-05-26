<script setup lang="ts">
import { inject } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import { cn } from '@/utils/cn'
import Button from '../Button.vue'

defineProps<{ class?: string }>()

const ctx = inject<any>('carousel')
</script>

<template>
  <Button
    variant="outline"
    size="icon"
    :class="cn(
      'absolute h-8 w-8 rounded-full',
      ctx?.orientation === 'horizontal'
        ? '-left-12 top-1/2 -translate-y-1/2'
        : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
      $props.class
    )"
    :disabled="!ctx?.canScrollPrev.value"
    @click="ctx?.scrollPrev()"
  >
    <ArrowLeft class="h-4 w-4" />
    <span class="sr-only">Previous slide</span>
  </Button>
</template>
