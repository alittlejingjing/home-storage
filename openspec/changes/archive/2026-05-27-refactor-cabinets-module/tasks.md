## 1. 仓库层与类型定义

- [x] 1.1 新增 `frontend/src/types/cabinet.ts`，定义 `Cabinet`、`CabinetVO`、`CabinetFilters`、`CabinetCreateInput` 类型
- [x] 1.2 在 `frontend/src/repositories/types.ts` 中追加 `ICabinetRepository` 接口（含 `list`、`getById`、`create`、`update`、`delete`、`listItemsInCabinet`、`uploadPhoto`、`deletePhoto`）
- [x] 1.3 新增 `frontend/src/repositories/local/cabinetRepository.ts`，实现 `LocalCabinetRepository`
  - `list` 支持关键字过滤（name/location）和创建时间区间过滤，按 createdAt 倒序
  - `getById` 返回 `CabinetVO`（含 `itemCount`，通过注入的 `IItemRepository` 统计）
  - `create` 执行 R002（名称 2-30 字符）和 R005（名称唯一性）校验
  - `delete` 执行 R008（空柜校验），非空抛错
  - `uploadPhoto` / `deletePhoto` 处理 base64 照片

## 2. Store 适配

- [x] 2.1 重构 `frontend/src/stores/cabinets.ts`，委托给 `ICabinetRepository`
  - `getRepository()` 工厂函数返回 `LocalCabinetRepository`
  - `addCabinet` / `updateCabinet` / `deleteCabinet` 委托仓库并 `syncStorage`
  - `filteredCabinets` / `cabinetById` / `cabinetsWithItemCount` 保持 computed 形态
  - 保留 `STORAGE_KEY` 兼容已有 localStorage 数据

## 3. 储物柜列表页

- [x] 3.1 新增 `frontend/src/views/cabinets/index.ts`，实现 `useCabinetList()` composable
  - 关键词搜索（防抖 300ms）
  - 日期范围筛选（`[string, string] | null`）
  - 分页加载（pageSize 20，触底自动加载）
- [x] 3.2 新增 `frontend/src/views/cabinets/index.vue`，实现卡片列表 UI
  - Element Plus：`el-input`（搜索）、`el-date-picker`（时间范围）、卡片布局
  - 每张卡片展示：缩略图、名称、位置描述（单行省略）、物品数量角标
  - 底部浮动"+"按钮进入新增页
  - 空状态展示
- [x] 3.3 scoped BEM 样式（`fd-cabinets-*`），对齐 cozy 主题（样式内联于 `.vue` `<style>` 中）

## 4. 储物柜详情页

- [x] 4.1 新增 `frontend/src/views/cabinets/detail.ts`，实现 `useCabinetDetail()` composable
  - 通过 `route.params.id` 获取储物柜详情（含 `itemCount`）
  - 调用 `listItemsInCabinet` 获取柜内物品列表
  - 删除方法：空柜时 `ElMessageBox.confirm`，非空时提示并阻断
- [x] 4.2 新增 `frontend/src/views/cabinets/detail.vue`，实现详情 UI
  - 顶部照片轮播（`el-carousel`），无照片时展示占位
  - 信息分组：名称（大标题）、位置描述、创建时间
  - "柜内物品"区域：物品卡片垂直列表，点击跳转 `/items/:id`
  - 操作按钮组：编辑（跳转）、删除（`itemCount > 0` 时 disabled + `el-tooltip`）
- [x] 4.3 scoped BEM 样式（`fd-cabinet-detail-*`），对齐 cozy 主题（样式内联于 `.vue` `<style>` 中）

## 5. 储物柜表单页

- [x] 5.1 新增 `frontend/src/views/cabinets/form.ts`，实现 `useCabinetForm()` composable
  - 统一创建/编辑表单（`isEdit = computed(() => !!route.params.id)`）
  - `draft` 响应式对象：name、photos、location
  - 校验：name 非空（R002）、2-30 字符、唯一性（R005，编辑排除自身）
  - 照片处理：上传 `handleUpload`（base64，最多 3 张）、`removePhoto`
  - `isDirty` 深等比较追踪脏状态
- [x] 5.2 新增 `frontend/src/views/cabinets/form.vue`，实现表单 UI
  - `el-input`（名称，maxlength 30，show-word-limit）
  - `el-upload`（照片上传，最多 3 张，缩略图预览+删除）
  - `el-input type="textarea"`（位置描述）
  - 底部固定保存按钮（`el-button type="primary"`），宽圆角风格
  - `onBeforeRouteLeave` 未保存守卫 + `skipGuard` 保存后跳过
- [x] 5.3 scoped BEM 样式（`fd-cabinet-form-*`），对齐 cozy 主题（样式内联于 `.vue` `<style>` 中）

## 6. 路由与清理

- [x] 6.1 更新 `frontend/src/router/index.ts`
  - `/cabinets` → `views/cabinets/index.vue`
  - `/cabinets/create` → `views/cabinets/form.vue`
  - `/cabinets/:id` → `views/cabinets/detail.vue`
  - `/cabinets/:id/edit` → `views/cabinets/form.vue`
  - 设置各路由 `meta.title` 和 `meta.showBack`
- [x] 6.2 删除旧单体文件：`views/Cabinets.vue`、`views/CabinetForm.vue`、`views/CabinetDetail.vue`

## 7. 验证

- [x] 7.1 运行 `yarn build` 确保 TypeScript 类型和 Vue 编译通过
- [x] 7.2 冒烟测试路径已覆盖：创建 → 列表展示 → 详情查看（含柜内物品）→ 编辑 → 删除（R008 空柜校验在 store 和 UI 双层实现）
