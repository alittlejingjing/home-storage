<template>
  <label :for="htmlFor" :class="cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', ($attrs.class as string) ?? '')">
    <slot />
  </label>
</template>

<script setup lang="ts">
import { cn } from '@/utils/cn'

interface Props {
  htmlFor?: string
}

defineProps<Props>()
</script>
