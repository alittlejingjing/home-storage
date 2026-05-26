<script setup lang="ts">
import { inject } from 'vue'
import { X } from 'lucide-vue-next'
import { cn } from '@/utils/cn'
import DrawerOverlay from './DrawerOverlay.vue'

const props = withDefaults(defineProps<{
  side?: 'right' | 'left'
  class?: string
}>(), {
  side: 'right',
})

const drawer = inject<any>('drawer')

const handleClose = () => {
  drawer?.close()
}

const sideClasses: Record<string, string> = {
  right: 'inset-y-0 right-0 h-full w-[400px] sm:w-[500px] md:w-[600px] border-l',
  left: 'inset-y-0 left-0 h-full w-[400px] sm:w-[500px] md:w-[600px] border-r',
}
</script>

<template>
  <DrawerOverlay @click="handleClose" />
  <div
    :class="cn(
      'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out',
      sideClasses[side ?? 'right'],
      props.class
    )"
  >
    <slot />
    <button
      class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      @click="handleClose"
    >
      <X class="h-4 w-4" />
      <span class="sr-only">关闭</span>
    </button>
  </div>
</template>
