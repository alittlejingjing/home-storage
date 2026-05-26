<template>
  <div :class="cn('rounded-xl border border-border/50 bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md', ($attrs.class as string) ?? '')">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/utils/cn'
</script>
