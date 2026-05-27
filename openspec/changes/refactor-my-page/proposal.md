## 背景

当前 `我的` 页面（`frontend/src/views/Profile.vue`）仍沿用早期原型实现，使用已废弃的 Reka UI 脚手架（`@/components/ui`）和 `lucide-vue-next` 图标库，与项目目标技术栈（Vue 3 + TypeScript + Element Plus + Tailwind CSS + `@element-plus/icons-vue`）不符。同时，清除缓存操作直接调用 `localStorage.clear()`，未遵循 Repository 模式，也未复用 `ISystemRepository` 接口。本次重构旨在将该页面全面迁移至标准技术栈，并与 V1 数据访问层对齐。

## 变更内容

- 将 `Profile.vue` 中所有 `@/components/ui` 组件替换为 Element Plus（`el-card`、`el-avatar`、`el-button`、`el-dialog`、`el-statistic`、`el-space`、`el-icon`）
- 将所有 `lucide-vue-next` 图标替换为 `@element-plus/icons-vue` 图标，与项目规范一致
- 使用 Tailwind CSS 负责外层布局、间距、安全区、卡片视觉微调
- 页面文件按团队规范拆分为 `index.vue` + `index.ts` + `index.less`
- 清除缓存逻辑迁入 `ISystemRepository.clearAllLocalData()`，Profile 中仅调用 System Store
- 数据统计由直接读取各 Pinia Store 改为调用 `ISystemRepository.getStats()`
- 退出登录由直接调用 `authStore.logout()` 保持，与 `IAuthRepository.logout()` 对齐
- **破坏性变更**：删除对 `components/ui` 中 Card、Dialog、Button、Separator、Avatar 的引用，移除 `lucide-vue-next` 相关 import

## 能力

### 新增能力
- `profile-page`: 个人中心页 Element Plus 化重构，含用户信息卡片、功能入口列表、数据统计卡片、系统操作区

### 修改的能力
- 无需求级行为变更，本次为纯 UI 与数据层适配重构

## 影响面

- `frontend/src/views/Profile.vue`：重写，文件拆分为 `views/profile/index.vue`、`index.ts`、`index.less`
- `frontend/src/repositories/local/systemRepository.ts`：新增/完善（若不存在），实现 `ISystemRepository`（`getStats`、`clearCache`）
- `frontend/src/repositories/types.ts`：补充 `ISystemRepository` 接口定义（若缺失）
- `frontend/src/stores/system.ts`：新增 System Store，封装 `ISystemRepository` 调用（或扩展现有 Store）
- `frontend/src/router/index.ts`：确认 `/profile` 路由无需改动
- `frontend/src/main.ts`：确认 Element Plus 全局注册已存在
- **依赖移除**：`Profile.vue` 不再依赖 `@/components/ui` 与 `lucide-vue-next`
- **图标替换**：`TagIcon` → `CollectionTag`、`DownloadIcon` → `Download`、`Trash2Icon` → `Delete`、`LogOutIcon` → `SwitchButton`、`Package` → `Box`、`Archive` → `Files`、`Layers` → `FolderOpened`、`ChevronRightIcon` → `ArrowRight`、`Heart` → `UserFilled`
