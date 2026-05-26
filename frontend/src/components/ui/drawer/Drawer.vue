<script setup lang="ts">
import { computed, provide } from 'vue'

const props = withDefaults(defineProps<{
  open?: boolean
}>(), {
  open: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val),
})

const close = () => {
  isOpen.value = false
}

provide('drawer', { isOpen, close })
</script>

<template>
  <Teleport to="body">
    <template v-if="isOpen">
      <slot />
    </template>
  </Teleport>
</template>
