<template>
  <div class="h-screen w-full flex justify-center overflow-hidden bg-background">
    <router-view />
    <Toaster />
  </div>
</template>

<script setup lang="ts">
import { Toaster } from '@/components/ui'
</script>
