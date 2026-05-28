/**
 * @file index.ts
 * @version 1.0.0
 * @author wuwg <wuwg@thunisoft.com>
 * @createTime 2026-05-27
 * @copyright thunisoft fd
 * @description 我的页面逻辑
 */

import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useSystemStore } from '@/stores/system'
import { ElMessageBox } from 'element-plus'

export function useProfile() {
    const router = useRouter()
    const authStore = useAuthStore()
    const systemStore = useSystemStore()

    const { user } = storeToRefs(authStore)
    const { stats } = storeToRefs(systemStore)

    const userNameInitial = computed(() => {
        return user.value?.name?.charAt(0) ?? '?'
    })

    function goToCategories() {
        router.push('/categories')
    }

    function goToBackup() {
        router.push('/backup')
    }

    function handleLogout() {
        authStore.logout()
        router.push('/login')
    }

    async function confirmClearCache() {
        try {
            await ElMessageBox.confirm(
                '这将清除所有本地数据，不可恢复。',
                '确认清除缓存',
                {
                    confirmButtonText: '确认清除',
                    cancelButtonText: '取消',
                    type: 'warning',
                },
            )
            await systemStore.clearAllData()
            window.location.reload()
        } catch {
            // 用户取消，不做任何操作
        }
    }

    return {
        user,
        stats,
        userNameInitial,
        goToCategories,
        goToBackup,
        handleLogout,
        confirmClearCache,
    }
}
