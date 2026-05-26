<template>
  <div ref="rootRef" class="select-root">
    <button
      type="button"
      :class="triggerClass"
      :disabled="disabled"
      aria-haspopup="listbox"
      :aria-expanded="open"
      aria-label="选择"
      @click="toggle"
    >
      <span class="truncate">{{ selectedLabel || placeholder }}</span>
      <span class="ml-2 shrink-0 opacity-50" aria-hidden="true">▼</span>
    </button>
    <Transition name="select-dropdown">
      <ul
        v-show="open"
        role="listbox"
        :aria-activedescendant="modelValue || undefined"
        :class="listClass"
        @blur="onListBlur"
      >
        <slot />
      </ul>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide, watch, onUnmounted } from 'vue'
import { cn } from '@/utils/cn'
import { SELECT_CTX } from './context'

interface OptionItem {
  value: string
  label: string
}

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请选择',
  disabled: false,
})

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const options = ref<OptionItem[]>([])

const selectedLabel = computed(() => {
  const v = props.modelValue
  if (!v) return ''
  const opt = options.value.find((o) => o.value === v)
  return opt ? opt.label : v
})

const triggerClass = computed(() =>
  cn(
    'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span:first-child]:line-clamp-1',
    props.class
  )
)

const listClass = cn(
  'absolute left-0 right-0 top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-background py-1 shadow-lg'
)

function registerOption(opt: OptionItem) {
  const i = options.value.findIndex((o) => o.value === opt.value)
  if (i >= 0) {
    const next = [...options.value]
    next[i] = opt
    options.value = next
    return
  }
  options.value = [...options.value, opt]
}

function unregisterOption(value: string) {
  options.value = options.value.filter((o) => o.value !== value)
}

function select(value: string) {
  emit('update:modelValue', value)
  open.value = false
}

function toggle() {
  if (props.disabled) return
  open.value = !open.value
}

function onListBlur() {
  open.value = false
}

function onDocumentClick(e: MouseEvent) {
  const el = rootRef.value
  if (el && !el.contains(e.target as Node)) open.value = false
}

watch(open, (isOpen) => {
  if (isOpen) {
    setTimeout(() => document.addEventListener('click', onDocumentClick), 0)
  } else {
    document.removeEventListener('click', onDocumentClick)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})

provide(SELECT_CTX, {
  selectedValue: computed(() => props.modelValue ?? ''),
  select,
  registerOption,
  unregisterOption,
})
</script>

<style scoped>
.select-dropdown-enter-active,
.select-dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.1s ease;
}
.select-dropdown-enter-from,
.select-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
.select-root {
  position: relative;
}
.select-root ul {
  min-width: 100%;
  left: 0;
  right: 0;
}
</style>
