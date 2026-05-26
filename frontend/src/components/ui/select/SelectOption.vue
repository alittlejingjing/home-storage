<template>
  <li
    role="option"
    :aria-selected="isSelected"
    :class="optionClass"
    @click="handleClick"
  >
    <slot>{{ label }}</slot>
  </li>
</template>

<script setup lang="ts">
import type { ComputedRef, VNode, VNodeChild } from 'vue'
import { computed, inject, onMounted, onUnmounted, useSlots } from 'vue'
import { cn } from '@/utils/cn'
import { SELECT_CTX } from './context'

/** 从默认插槽 VNode 取出纯文本，用于与 trigger 回显一致 */
function vnodeChildrenToPlainText(children: VNodeChild | VNodeChild[] | undefined): string {
  if (children == null || children === false) return ''
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map((c) => vnodeChildrenToPlainText(c)).join('')
  if (typeof children === 'object' && children !== null && 'children' in children) {
    return vnodeChildrenToPlainText((children as VNode).children as VNodeChild[])
  }
  return ''
}

interface SelectContext {
  selectedValue: ComputedRef<string>
  select: (v: string) => void
  registerOption: (opt: { value: string; label: string }) => void
  unregisterOption: (value: string) => void
}

interface Props {
  /** 选项值，必须为非空字符串（空字符串保留用于清除） */
  value: string
  /** 选项显示文案，不传则使用 value */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
})

const slots = useSlots()

const label = computed(() => props.label ?? props.value)

const ctx = inject<SelectContext>(SELECT_CTX)
if (!ctx) throw new Error('SelectOption 必须在 Select 内部使用')

const isSelected = computed(() => ctx!.selectedValue.value === props.value)

const optionClass = computed(() =>
  cn(
    'cursor-pointer px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
    isSelected.value && 'bg-accent text-accent-foreground'
  )
)

function handleClick() {
  ctx!.select(props.value)
}

onMounted(() => {
  const slotText = slots.default ? vnodeChildrenToPlainText(slots.default()).trim() : ''
  const resolved = props.label ?? (slotText || props.value)
  ctx!.registerOption({ value: props.value, label: resolved })
})

onUnmounted(() => {
  ctx!.unregisterOption(props.value)
})
</script>
