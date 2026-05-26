<template>
  <div class="min-h-screen w-full max-w-[430px] mx-auto flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-background to-orange-50/50 px-6">
    <!-- Logo区域 -->
    <div class="mb-8 text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/80 to-amber-500/80 mb-4 shadow-lg shadow-primary/20">
        <Home class="h-8 w-8 text-white" />
      </div>
      <h1 class="text-2xl font-bold text-foreground">家享收纳</h1>
      <p class="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
        <Heart class="h-3 w-3 text-primary fill-primary/30" />
        温暖的家，从整理开始
      </p>
    </div>

    <!-- 登录卡片 -->
    <Card class="w-full border-0 shadow-xl shadow-primary/5 bg-card/90 backdrop-blur">
      <CardContent class="p-6 space-y-5">
        <form @submit.prevent="onSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label>邮箱</Label>
            <Input
              v-model="email"
              type="email"
              placeholder="请输入邮箱"
              class="h-11 bg-muted/50 border-0"
            />
          </div>
          <div class="space-y-2">
            <Label>密码</Label>
            <div class="relative">
              <Input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                class="h-11 bg-muted/50 border-0 pr-10"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                @click="showPassword = !showPassword"
              >
                <Eye v-if="!showPassword" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </button>
            </div>
          </div>
          <Button type="submit" class="w-full h-11 text-base bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 border-0">
            登录
          </Button>
        </form>

        <!-- 演示账号快捷入口 -->
        <div class="pt-2 text-center">
          <button
            type="button"
            class="text-sm text-primary hover:underline"
            @click="fillDemoAccount"
          >
            使用演示账号快速登录
          </button>
          <p class="text-xs text-muted-foreground mt-2">
            演示账号：admin@example.com / password
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Home, Eye, EyeOff, Heart } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { Input, Button, Label, Card, CardContent } from '@/components/ui'
import { toast } from '@/components/ui'

const router = useRouter()
const auth = useAuthStore()
const email = ref('')
const password = ref('')
const showPassword = ref(false)

async function onSubmit() {
  if (!email.value.trim() || !password.value.trim()) {
    toast({ title: '请输入邮箱和密码', variant: 'destructive' })
    return
  }
  const ok = await auth.login(email.value, password.value)
  if (ok) {
    toast({ title: '登录成功' })
    router.push('/')
  } else {
    toast({ title: '账号或密码错误', variant: 'destructive' })
  }
}

function fillDemoAccount() {
  email.value = 'admin@example.com'
  password.value = 'password'
}
</script>
