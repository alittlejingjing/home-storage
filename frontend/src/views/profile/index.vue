<script setup lang="ts">
import { onMounted } from 'vue'
import {
    CollectionTag,
    Download,
    Delete,
    SwitchButton,
    ArrowRight,
    Box,
    Files,
    FolderOpened,
    UserFilled,
} from '@element-plus/icons-vue'
import { useSystemStore } from '@/stores/system'
import { useProfile } from './index'

const {
    user,
    stats,
    userNameInitial,
    goToCategories,
    goToBackup,
    handleLogout,
    confirmClearCache,
} = useProfile()

onMounted(() => {
    const systemStore = useSystemStore()
    systemStore.fetchStats()
})
</script>

<template>
    <div class="fd-profile">
        <!-- 用户信息卡片 -->
        <el-card class="fd-profile__user-card card-mobile" shadow="never">
            <div class="flex items-center gap-4">
                <div class="fd-profile__avatar-wrap">
                    <el-avatar :size="56" class="text-lg font-semibold" :style="{
                        background: 'linear-gradient(135deg, #4a9e88cc, #d97706cc)',
                        color: '#fff',
                    }">
                        {{ userNameInitial }}
                    </el-avatar>
                    <div class="fd-profile__avatar-status" />
                </div>
                <div class="flex-1 min-w-0">
                    <p class="fd-profile__user-name truncate">
                        {{ user?.name ?? '未登录' }}
                    </p>
                    <p class="fd-profile__user-role">
                        <el-icon class="text-primary">
                            <UserFilled />
                        </el-icon>
                        家庭管理员
                    </p>
                </div>
            </div>
        </el-card>

        <!-- 功能入口列表 -->
        <el-card class="fd-profile__menu-card card-mobile mt-4" shadow="never">
            <div class="fd-profile__menu-item" @click="goToCategories">
                <div class="flex items-center gap-3">
                    <div class="fd-profile__menu-icon-wrap fd-profile__menu-icon-wrap--primary">
                        <el-icon class="fd-profile__menu-icon fd-profile__menu-icon--primary">
                            <CollectionTag />
                        </el-icon>
                    </div>
                    <span class="fd-profile__menu-label">分类管理</span>
                </div>
                <el-icon class="fd-profile__menu-arrow">
                    <ArrowRight />
                </el-icon>
            </div>

            <div class="fd-profile__menu-item" @click="goToBackup">
                <div class="flex items-center gap-3">
                    <div class="fd-profile__menu-icon-wrap fd-profile__menu-icon-wrap--warning">
                        <el-icon class="fd-profile__menu-icon fd-profile__menu-icon--warning">
                            <Download />
                        </el-icon>
                    </div>
                    <span class="fd-profile__menu-label">数据备份</span>
                </div>
                <el-icon class="fd-profile__menu-arrow">
                    <ArrowRight />
                </el-icon>
            </div>

            <div class="fd-profile__menu-item" @click="confirmClearCache">
                <div class="flex items-center gap-3">
                    <div class="fd-profile__menu-icon-wrap fd-profile__menu-icon-wrap--muted">
                        <el-icon class="fd-profile__menu-icon fd-profile__menu-icon--muted">
                            <Delete />
                        </el-icon>
                    </div>
                    <span class="fd-profile__menu-label">清除缓存</span>
                </div>
                <el-icon class="fd-profile__menu-arrow">
                    <ArrowRight />
                </el-icon>
            </div>
        </el-card>

        <!-- 数据统计区 -->
        <div class="mt-5">
            <h2 class="fd-profile__stats-title mb-3">数据统计</h2>
            <div class="grid grid-cols-3 gap-2.5">
                <el-card v-for="stat in [
                    { value: stats.totalItems, label: '总物品', icon: Box },
                    { value: stats.totalCabinets, label: '总储物柜', icon: Files },
                    { value: stats.totalCategories, label: '总分类', icon: FolderOpened },
                ]" :key="stat.label" class="fd-profile__stat-card card-mobile" shadow="never">
                    <el-icon class="fd-profile__stat-icon">
                        <component :is="stat.icon" />
                    </el-icon>
                    <p class="fd-profile__stat-value">{{ stat.value }}</p>
                    <p class="fd-profile__stat-label">{{ stat.label }}</p>
                </el-card>
            </div>
        </div>

        <!-- 系统操作区 -->
        <el-card class="fd-profile__action-card card-mobile mt-4" shadow="never">
            <div class="fd-profile__menu-item fd-profile__menu-item--danger" @click="handleLogout">
                <div class="flex items-center gap-3">
                    <div class="fd-profile__menu-icon-wrap fd-profile__menu-icon-wrap--danger">
                        <el-icon class="fd-profile__menu-icon fd-profile__menu-icon--danger">
                            <SwitchButton />
                        </el-icon>
                    </div>
                    <span class="fd-profile__menu-label">退出登录</span>
                </div>
                <el-icon class="fd-profile__menu-arrow fd-profile__menu-arrow--danger">
                    <ArrowRight />
                </el-icon>
            </div>
        </el-card>
    </div>
</template>

<style lang="less" scoped>
@import './index.less';
</style>
