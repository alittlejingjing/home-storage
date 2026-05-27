## Context

`frontend/src/views/Profile.vue` 是当前底部 Tab「我的」页面的唯一实现文件，仍沿用早期原型技术栈：
- UI 组件来自 `@/components/ui`（基于 Reka UI 的脚手架组件：Card、Dialog、Button、Separator、Avatar 等）
- 图标全部来自 `lucide-vue-next`
- 清除缓存直接调用 `localStorage.clear()`，未走 Repository 接口
- 数据统计直接引用 `itemsStore`、`cabinetsStore`、`categoriesStore` 的 `totalCount`

项目目标架构已在 `openspec/project.md` 及 `详细设计_前端数据访问层.md` 中明确：Vue 3 + TypeScript + Pinia + Element Plus + Tailwind CSS + `@element-plus/icons-vue`，View/Store 禁止直接读写 localStorage，须经 Repository。

本次重构需将 Profile 页全面迁移至目标栈，同时补齐缺失的 `ISystemRepository` 接口与 System Store，使「清除缓存」「数据统计」两个行为与 V1 数据层对齐。

## 目标 / 排除项

**目标：**
1. `Profile.vue` 100% 替换为 Element Plus 组件 + Tailwind CSS 布局 + `@element-plus/icons-vue` 图标
2. 按团队规范将 `Profile.vue` 拆分为 `views/profile/index.vue` + `index.ts` + `index.less`
3. 在 `repositories/types.ts` 中补充 `ISystemRepository` 接口（`getStats`、`clearCache`）
4. 在 `repositories/local/` 中实现 `LocalSystemRepository`
5. 新增 `stores/system.ts`，封装 System Store，Profile 中只调 Store
6. 更新 `router/index.ts`，将 `/profile` 指向新的 `views/profile/index.vue`
7. 彻底移除 Profile 页对 `@/components/ui` 与 `lucide-vue-next` 的依赖

**排除项：**
- 不改动 `Categories.vue` 和 `Backup.vue`（它们在本次范围外）
- 不引入后端 API（仍为 V1，纯本地）
- 不改动机 app's 其他页面或 MainLayout
- 不改造其他 Store 中已有的 localStorage 直接读写（那是另一批变更）

## 决策

### 决策 1：文件拆分方式
将单文件 `Profile.vue` 拆分为 `views/profile/index.vue` + `index.ts` + `index.less`。

**决策依据：** 团队规范 §6.2 要求「HTML / JS / CSS 分离」，单文件 <1000 行时仍建议拆分以便维护。Profile 页逻辑较轻（~180 行），但为统一风格执行拆分。

**备选方案：** 保持单文件——被拒，与团队新建/重写组件的规范冲突。

### 决策 2：System Store 的职责边界
System Store 仅封装 `ISystemRepository` 的调用，不做业务聚合计算。`getStats` 由 Repository 读取各 Store 数据并返回统计对象；`clearCache` 由 Repository 执行 `localStorage` 业务 key 清理 + `indexedDB.deleteDatabase`。

**决策依据：** `详细设计_用户与系统.md` §3.4 明确定义 `ISystemRepository.getStats` 和 `clearCache`；Store 只做「调用 Repository + 状态暂存」。

**备选方案：** 让 Profile 页直接调各 Store 的 `totalCount`——被拒，违反「View 不直接感知数据源」原则。

### 决策 3：是否复用现有 `authStore.logout`
退出登录保持直接调用 `authStore.logout()` + `router.push('/login')`，不在 System Store 中二次封装。

**决策依据：** `IAuthRepository.logout` 已在 `详细设计_用户与系统.md` §3.2 中定义，且 `authStore` 已持久化注销行为；额外封装一层无实质收益。

**备选方案：** 在 System Store 中新增 `logout` action——被拒，增加无意义的委托。

### 决策 4：Element Plus 组件选型对照

| 原 Reka UI 组件 | Element Plus 替换 |
|---------------|-----------------|
| Card / CardContent | `el-card` |
| Avatar / AvatarFallback | `el-avatar` |
| Button | `el-button` |
| Separator | `el-divider` 或 Tailwind border |
| Dialog / DialogContent / DialogHeader… | `el-dialog` + `ElMessageBox.confirm` |

**决策依据：** `openspec/project.md` §5.4 已给出完整迁移对照表；`ElMessageBox.confirm` 比 `el-dialog` 更轻量，适合「清除缓存二次确认」场景。

## 风险与权衡

- [风险] `views/profile/` 目录新建后，旧 `views/Profile.vue` 残留可能被其他文件 import → 迁移完成后需全局 grep 确认无引用，然后删除旧文件。
- [风险] `ISystemRepository.clearCache` 需要清理所有 `jiaxiang-*` localStorage key 以及 `jiaxiang-db` IndexedDB → 实现时必须白名单匹配 `jiaxiang-` 前缀，避免误清其他站点数据。
- [风险] 路由指向变更后，开发热更新可能报错「找不到模块」→ 确保新文件创建后再改路由。
- [权衡] System Store 的 `getStats` 在 V1 需要读取各 Store 的数据；当前 Store 之间无循环依赖风险，但未来若 Store 拆分更细，需避免循环 import → 当前通过将统计逻辑下沉到 Repository 中，Repository 直接读 localStorage，不依赖 Store，规避此问题。

## 迁移计划

1. 创建 `views/profile/index.vue`、`index.ts`、`index.less`
2. 修改 `repositories/types.ts`，追加 `ISystemRepository`
3. 创建 `repositories/local/systemRepository.ts`
4. 创建 `stores/system.ts`
5. 更新 `router/index.ts`：`/profile` 指向 `views/profile/index.vue`
6. 运行 `yarn dev` 验证页面渲染、统计数字、清除缓存、退出登录
7. 确认无其他文件引用旧 `views/Profile.vue` 后删除之
8. 运行 `yarn lint` 通过

## 待决策问题

无。
