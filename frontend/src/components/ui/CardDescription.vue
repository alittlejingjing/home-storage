<template>
  <p :class="cn('text-sm text-muted-foreground/80', ($attrs.class as string) ?? '')">
    <slot />
  </p>
</template>

<script setup lang="ts">
import { cn } from '@/utils/cn'
</script>
