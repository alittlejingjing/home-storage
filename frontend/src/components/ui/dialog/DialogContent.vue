<script setup lang="ts">
import { inject } from 'vue'
import { X } from 'lucide-vue-next'
import { cn } from '@/utils/cn'
import DialogOverlay from './DialogOverlay.vue'

defineOptions({ inheritAttrs: false })

defineProps<{ class?: string }>()

const dialog = inject<any>('dialog')

const handleClose = () => {
  dialog?.close()
}
</script>

<template>
  <DialogOverlay @click="handleClose" />
  <div
    :class="cn(
      'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border/70 bg-card/95 backdrop-blur p-6 shadow-xl sm:rounded-xl',
      $props.class
    )"
  >
    <slot />
    <button
      class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-2"
      @click="handleClose"
    >
      <X class="h-4 w-4" />
      <span class="sr-only">关闭</span>
    </button>
  </div>
</template>
