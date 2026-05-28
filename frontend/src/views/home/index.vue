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

        <!-- Banner 区域 - 森系卡通风格 -->
        <div class="fd-home__banner">
            <!-- 背景装饰元素 -->
            <div class="fd-home__banner-bg-decoration">
                <div class="fd-home__cloud fd-home__cloud--1">
                    <svg viewBox="0 0 60 40" class="fd-home__cloud-svg">
                        <ellipse cx="20" cy="25" rx="15" ry="12" fill="#ffffff" opacity="0.7"/>
                        <ellipse cx="40" cy="25" rx="18" ry="14" fill="#ffffff" opacity="0.7"/>
                        <ellipse cx="30" cy="18" rx="12" ry="10" fill="#ffffff" opacity="0.7"/>
                    </svg>
                </div>
                <div class="fd-home__cloud fd-home__cloud--2">
                    <svg viewBox="0 0 50 35" class="fd-home__cloud-svg">
                        <ellipse cx="15" cy="22" rx="12" ry="10" fill="#ffffff" opacity="0.6"/>
                        <ellipse cx="35" cy="22" rx="14" ry="11" fill="#ffffff" opacity="0.6"/>
                        <ellipse cx="25" cy="16" rx="10" ry="8" fill="#ffffff" opacity="0.6"/>
                    </svg>
                </div>
                <div class="fd-home__star fd-home__star--1">
                    <svg viewBox="0 0 20 20" class="fd-home__star-svg">
                        <path d="M10 2 L12 8 L18 8 L13 12 L15 18 L10 14 L5 18 L7 12 L2 8 L8 8 Z" fill="#d4a574" opacity="0.8"/>
                    </svg>
                </div>
                <div class="fd-home__star fd-home__star--2">
                    <svg viewBox="0 0 16 16" class="fd-home__star-svg">
                        <path d="M8 2 L9 6 L14 6 L10 9 L11 14 L8 11 L5 14 L6 9 L2 6 L7 6 Z" fill="#d4a574" opacity="0.6"/>
                    </svg>
                </div>
                <div class="fd-home__flower fd-home__flower--1">
                    <svg viewBox="0 0 30 30" class="fd-home__flower-svg">
                        <circle cx="15" cy="15" r="4" fill="#d4a574"/>
                        <ellipse cx="15" cy="5" rx="5" ry="8" fill="#f5e6e6"/>
                        <ellipse cx="15" cy="25" rx="5" ry="8" fill="#f5e6e6"/>
                        <ellipse cx="5" cy="15" rx="8" ry="5" fill="#f5e6e6"/>
                        <ellipse cx="25" cy="15" rx="8" ry="5" fill="#f5e6e6"/>
                    </svg>
                </div>
                <div class="fd-home__butterfly">
                    <svg viewBox="0 0 40 30" class="fd-home__butterfly-svg">
                        <ellipse cx="20" cy="15" rx="3" ry="8" fill="#f5e6e6"/>
                        <ellipse cx="10" cy="12" rx="8" ry="6" fill="#98c998" opacity="0.8"/>
                        <ellipse cx="30" cy="12" rx="8" ry="6" fill="#98c998" opacity="0.8"/>
                        <ellipse cx="8" cy="20" rx="6" ry="4" fill="#b8dbb8" opacity="0.7"/>
                        <ellipse cx="32" cy="20" rx="6" ry="4" fill="#b8dbb8" opacity="0.7"/>
                        <circle cx="10" cy="12" r="2" fill="#d4a574"/>
                        <circle cx="30" cy="12" r="2" fill="#d4a574"/>
                    </svg>
                </div>
            </div>
            
            <div class="fd-home__banner-inner">
                <div class="fd-home__banner-decoration fd-home__banner-decoration--left">
                    <svg viewBox="0 0 100 120" class="fd-home__banner-svg">
                        <path d="M50 5 C30 20, 10 40, 15 60 C20 80, 35 100, 50 115" stroke="#7cb87c" stroke-width="3" fill="none" stroke-linecap="round"/>
                        <ellipse cx="20" cy="45" rx="12" ry="8" fill="#98c998" opacity="0.6"/>
                        <ellipse cx="35" cy="70" rx="10" ry="6" fill="#b8dbb8" opacity="0.5"/>
                        <ellipse cx="25" cy="85" rx="8" ry="5" fill="#98c998" opacity="0.5"/>
                        <circle cx="30" cy="30" r="4" fill="#d4a574"/>
                        <circle cx="15" cy="55" r="3" fill="#d4a574"/>
                        <!-- 可爱小鸟 -->
                        <path d="M8 35 Q12 32, 18 35 Q14 38, 8 35" fill="#f5e6e6"/>
                        <circle cx="10" cy="33" r="2" fill="#4a5c4a"/>
                    </svg>
                </div>
                
                <div class="fd-home__banner-content">
                    <div class="fd-home__banner-icon">
                        <svg viewBox="0 0 70 70" class="fd-home__banner-icon-svg">
                            <!-- 可爱收纳盒 -->
                            <rect x="10" y="25" width="50" height="35" rx="4" fill="#fef9f2" stroke="#7cb87c" stroke-width="3"/>
                            <rect x="15" y="30" width="40" height="8" rx="2" fill="#e8f4e8" stroke="#7cb87c" stroke-width="2"/>
                            <line x1="22" y1="30" x2="22" y2="38" stroke="#7cb87c" stroke-width="2"/>
                            <line x1="29" y1="30" x2="29" y2="38" stroke="#7cb87c" stroke-width="2"/>
                            <line x1="36" y1="30" x2="36" y2="38" stroke="#7cb87c" stroke-width="2"/>
                            <line x1="43" y1="30" x2="43" y2="38" stroke="#7cb87c" stroke-width="2"/>
                            <!-- 可爱表情 -->
                            <circle cx="25" cy="20" r="4" fill="#4a5c4a"/>
                            <circle cx="45" cy="20" r="4" fill="#4a5c4a"/>
                            <circle cx="26" cy="19" r="1.5" fill="#ffffff"/>
                            <circle cx="46" cy="19" r="1.5" fill="#ffffff"/>
                            <path d="M28 40 Q35 45, 42 40" stroke="#d4a574" stroke-width="3" fill="none" stroke-linecap="round"/>
                            <!-- 腮红 -->
                            <ellipse cx="18" cy="22" rx="4" ry="3" fill="#f5e6e6" opacity="0.6"/>
                            <ellipse cx="52" cy="22" rx="4" ry="3" fill="#f5e6e6" opacity="0.6"/>
                        </svg>
                    </div>
                    <h1 class="fd-home__title">
                        家享收纳
                    </h1>
                    <p class="fd-home__subtitle">
                        <span class="fd-home__subtitle-dot" />
                        温暖的家，从整理开始
                    </p>
                </div>
                
                <div class="fd-home__banner-decoration fd-home__banner-decoration--right">
                    <svg viewBox="0 0 100 120" class="fd-home__banner-svg">
                        <path d="M50 5 C70 20, 90 40, 85 60 C80 80, 65 100, 50 115" stroke="#7cb87c" stroke-width="3" fill="none" stroke-linecap="round"/>
                        <ellipse cx="80" cy="45" rx="12" ry="8" fill="#98c998" opacity="0.6"/>
                        <ellipse cx="65" cy="70" rx="10" ry="6" fill="#b8dbb8" opacity="0.5"/>
                        <ellipse cx="75" cy="85" rx="8" ry="5" fill="#98c998" opacity="0.5"/>
                        <circle cx="70" cy="30" r="4" fill="#d4a574"/>
                        <circle cx="85" cy="55" r="3" fill="#d4a574"/>
                        <!-- 可爱小松鼠 -->
                        <ellipse cx="90" cy="40" rx="8" ry="6" fill="#d4a574"/>
                        <circle cx="88" cy="38" r="2" fill="#4a5c4a"/>
                        <ellipse cx="85" cy="40" rx="3" ry="2" fill="#f5e6e6"/>
                        <path d="M92 35 Q95 30, 98 35" stroke="#4a5c4a" stroke-width="2" fill="none"/>
                    </svg>
                </div>
            </div>
            
            <!-- 底部波浪装饰 -->
            <div class="fd-home__banner-wave">
                <svg viewBox="0 0 400 35" preserveAspectRatio="none" class="fd-home__wave-svg">
                    <path d="M0 20 Q50 5, 100 20 T200 20 T300 20 T400 20 L400 35 L0 35 Z" fill="#fef9f2"/>
                    <path d="M0 25 Q50 12, 100 25 T200 25 T300 25 T400 25" stroke="#98c998" stroke-width="2" fill="none" opacity="0.5"/>
                </svg>
            </div>
        </div>

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
            <div class="fd-home__cat-grid">
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
