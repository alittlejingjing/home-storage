/**
 * @file index.ts
 * @version 1.0.0
 * @author wuwg <wuwg@thunisoft.com>
 * @createTime 2026-05-26
 * @copyright thunisoft fd
 * @see [jsDoc中文文档]{@link http://www.dba.cn/book/jsdoc/JSDOCKuaiBiaoQianBLOCKTAGS/CONSTRUCTS.html}
 * @description 登录页 composable：表单校验、提交登录、演示账号填充
 * @updateTime 2026-05-26
 */

import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

export interface LoginFormModel {
  email: string
  password: string
}

/**
 * 登录表单逻辑
 * V2 可将 auth.login 替换为 IAuthRepository.login
 */
export function useLoginForm() {
  const router = useRouter()
  const auth = useAuthStore()
  const formRef = ref<FormInstance>()
  const loading = ref(false)

  const formModel = reactive<LoginFormModel>({
    email: '',
    password: '',
  })

  const rules: FormRules<LoginFormModel> = {
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
    ],
  }

  async function submit() {
    if (!formRef.value) {
      return
    }

    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) {
      return
    }

    loading.value = true
    try {
      const ok = await auth.login(formModel.email.trim(), formModel.password)
      if (ok) {
        ElMessage.success('登录成功')
        await router.push('/home')
      } else {
        ElMessage.error('账号或密码错误')
      }
    } finally {
      loading.value = false
    }
  }

  function fillDemoAccount() {
    formModel.email = 'admin@example.com'
    formModel.password = 'password'
  }

  return {
    formRef,
    formModel,
    rules,
    loading,
    submit,
    fillDemoAccount,
  }
}
