<template>
    <div class="fd-home" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
        <div v-show="showPullIndicator" class="fd-home__pull" :style="{ height: pullDistance + 'px' }">
            <div class="fd-home__pull-inner">
                <el-icon
                    class="fd-home__pull-icon"
                    :class="{ 'fd-home__pull-icon--spin': pullState === 'refreshing' }"
                    :size="20"
                    :style="{ transform: 'rotate(' + pullProgress * 360 + 'deg)' }"
                >
                    <Refresh />
                </el-icon>
                <span class="fd-home__pull-text">
                    {{ pullState === 'refreshing' ? '刷新中...' : '松开刷新' }}
                </span>
            </div>
        </div>

        <header class="fd-home__header">
            <div class="fd-home__header-row">
                <span class="fd-home__header-accent" aria-hidden="true" />
                <div>
                    <h1 class="fd-home__title">
                        家享收纳
                    </h1>
                    <p class="fd-home__subtitle">
                        <span class="fd-home__subtitle-dot" />
                        温暖的家，从整理开始
                    </p>
                </div>
            </div>
        </header>

        <div class="fd-home__search-card" role="button" tabindex="0" @click="goToSearch" @keyup.enter="goToSearch">
            <div class="fd-home__search-accent" aria-hidden="true" />
            <div class="fd-home__search-body">
                <span class="fd-home__search-icon-wrap">
                    <el-icon :size="18">
                        <Search />
                    </el-icon>
                </span>
                <span class="fd-home__search-text">搜索物品、储物柜...</span>
                <el-icon class="fd-home__search-arrow" :size="16">
                    <ArrowRight />
                </el-icon>
            </div>
        </div>

        <div class="fd-home__stats">
            <el-card
                v-for="(stat, idx) in stats"
                :key="stat.label"
                class="fd-home__stat-card"
                :class="'fd-home__stat-card--tone-' + idx"
                shadow="never"
                @click="goToPath(stat.path)"
            >
                <div class="fd-home__stat-body">
                    <span class="fd-home__stat-deco" aria-hidden="true" />
                    <p class="fd-home__stat-value">
                        {{ stat.value }}
                    </p>
                    <p class="fd-home__stat-label">
                        {{ stat.label }}
                    </p>
                </div>
            </el-card>
        </div>

        <section class="fd-home__section">
            <h2 class="fd-home__section-title">
                <span class="fd-home__section-line" aria-hidden="true" />
                物品分类
            </h2>
            <div v-if="dashboard.categoryStats.length > 0" class="fd-home__cat-grid">
                <div
                    v-for="cat in dashboard.categoryStats"
                    :key="cat.categoryId"
                    class="fd-home__cat-card"
                    :class="'fd-home__cat-card--tone-' + getCategoryToneIndex(cat.categoryId)"
                    role="button"
                    tabindex="0"
                    @click="goToItems(cat.categoryId)"
                    @keyup.enter="goToItems(cat.categoryId)"
                >
                    <div class="fd-home__cat-card-inner">
                        <span class="fd-home__cat-deco" aria-hidden="true" />
                        <div class="fd-home__cat-top">
                            <span class="fd-home__cat-icon-wrap">
                                <el-icon :size="16">
                                    <component :is="getCategoryIcon(cat.categoryId)" />
                                </el-icon>
                            </span>
                            <span class="fd-home__cat-count">{{ cat.count }} 件</span>
                        </div>
                        <p class="fd-home__cat-name">
                            {{ cat.name }}
                        </p>
                    </div>
                </div>
                <div
                    class="fd-home__cat-add"
                    role="button"
                    tabindex="0"
                    @click="openCustomCategoryDialog"
                    @keyup.enter="openCustomCategoryDialog"
                >
                    <div class="fd-home__cat-add-inner">
                        <span class="fd-home__cat-add-circle">
                            <el-icon :size="18">
                                <Plus />
                            </el-icon>
                        </span>
                        <span class="fd-home__cat-add-text">自定义分类</span>
                    </div>
                </div>
            </div>
            <el-empty v-else description="暂无分类，去添加吧" :image-size="80" />
        </section>

        <section class="fd-home__section">
            <div class="fd-home__quick-grid">
                <el-card class="fd-home__quick-card" shadow="never" @click="goToItems()">
                    <div class="fd-home__quick-body">
                        <span class="fd-home__quick-icon">
                            <el-icon :size="18">
                                <Box />
                            </el-icon>
                        </span>
                        <div>
                            <p class="fd-home__quick-title">
                                全部物品
                            </p>
                            <p class="fd-home__quick-desc">
                                查看所有
                            </p>
                        </div>
                    </div>
                </el-card>
                <el-card class="fd-home__quick-card" shadow="never" @click="goToPath('/cabinets')">
                    <div class="fd-home__quick-body">
                        <span class="fd-home__quick-icon">
                            <el-icon :size="18">
                                <House />
                            </el-icon>
                        </span>
                        <div>
                            <p class="fd-home__quick-title">
                                储物柜
                            </p>
                            <p class="fd-home__quick-desc">
                                空间管理
                            </p>
                        </div>
                    </div>
                </el-card>
            </div>
        </section>

        <el-dialog
            v-model="customDialogOpen"
            title="添加自定义分类"
            width="90%"
            class="fd-home__dialog"
            align-center
        >
            <p class="fd-home__dialog-desc">
                创建一个新的物品分类
            </p>
            <el-input
                v-model="newCategoryName"
                placeholder="请输入分类名称"
                size="large"
                @keyup.enter="addCustomCategory"
            />
            <div class="fd-home__dialog-footer">
                <el-button @click="customDialogOpen = false">
                    取消
                </el-button>
                <el-button type="primary" @click="addCustomCategory">
                    添加
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import {
    ArrowRight,
    Box,
    House,
    Plus,
    Refresh,
    Search,
} from '@element-plus/icons-vue'
import { useHomeDashboard } from './index.ts'

const {
    dashboard,
    stats,
    pullState,
    pullDistance,
    showPullIndicator,
    pullProgress,
    customDialogOpen,
    newCategoryName,
    getCategoryIcon,
    getCategoryToneIndex,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    goToSearch,
    goToItems,
    goToPath,
    openCustomCategoryDialog,
    addCustomCategory,
} = useHomeDashboard()
</script>

<style lang="less" src="./index.less"></style>
