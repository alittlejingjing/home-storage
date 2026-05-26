<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { cn } from '@/utils/cn'

defineProps<{
  align?: 'start' | 'center' | 'end'
  class?: string
}>()

const visible = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const toggle = () => {
  visible.value = !visible.value
}

const close = () => {
  visible.value = false
}

const onClickOutside = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<template>
  <div class="relative inline-block" ref="containerRef">
    <div @click.stop="toggle">
      <slot name="trigger" />
    </div>
    <div
      v-if="visible"
      :class="cn(
        'z-50 w-72 rounded-lg border border-border/70 bg-popover/95 backdrop-blur p-4 text-popover-foreground shadow-xl outline-none absolute top-full mt-1',
        align === 'end' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0',
        $props.class
      )"
      @click.stop
    >
      <slot />
    </div>
  </div>
</template>
