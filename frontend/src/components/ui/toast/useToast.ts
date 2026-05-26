import { ref, type Ref } from 'vue'

export interface ToastItem {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  open: boolean
}

type ToastOptions = Omit<ToastItem, 'id' | 'open'>

const toasts: Ref<ToastItem[]> = ref([])
let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

function toast(options: ToastOptions) {
  const id = genId()
  const item: ToastItem = {
    ...options,
    id,
    open: true,
  }
  toasts.value = [item, ...toasts.value].slice(0, 10)

  // 自动关闭
  setTimeout(() => {
    dismiss(id)
  }, 5000)

  return { id, dismiss: () => dismiss(id) }
}

function dismiss(toastId?: string) {
  if (toastId) {
    toasts.value = toasts.value.filter((t) => t.id !== toastId)
  } else {
    toasts.value = []
  }
}

export function useToast() {
  return {
    toasts,
    toast,
    dismiss,
  }
}

export { toast }
