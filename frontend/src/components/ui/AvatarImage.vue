<script setup lang="ts">
import { ref } from 'vue'
import { cn } from '@/utils/cn'

const props = defineProps<{
  src?: string
  alt?: string
  class?: string
}>()

const hasError = ref(false)
const onError = () => { hasError.value = true }
</script>

<template>
  <img
    v-if="src && !hasError"
    :src="src"
    :alt="alt"
    :class="cn('aspect-square h-full w-full', props.class)"
    @error="onError"
  />
</template>
