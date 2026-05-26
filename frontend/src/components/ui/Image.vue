<script setup lang="ts">
import { ref, watch } from 'vue'
import { cn } from '@/utils/cn'

const props = defineProps<{
  src?: string
  alt?: string
  fallback?: string
  class?: string
}>()

const imgSrc = ref(props.src)

watch(() => props.src, (newSrc) => {
  imgSrc.value = newSrc
})

const handleError = () => {
  if (props.fallback) {
    imgSrc.value = props.fallback
  }
}
</script>

<template>
  <img
    :src="imgSrc"
    :alt="alt"
    :class="cn('object-cover', props.class)"
    @error="handleError"
  />
</template>
