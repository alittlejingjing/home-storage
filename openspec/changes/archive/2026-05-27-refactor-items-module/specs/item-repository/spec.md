## 新增需求

### 需求：仓库接口定义

应用应在 `repositories/types.ts` 中定义 `IItemRepository` 接口，包含方法：`create(item)`、`update(id, item)`、`delete(id)`、`list(filters)`、`getById(id)`。所有方法应为异步并返回 Promise。

#### 场景：仓库接口契约

- **WHEN** 创建仓库实现时
- **THEN** 它实现 `IItemRepository` 的所有方法

### 需求：本地仓库实现

`LocalItemRepository` 应将物品存储在 localStorage 的 `jiaxiang-items` 键下，格式为 JSON 数组。每个物品应有一个唯一的 `id`（创建时生成 UUID v4）。物品应为不可变对象：更新创建新对象；仓库在写入时替换整个数组。

#### 场景：本地存储持久化

- **WHEN** 创建物品时
- **THEN** 它被追加到 localStorage 数组
- **WHEN** 更新物品时
- **THEN** 数组用更新后的物品重写

### 需求：变更储物柜时的级联更新（R011）

当 `update` 期间物品的 `cabinetId` 变更时，仓库应在返回前递减旧储物柜的物品计数并递增新储物柜的物品计数。

#### 场景：物品移动到新储物柜

- **WHEN** `update` 将物品从储物柜 A 变更到储物柜 B
- **THEN** 储物柜 A 的计数减 1，储物柜 B 的计数加 1

### 需求：删除物品时的级联删除（R012）

当通过 `delete(id)` 删除物品时，仓库应在返回前递减关联储物柜的物品计数。

#### 场景：物品被删除

- **WHEN** 对储物柜 A 中的物品调用 `delete`
- **THEN** 储物柜 A 的计数减 1

### 需求：带筛选的列表查询

`list(filters)` 方法应接受一个可选的 `filters` 对象，包含 `keyword`、`categoryId`、`dateStart` 和 `dateEnd`。它应返回匹配所有提供筛选条件的物品，按 `createdAt` 降序排列。

#### 场景：仓库筛选物品

- **WHEN** 调用 `list({ keyword: "螺丝刀", categoryId: "cat-1" })`
- **THEN** 仅返回同时匹配两个条件的物品

### 需求：照片压缩工具

仓库层应提供 `compressPhoto(file)` 工具，将图片缩放至最大宽度 1280px，JPEG 质量 80%，并返回 base64 字符串。

#### 场景：照片被压缩

- **WHEN** 上传一张 3MB 的 JPEG 照片
- **THEN** 压缩后的 base64 大小 ≤200KB
