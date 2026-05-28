<template>
  <div class="fd-layout">
    <!-- 顶部标题栏 -->
    <header
      v-if="showHeader"
      class="fd-layout__header"
    >
      <div class="fd-layout__header-glow" aria-hidden="true" />
      <div class="fd-layout__header-inner">
        <div class="fd-layout__header-side fd-layout__header-side--left">
          <button
            v-if="showBack"
            type="button"
            class="fd-layout__back"
            @click="goBack"
          >
            <ArrowLeft class="fd-layout__back-icon" />
            <span class="fd-layout__back-ripple" />
          </button>
        </div>
        <div class="fd-layout__title-wrap">
          <h1 class="fd-layout__title">
            {{ pageTitle }}
          </h1>
          <span class="fd-layout__title-line" aria-hidden="true" />
        </div>
        <div class="fd-layout__header-side fd-layout__header-side--right">
          <button
            v-if="showAdd"
            class="fd-layout__add"
            @click="goAdd"
          >
            <Plus class="fd-layout__add-icon" />
            <span class="fd-layout__add-ripple" />
          </button>
        </div>
      </div>
    </header>

    <!-- 内容滚动区域 -->
    <main class="fd-layout__main">
      <router-view />
    </main>

    <!-- 底部Tab导航栏 -->
    <nav
      v-if="showTab"
      class="fd-layout__tabbar"
    >
      <div class="fd-layout__tabbar-glow" aria-hidden="true" />
      <div class="fd-layout__tabbar-inner">
        <button
          v-for="tab in tabs"
          :key="tab.path"
          class="fd-layout__tab"
          :class="{ 'fd-layout__tab--active': isActive(tab.path) }"
          @click="router.push(tab.path)"
        >
          <span class="fd-layout__tab-icon-wrap">
            <component
              :is="tab.icon"
              class="fd-layout__tab-icon"
              :class="{ 'fd-layout__tab-icon--active': isActive(tab.path) }"
            />
            <span
              v-if="isActive(tab.path)"
              class="fd-layout__tab-indicator"
            />
          </span>
          <span
            class="fd-layout__tab-label"
            :class="{ 'fd-layout__tab-label--active': isActive(tab.path) }"
          >
            {{ tab.label }}
          </span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Plus, Home, Package, Archive, User } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const pageTitle = computed(() => (route.meta.title as string) || '家享收纳')
const showBack = computed(() => !!route.meta.showBack)
const showAdd = computed(() => !!route.meta.showAdd)
const showTab = computed(() => !!route.meta.showTab)
const showHeader = computed(() => showBack.value || showAdd.value || !!route.meta.title)

const tabs = [
  { path: '/home', label: '首页', icon: Home },
  { path: '/items', label: '物品', icon: Package },
  { path: '/cabinets', label: '储物柜', icon: Archive },
  { path: '/profile', label: '我的', icon: User },
]

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}

function resolveBackFallback(): string {
  const id = route.params.id as string | undefined

  switch (route.name) {
    case 'ItemDetail':
    case 'ItemCreate':
      return '/items'
    case 'ItemEdit':
      return id ? `/items/${id}` : '/items'
    case 'CabinetDetail':
    case 'CabinetCreate':
      return '/cabinets'
    case 'CabinetEdit':
      return id ? `/cabinets/${id}` : '/cabinets'
    case 'Search':
      return '/home'
    case 'Categories':
    case 'Backup':
      return '/profile'
    default:
      return '/home'
  }
}

function goBack() {
  const historyBack = window.history.state?.back as string | undefined

  if (
    historyBack
    && historyBack !== route.fullPath
    && !historyBack.startsWith('/login')
  ) {
    router.push(historyBack)
    return
  }

  router.push(resolveBackFallback())
}

function goAdd() {
  if (route.path.startsWith('/items')) {
    router.push('/items/create')
  } else if (route.path.startsWith('/cabinets')) {
    router.push('/cabinets/create')
  }
}
</script>

<style lang="less" scoped>
/* ============================================================
   fd-layout — 蓝绿色护眼极简导航布局
   ============================================================ */

.fd-layout {
  --fd-nav-white: #ffffff;
  --fd-nav-cream: #E8F4E8;
  --fd-nav-teal: #4a9e88;
  --fd-nav-teal-soft: rgba(74, 158, 136, 0.12);
  --fd-nav-teal-glow: rgba(74, 158, 136, 0.08);
  --fd-nav-ink: #2d3748;
  --fd-nav-ink-soft: #5f7a73;
  --fd-nav-border: rgba(74, 158, 136, 0.1);
  --fd-nav-glass: rgba(245, 250, 248, 0.82);
  --fd-nav-shadow: 0 -1px 20px rgba(45, 138, 120, 0.06);
  --fd-nav-tab-active: #e8f4f1;

  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 430px;
  height: 100vh;
  margin: 0 auto;
  overflow: hidden;
  font-family: var(--fd-cozy-font-body);
  background: var(--fd-nav-cream);
}

/* ---------- 顶部标题栏 ---------- */
.fd-layout__header {
  position: relative;
  flex-shrink: 0;
  z-index: 20;
}

.fd-layout__header-glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  height: 1px;
  background: linear-gradient(90deg,
      transparent 0%,
      rgba(107, 187, 166, 0.5) 30%,
      rgba(126, 203, 184, 0.8) 50%,
      rgba(107, 187, 166, 0.5) 70%,
      transparent 100%);
  opacity: 0.8;
}

.fd-layout__header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 3.25rem;
  padding: 0 1rem;
  background: var(--fd-nav-glass);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  border-bottom: 0.5px solid var(--fd-nav-border);
}

.fd-layout__header-side {
  display: flex;
  align-items: center;
  width: 2.75rem;

  &--left { justify-content: flex-start; }
  &--right { justify-content: flex-end; }
}

.fd-layout__title-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  padding: 0 0.5rem;
}

.fd-layout__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--fd-nav-ink);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 16ch;
}

.fd-layout__title-line {
  display: block;
  width: 0;
  height: 2px;
  margin-top: 3px;
  border-radius: 1px;
  background: linear-gradient(90deg, #5aad96, #7ecbb8);
  transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.fd-layout__header:hover .fd-layout__title-line {
  width: 2rem;
}

/* 返回按钮 */
.fd-layout__back,
.fd-layout__add {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--fd-nav-ink-soft);
  cursor: pointer;
  transition: color 0.25s ease, background 0.25s ease;
  overflow: hidden;

  &:hover {
    color: var(--fd-nav-teal);
    background: var(--fd-nav-teal-soft);
  }

  &:active {
    transform: scale(0.92);
  }
}

.fd-layout__back-icon,
.fd-layout__add-icon {
  width: 1.25rem;
  height: 1.25rem;
  position: relative;
  z-index: 1;
  pointer-events: none;
}

.fd-layout__back-ripple,
.fd-layout__add-ripple {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: var(--fd-nav-teal);
  opacity: 0;
  transform: scale(0);
  transition: transform 0.4s ease, opacity 0.4s ease;
  pointer-events: none;
}

.fd-layout__back:active .fd-layout__back-ripple,
.fd-layout__add:active .fd-layout__add-ripple {
  opacity: 0.1;
  transform: scale(1);
}

/* ---------- 主内容区 ---------- */
.fd-layout__main {
  flex: 1;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

/* ---------- 底部Tab导航 ---------- */
.fd-layout__tabbar {
  position: relative;
  flex-shrink: 0;
  z-index: 20;
}

.fd-layout__tabbar-glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 1px;
  background: linear-gradient(90deg,
      transparent 0%,
      rgba(107, 187, 166, 0.4) 25%,
      rgba(126, 203, 184, 0.6) 50%,
      rgba(107, 187, 166, 0.4) 75%,
      transparent 100%);
}

.fd-layout__tabbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 3.75rem;
  padding: 0 0.5rem calc(env(safe-area-inset-bottom, 0px) + 0.25rem);
  background: var(--fd-nav-glass);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border-top: 0.5px solid var(--fd-nav-border);
  box-shadow: var(--fd-nav-shadow);
}

.fd-layout__tab {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  flex: 1;
  height: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--fd-nav-ink-soft);
  transition: color 0.3s ease;
  outline: none;
}

.fd-layout__tab-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2rem;
  border-radius: 0.75rem;
  transition: background 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fd-layout__tab--active .fd-layout__tab-icon-wrap {
  background: var(--fd-nav-tab-active);
  transform: translateY(-2px);
}

.fd-layout__tab-icon {
  width: 1.25rem;
  height: 1.25rem;
  stroke-width: 1.5;
  transition: stroke-width 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fd-layout__tab-icon--active {
  stroke-width: 2.5;
  color: var(--fd-nav-teal);
  transform: scale(1.08);
}

/* 活跃指示器——小圆点 */
.fd-layout__tab-indicator {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5aad96, #4a9e88);
  animation: fd-nav-dot-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.fd-layout__tab-label {
  font-size: 0.6875rem;
  font-weight: 400;
  letter-spacing: 0.02em;
  color: var(--fd-nav-ink-soft);
  transition: color 0.3s ease, font-weight 0.3s ease, transform 0.3s ease;
}

.fd-layout__tab-label--active {
  font-weight: 600;
  color: var(--fd-nav-teal);
  transform: translateY(-1px);
}

/* ---------- 动画 ---------- */
@keyframes fd-nav-dot-pop {
  0% {
    transform: translateX(-50%) scale(0);
    opacity: 0;
  }

  70% {
    transform: translateX(-50%) scale(1.3);
    opacity: 1;
  }

  100% {
    transform: translateX(-50%) scale(1);
    opacity: 1;
  }
}

/* 页面切换时标题淡入 */
:deep(.fd-page-enter-active),
:deep(.fd-page-leave-active) {
  transition: opacity 0.25s ease;
}

:deep(.fd-page-enter-from),
:deep(.fd-page-leave-to) {
  opacity: 0;
}

/* ---------- 无障碍：减少动画 ---------- */
@media (prefers-reduced-motion: reduce) {

  .fd-layout__tab-icon-wrap,
  .fd-layout__tab-icon,
  .fd-layout__tab-label,
  .fd-layout__title-line,
  .fd-layout__back,
  .fd-layout__add {
    transition: none;
    transform: none;
    animation: none;
  }

  .fd-layout__tab-indicator {
    animation: none;
    transform: translateX(-50%) scale(1);
    opacity: 1;
  }
}
</style>
