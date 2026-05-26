<template>
  <div :class="cn('flex flex-col items-center justify-center py-12 px-4 text-center', ($attrs.class as string) ?? '')">
    <div v-if="$slots.icon" class="mb-4 text-muted-foreground">
      <slot name="icon" />
    </div>
    <p v-if="title" class="text-sm font-medium text-foreground">{{ title }}</p>
    <p v-if="description" class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
    <div v-if="$slots.default" class="mt-4">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/utils/cn'

interface Props {
  title?: string
  description?: string
}

defineProps<Props>()
</script>
