<script setup lang="ts">
import { ref, provide, onMounted, onUnmounted } from 'vue'

const visible = ref(false)
const triggerRef = ref<HTMLElement | null>(null)

const toggle = () => {
  visible.value = !visible.value
}

const close = () => {
  visible.value = false
}

const onClickOutside = (e: MouseEvent) => {
  if (triggerRef.value && !triggerRef.value.contains(e.target as Node)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})

provide('dropdown-menu', { visible, toggle, close, triggerRef })
</script>

<template>
  <div class="relative inline-block" ref="triggerRef">
    <slot :visible="visible" :toggle="toggle" :close="close" />
  </div>
</template>
