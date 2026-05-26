<script setup lang="ts">
import { cn } from '@/utils/cn'

defineProps<{ class?: string }>()
const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <div
    :class="cn(
      'fixed inset-0 z-50 bg-black/55 backdrop-blur-sm',
      $props.class
    )"
    @click="emit('click')"
  />
</template>
