## 背景

当前储物柜模块（`Cabinets.vue`、`CabinetForm.vue`、`CabinetDetail.vue`）是一个单体原型，缺乏清晰的关注点分离，缺少照片轮播、时间筛选、柜内物品展示等关键功能。需要全面重构以对齐需求文档中关于储物柜增删改查、搜索、筛选以及已建立的 cozy 视觉主题。

## 变更内容

- **新目录结构**：将储物柜模块拆分到 `views/cabinets/` 下，包含 `index.vue`（列表）、`detail.vue`、`form.vue`，遵循物品模块已验证的文件组织模式。
- **储物柜列表页**：基于卡片的列表，支持关键字搜索（名称/位置描述模糊匹配）、时间范围筛选（创建时间）、物品数量角标。仅使用 Element Plus 组件。
- **储物柜详情页**：顶部照片轮播、基本信息组（名称、位置描述、创建时间）、柜内物品列表（展示该储物柜下所有物品，点击可跳转物品详情）、编辑/删除操作。删除时若有关联物品则禁用删除并提示（R008）。
- **储物柜表单页**：统一的创建/编辑表单，支持名称校验（R002：2-30字符）、唯一性校验（R005）、照片上传（最多3张，按 R006/R007 压缩至 ≤500KB）、位置描述文本框。返回时未保存更改的守卫。
- **仓库层**：提取 `ICabinetRepository` 接口并实现 `LocalCabinetRepository`，遵循项目级仓库模式。支持 `listItemsInCabinet` 查询柜内物品。
- **业务规则**：实现 R002（名称长度 2-30）、R005（名称唯一性）、R008（删除前空柜校验）。R011/R012 的级联计数由物品仓库维护，本模块只读统计。
- **视觉对齐**：应用 cozy 蓝绿色主题（`--fd-cozy-*` 变量），使用毛玻璃卡片风格，与物品模块/首页/登录页保持一致。
- **破坏性变更**：删除 `views/Cabinets.vue`、`views/CabinetForm.vue`、`views/CabinetDetail.vue` 单体文件，更新 `router/index.ts` 指向新路径。

## 能力

### 新增能力
- `cabinet-list`：储物柜列表页，支持搜索、时间筛选、卡片列表、物品数量角标
- `cabinet-detail`：储物柜详情页，支持照片轮播、信息分组、柜内物品列表、物品跳转
- `cabinet-form`：统一的储物柜创建/编辑表单，支持校验、照片上传、未保存守卫
- `cabinet-repository`：本地仓库实现储物柜增删改查，空柜校验，柜内物品查询

### 修改的能力
- （无）

## 影响面

- **路由**：`/cabinets` → `views/cabinets/index.vue`，`/cabinets/create` → `views/cabinets/form.vue`，`/cabinets/:id` → `views/cabinets/detail.vue`，`/cabinets/:id/edit` → `views/cabinets/form.vue`
- **Store**：`useCabinetsStore` 适配 Repository 模式，委托给 `ICabinetRepository`
- **类型**：新增 `frontend/src/types/cabinet.ts` 定义 Cabinet / CabinetVO / CabinetFilters / CabinetCreateInput 等类型
- **依赖**：Element Plus（`el-card`、`el-form`、`el-input`、`el-textarea`、`el-date-picker`、`el-upload`、`el-carousel`、`el-dialog`、`el-message-box`、`el-badge`）、`@element-plus/icons-vue`
- **删除**：`views/Cabinets.vue`、`views/CabinetForm.vue`、`views/CabinetDetail.vue`
