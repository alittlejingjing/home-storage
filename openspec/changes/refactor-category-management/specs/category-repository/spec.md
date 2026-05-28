## 新增需求

### 需求：通过 Repository 接口实现分类数据访问抽象
系统应提供 `ICategoryRepository` 接口，定义所有分类数据操作，以抽象底层存储实现。

#### 场景：V1 本地存储实现
- **当** 应用配置为 `VITE_DATA_SOURCE=local` 时
- **则** `getCategoryRepository()` 返回 `LocalCategoryRepository` 实例，将分类数据持久化到 `localStorage`，键名为 `jiaxiang-categories`

#### 场景：V2 远程存储占位
- **当** 应用配置为 `VITE_DATA_SOURCE=remote` 时
- **则** `getCategoryRepository()` 返回 `HttpCategoryRepository` 实例，通过 `/api/categories` 与 Spring Boot 后端通信

### 需求：通过 Repository 实现分类的增删改查操作
系统应支持通过 `ICategoryRepository` 接口进行创建、读取、更新、删除分类的操作。

#### 场景：创建分类
- **当** `create({ name, color?, icon? })` 被调用，且名称合法（1-20 个字符，非空）时
- **则** 新分类被持久化，生成唯一 `id`，`sortOrder` 设为当前最大值+1，`createdAt` 设为当前 ISO 时间戳
- **并** 方法返回生成的分类 `id`

#### 场景：拒绝重复分类名称
- **当** `create` 或 `update` 被调用，且名称已存在（不区分大小写）时
- **则** 操作被拒绝，返回 `null`/`false`

#### 场景：更新分类
- **当** `update(id, { name?, color?, icon? })` 被调用，且数据合法时
- **则** 分类字段被更新并持久化

#### 场景：按策略删除分类
- **当** `delete(id, strategy)` 被调用，且 `strategy` 为 `DELETE_ITEMS` 时
- **则** 该分类下所有关联物品也被删除
- **当** `delete(id, strategy)` 被调用，且 `strategy` 为 `MOVE_TO_UNCATEGORIZED` 时
- **则** 该分类下所有关联物品的 `categoryId` 被清空

#### 场景：列出分类
- **当** `list()` 被调用时
- **则** 系统返回按 `sortOrder` 升序排列的所有分类
- **并** 每个分类包含根据关联物品计算的 `itemCount`

#### 场景：重新排序分类
- **当** `reorder([{ id, sortOrder }])` 被调用，传入新的顺序数组时
- **则** 所有分类的 `sortOrder` 值被更新并持久化

### 需求：首次加载时自动填充默认分类
系统应在存储中无分类数据时，自动创建 3 个默认分类（生活用品、衣物、工具）。

#### 场景：首次初始化
- **当** `list()` 被调用，且存储中不存在任何分类时
- **则** 系统填充 3 个默认分类，附带预设颜色/图标和连续的 sortOrder
- **并** 返回填充后的列表
