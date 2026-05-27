## 1. 仓库与类型

- [x] 1.1 在 `repositories/types.ts` 中创建 `IItemRepository` 接口（create, update, delete, list, getById）
- [x] 1.2 在 `repositories/local/itemRepository.ts` 中实现 `LocalItemRepository`，localStorage 持久化
- [x] 1.3 创建 `repositories/utils/photoCompress.ts`，实现 `compressPhoto(file)` 工具（缩放到 1280px、质量 80%、base64 输出）
- [x] 1.4 在仓库中添加级联逻辑：R011（移动时更新储物柜计数）、R012（删除时储物柜计数 -1）
- [x] 1.5 创建 `types/item.ts`，定义 `ItemVO`、`ItemBrief`、`ItemFilters` 类型，与数据模型对齐

## 2. Store 适配层

- [x] 2.1 重构 `stores/items.ts`，将增删改查委托给 `LocalItemRepository`，不再直接写 localStorage
- [x] 2.2 在 `stores/items.ts` 中添加 `getRepository()` 工厂函数，为 V2 迁移做准备
- [x] 2.3 验证 store 在应用启动时仍能从 localStorage 正确恢复

## 3. 物品列表页（views/items/）

- [x] 3.1 创建 `views/items/index.vue`，实现列表布局：搜索栏 + 分类筛选 + 日期范围 + 卡片列表
- [x] 3.2 创建 `views/items/index.ts` composable：`useItemList()`，含防抖搜索（300ms）、筛选状态、分页（pageSize 20）
- [x] 3.3 创建 `views/items/index.less`，cozy 主题样式：卡片边框、hover 效果、交错入场动画
- [x] 3.4 实现物品卡片组件：照片缩略图 + 名称 + 分类标签 + 储物柜 + 存放日期
- [x] 3.5 实现分类筛选下拉框，从 categories store 获取选项
- [x] 3.6 实现日期范围筛选，使用 `el-date-picker`（type="daterange"）
- [x] 3.7 实现"加载更多"分页按钮和"没有更多"提示
- [x] 3.8 实现滑动删除 + `ElMessageBox.confirm`（非触摸设备提供备用删除按钮）

## 4. 物品详情页

- [x] 4.1 创建 `views/items/detail.vue`，布局：照片轮播 + 信息分组 + 操作按钮
- [x] 4.2 实现 `el-carousel` 照片查看器，支持点击查看全屏预览弹窗
- [x] 4.3 实现基本信息组：名称（加粗大标题）、分类标签、备注
- [x] 4.4 实现存放信息组：存放日期 + 可点击储物柜链接（跳转 `/cabinets/:id`）
- [x] 4.5 实现编辑按钮 → 跳转到 `/items/:id/edit`
- [x] 4.6 实现删除按钮，红色样式 + `ElMessageBox.confirm` + R012 级联 + 返回 `/items`

## 5. 物品表单页（创建 / 编辑）

- [x] 5.1 创建 `views/items/form.vue`，统一创建/编辑表单
- [x] 5.2 创建 `views/items/form.ts` composable：`useItemForm()`，含路由模式检测（`isEdit`）、草稿状态、脏检查
- [x] 5.3 实现名称字段校验 R001（2-50 字符、必填、行内错误提示）
- [x] 5.4 实现分类选择器（`el-select`），从 categories store 获取选项
- [x] 5.5 实现照片上传（`el-upload`），位置不要占太大，最多 3 张，`compressPhoto` 压缩，缩略图带移除按钮，缩略图占的比重大一些
- [x] 5.6 实现存放日期选择器（`el-date-picker`），默认今天（R010）
- [x] 5.7 实现储物柜选择器（`el-select`），从 cabinets store 获取选项
- [x] 5.8 实现备注文本域（可选，最多 200 字符）
- [x] 5.9 实现保存按钮：校验 → 仓库保存 → 成功 toast → 跳转到 `/items`
- [x] 5.10 实现未保存更改守卫，`onBeforeRouteLeave` + `ElMessageBox.confirm`

## 6. 路由与清理

- [x] 6.1 更新 `router/index.ts`：`/items` → `views/items/index.vue`，`/items/create` → `views/items/form.vue`，`/items/:id` → `views/items/detail.vue`，`/items/:id/edit` → `views/items/form.vue`
- [x] 6.2 删除旧文件：`views/Items.vue`、`views/ItemForm.vue`、`views/ItemDetail.vue`
- [x] 6.3 删除 `router/index.ts` 中不再使用的导入

## 7. 视觉与主题

- [x] 7.1 所有物品页面应用 cozy 蓝绿色主题变量（`--fd-cozy-*`）：表面、卡片、边框、阴影
- [x] 7.2 确保 `fd-` 前缀 BEM scoped 样式，元素内部不用 `cn()` Tailwind 滥用
- [x] 7.3 添加页面入场动画（交错 fade-up），与首页模式一致
- [x] 7.4 确保移动端触摸目标 ≥44×44px，字体 ≥14px

## 8. 验证

- [x] 8.1 `yarn build` 零错误通过
- [x] 8.2 `yarn lint` 通过（或无新增违规）
- [x] 8.3 冒烟测试：创建物品 → 列表展示 → 详情正确 → 编辑更新 → 删除移除
- [x] 8.4 验证级联：变更储物柜更新旧/新计数；删除物品递减计数
- [x] 8.5 验证筛选：关键字 + 分类 + 日期范围组合筛选
- [x] 8.6 验证未保存守卫：修改表单后返回，弹出确认对话框
- [x] 8.7 验证新文件中无 `@/components/ui` 或 `lucide-vue-next` 导入

