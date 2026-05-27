## 1. 数据层与接口定义

- [x] 1.1 在 `repositories/types.ts` 中追加 `ISystemRepository` 接口：`getStats(): Promise<SystemStats>`、`clearCache(): Promise<void>`
- [x] 1.2 在 `repositories/local/` 下新建 `systemRepository.ts`，实现 `LocalSystemRepository`：
  - `getStats` 读取 `jiaxiang-items`、`jiaxiang-cabinets`、`jiaxiang-categories` 并返回 `{ totalItems, totalCabinets, totalCategories }`
  - `clearCache` 遍历 localStorage 白名单（`jiaxiang-*` 前缀 key）执行 `removeItem`，并调用 `indexedDB.deleteDatabase('jiaxiang-db')`
- [x] 1.3 在 `repositories/index.ts` 工厂中追加 `getSystemRepository(): ISystemRepository`

## 2. System Store 与页面实现

- [x] 2.1 新建 `stores/system.ts`，实现 `useSystemStore`：
  - `stats` ref（`{ totalItems, totalCabinets, totalCategories }`）
  - `fetchStats()` action：调用 `getSystemRepository().getStats()` 并写入 `stats`
  - `clearAllData()` action：调用 `getSystemRepository().clearCache()`
- [x] 2.2 新建 `views/profile/index.vue` + `index.ts` + `index.less`：
  - 用户信息卡片：使用 `el-avatar` + Tailwind 布局，图标 `@element-plus/icons-vue` 的 `UserFilled`
  - 功能入口列表：「分类管理」「数据备份」「清除缓存」，每项含图标色块 + 文字 + `ArrowRight`，使用 `el-divider` 分隔
  - 数据统计区：使用 `el-statistic` 展示 `totalItems` / `totalCabinets` / `totalCategories`
  - 系统操作区：「退出登录」红色按钮，调用 `authStore.logout()` 后 `router.push('/login')`
  - 清除缓存弹窗：使用 `ElMessageBox.confirm`，确认后调用 `systemStore.clearAllData()` 并 `location.reload()`
  - 页面 `onMounted` 时调用 `systemStore.fetchStats()`
- [x] 2.3 `index.less` 采用 `fd-` 前缀 + BEM 命名，覆盖卡片渐变背景、色块圆角、安全区等局部样式

## 3. 路由与遗留清理

- [x] 3.1 修改 `router/index.ts`，将 `/profile` 的 `component` 指向改为 `@/views/profile/index.vue`
- [x] 3.2 全局 grep 确认无其他文件引用旧 `views/Profile.vue`，然后删除旧文件
- [x] 3.3 运行 `yarn lint` 检查无 ESLint 报错
- [x] 3.4 运行 `yarn dev` 验证页面正常渲染：用户信息、入口点击、统计数字、清除缓存、退出登录

## 4. 回归验证

- [x] 4.1 确认「分类管理」入口跳转 `/categories` 正常
- [x] 4.2 确认「数据备份」入口跳转 `/backup` 正常
- [x] 4.3 确认清除缓存二次确认弹窗文案与 `spec.md` 一致
- [x] 4.4 确认清除缓存后页面刷新，localStorage 中 `jiaxiang-*` key 已被清除
- [x] 4.5 确认统计数字在新增/删除物品、储物柜、分类后重新进入「我的」页面时正确更新
- [x] 4.6 确认新的 `views/profile/` 目录下无任何 `lucide-vue-next` 或 `@/components/ui` 的 import
