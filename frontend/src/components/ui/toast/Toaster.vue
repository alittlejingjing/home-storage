<script setup lang="ts">
import { useToast } from './useToast'
import Toast from './Toast.vue'

const { toasts, dismiss } = useToast()
</script>

<template>
  <div class="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
    <Toast
      v-for="item in toasts"
      :key="item.id"
      :variant="item.variant"
      @close="dismiss(item.id)"
    >
      <p v-if="item.title" class="text-sm font-semibold">{{ item.title }}</p>
      <p v-if="item.description" class="text-sm opacity-90">{{ item.description }}</p>
    </Toast>
  </div>
</template>
