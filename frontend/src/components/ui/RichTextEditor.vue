<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Bold, Italic, Underline, List, ListOrdered, Minus, Undo, Redo } from 'lucide-vue-next'
import { cn } from '@/utils/cn'
import Button from './Button.vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  class?: string
}>(), {
  modelValue: '',
  placeholder: '请输入内容...',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorRef = ref<HTMLElement | null>(null)
const content = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  content.value = val
})

const handleContentChange = () => {
  if (editorRef.value) {
    const newContent = editorRef.value.innerHTML
    content.value = newContent
    emit('update:modelValue', newContent)
  }
}

const execCommand = (command: string, value?: string) => {
  document.execCommand(command, false, value)
  editorRef.value?.focus()
  handleContentChange()
}

const charCount = computed(() => content.value.replace(/<[^>]*>/g, '').length)
const wordCount = computed(() => content.value.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length)
</script>

<template>
  <div :class="cn(
    'group relative rounded-xl border border-border bg-background shadow-sm transition-all duration-200',
    'focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20 focus-within:ring-offset-2',
    'hover:shadow-md',
    disabled && 'opacity-50 cursor-not-allowed',
    props.class
  )">
    <!-- 工具栏 -->
    <div class="flex items-center gap-0.5 p-2 border-b border-border bg-muted/30 backdrop-blur-sm rounded-t-xl">
      <!-- 撤销/重做组 -->
      <div class="flex items-center gap-0.5 mr-1">
        <Button type="button" variant="ghost" size="sm" :disabled="disabled" class="h-8 w-8 p-0 hover:bg-accent/80 transition-colors" title="撤销 (Ctrl+Z)" @click="execCommand('undo')">
          <Undo class="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" :disabled="disabled" class="h-8 w-8 p-0 hover:bg-accent/80 transition-colors" title="重做 (Ctrl+Y)" @click="execCommand('redo')">
          <Redo class="h-4 w-4" />
        </Button>
      </div>

      <div class="w-px h-6 bg-border/60 mx-1.5" />

      <!-- 文本格式组 -->
      <div class="flex items-center gap-0.5">
        <Button type="button" variant="ghost" size="sm" :disabled="disabled" class="h-8 w-8 p-0 hover:bg-accent/80 transition-colors" title="加粗 (Ctrl+B)" @click="execCommand('bold')">
          <Bold class="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" :disabled="disabled" class="h-8 w-8 p-0 hover:bg-accent/80 transition-colors" title="斜体 (Ctrl+I)" @click="execCommand('italic')">
          <Italic class="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" :disabled="disabled" class="h-8 w-8 p-0 hover:bg-accent/80 transition-colors" title="下划线 (Ctrl+U)" @click="execCommand('underline')">
          <Underline class="h-4 w-4" />
        </Button>
      </div>

      <div class="w-px h-6 bg-border/60 mx-1.5" />

      <!-- 列表组 -->
      <div class="flex items-center gap-0.5">
        <Button type="button" variant="ghost" size="sm" :disabled="disabled" class="h-8 w-8 p-0 hover:bg-accent/80 transition-colors" title="无序列表" @click="execCommand('insertUnorderedList')">
          <List class="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" :disabled="disabled" class="h-8 w-8 p-0 hover:bg-accent/80 transition-colors" title="有序列表" @click="execCommand('insertOrderedList')">
          <ListOrdered class="h-4 w-4" />
        </Button>
      </div>

      <div class="w-px h-6 bg-border/60 mx-1.5" />

      <!-- 其他工具 -->
      <Button type="button" variant="ghost" size="sm" :disabled="disabled" class="h-8 w-8 p-0 hover:bg-accent/80 transition-colors" title="分割线" @click="execCommand('insertHorizontalRule')">
        <Minus class="h-4 w-4" />
      </Button>
    </div>

    <!-- 编辑区域 -->
    <div
      ref="editorRef"
      :contenteditable="!disabled"
      :class="cn(
        'min-h-[200px] max-h-[600px] overflow-y-auto p-4 focus:outline-none',
        'prose prose-sm dark:prose-invert max-w-none',
        'text-foreground leading-relaxed',
        'selection:bg-primary/20 selection:text-primary-foreground'
      )"
      :data-placeholder="placeholder"
      :style="{ caretColor: 'hsl(var(--primary))' }"
      @input="handleContentChange"
      v-html="content"
    />

    <!-- 底部统计 -->
    <div class="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/20 rounded-b-xl">
      <div class="flex items-center gap-4 text-xs text-muted-foreground">
        <span class="font-medium">{{ charCount }} 字符</span>
        <span v-if="wordCount > 0" class="font-medium">{{ wordCount }} 词</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
[contenteditable]:empty:before {
  content: attr(data-placeholder);
  color: hsl(var(--muted-foreground));
  pointer-events: none;
  font-style: italic;
}
[contenteditable] :deep(ul),
[contenteditable] :deep(ol) {
  padding-left: 1.75rem;
  margin: 0.75rem 0;
}
[contenteditable] :deep(li) {
  margin: 0.375rem 0;
  line-height: 1.6;
}
[contenteditable] :deep(hr) {
  margin: 1.25rem 0;
  border: none;
  border-top: 2px solid hsl(var(--border));
  opacity: 0.6;
}
[contenteditable]:focus {
  outline: none;
}
</style>
