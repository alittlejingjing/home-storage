<script setup lang="ts">
import { inject, onMounted, onUnmounted } from 'vue'
import { cn } from '@/utils/cn'

defineProps<{ class?: string }>()

const ctx = inject<any>('context-menu')

const onClickOutside = () => {
  ctx?.close()
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="ctx?.visible.value"
      :class="cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80',
        $props.class
      )"
      :style="{ position: 'fixed', left: ctx.position.value.x + 'px', top: ctx.position.value.y + 'px' }"
      @click.stop
    >
      <slot />
    </div>
  </Teleport>
</template>
