<script setup lang="ts">
import { ref, provide } from 'vue'

const visible = ref(false)
const position = ref({ x: 0, y: 0 })

const open = (e: MouseEvent) => {
  e.preventDefault()
  position.value = { x: e.clientX, y: e.clientY }
  visible.value = true
}

const close = () => {
  visible.value = false
}

provide('context-menu', { visible, position, open, close })
</script>

<template>
  <div @contextmenu="open">
    <slot :visible="visible" :position="position" :close="close" />
  </div>
</template>
