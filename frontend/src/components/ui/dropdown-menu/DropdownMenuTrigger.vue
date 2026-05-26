<script setup lang="ts">
import { inject } from 'vue'

const ctx = inject<any>('dropdown-menu')
</script>

<template>
  <div @click.stop="ctx?.toggle()">
    <slot />
  </div>
</template>
