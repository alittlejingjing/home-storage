## 新增需求

### 需求：Repository 提供储物柜列表查询
系统 SHALL 通过 `ICabinetRepository.list(query)` 返回按创建时间倒序的储物柜列表，支持关键字过滤（名称/位置描述模糊匹配）和创建时间区间过滤。

#### 场景：无筛选列表查询
- **WHEN** 调用 repo.list({})
- **THEN** 返回全部储物柜，按 createdAt 倒序排列

#### 场景：关键字筛选
- **WHEN** 调用 repo.list({ keyword: "阳台" })
- **THEN** 只返回 name 或 location 包含"阳台"的储物柜

#### 场景：时间区间筛选
- **WHEN** 调用 repo.list({ dateStart: "2025-01-01", dateEnd: "2025-03-01" })
- **THEN** 只返回 createdAt 在该区间内的储物柜

### 需求：Repository 提供单条查询含物品数量
系统 SHALL 通过 `ICabinetRepository.getById(id)` 返回储物柜详情，包含 `itemCount` 字段（通过 `IItemRepository` 统计该柜下物品数量）。

#### 场景：查询有物品的储物柜
- **WHEN** 调用 repo.getById("cab-1") 且 cab-1 下有 3 件物品
- **THEN** 返回 CabinetVO，其中 itemCount = 3

#### 场景：查询空柜
- **WHEN** 调用 repo.getById("cab-6") 且 cab-6 下无物品
- **THEN** 返回 CabinetVO，其中 itemCount = 0

#### 场景：查询不存在的储物柜
- **WHEN** 调用 repo.getById("cab-not-exist")
- **THEN** 返回 null

### 需求：Repository 支持创建储物柜
系统 SHALL 通过 `ICabinetRepository.create(dto)` 创建储物柜，自动生成 UUID 作为 id，自动填充 createdAt 为当前时间。执行 R002（名称长度 2-30）和 R005（名称唯一性）校验，失败时抛错。

#### 场景：成功创建
- **WHEN** 调用 repo.create({ name: "新储物柜", location: "客厅" })
- **THEN** 返回新储物柜 id，数据持久化，localStorage 同步更新

#### 场景：名称重复
- **WHEN** 调用 repo.create({ name: "主卧衣柜" }) 且"主卧衣柜"已存在
- **THEN** 抛出错误，提示"已存在同名储物柜"

### 需求：Repository 支持更新储物柜
系统 SHALL 通过 `ICabinetRepository.update(id, dto)` 更新储物柜信息，执行 R002 和 R005 校验（编辑时排除自身）。

#### 场景：成功更新
- **WHEN** 调用 repo.update("cab-1", { location: "新位置" })
- **THEN** 数据更新成功，localStorage 同步更新

### 需求：Repository 支持删除储物柜（空柜校验）
系统 SHALL 通过 `ICabinetRepository.delete(id)` 删除储物柜。删除前校验该柜下是否有关联物品（R008），若有则抛错。

#### 场景：删除空柜
- **WHEN** 调用 repo.delete("cab-empty") 且该柜下无物品
- **THEN** 删除成功，数据从 localStorage 移除

#### 场景：删除非空柜
- **WHEN** 调用 repo.delete("cab-1") 且该柜下有物品
- **THEN** 抛出错误，提示"该储物柜下还有物品，请先移出后再删除"

### 需求：Repository 支持查询柜内物品
系统 SHALL 通过 `ICabinetRepository.listItemsInCabinet(cabinetId)` 返回该储物柜下的所有物品列表，按创建时间倒序排列。

#### 场景：查询柜内物品
- **WHEN** 调用 repo.listItemsInCabinet("cab-1")
- **THEN** 返回该柜下所有物品的 ItemBrief 列表

#### 场景：查询空柜物品
- **WHEN** 调用 repo.listItemsInCabinet("cab-empty")
- **THEN** 返回空数组

### 需求：Repository 支持照片上传与删除
系统 SHALL 通过 `uploadPhoto(id, file)` 将照片以 base64 形式追加到指定储物柜，`deletePhoto(id, index)` 按索引删除照片。

#### 场景：上传照片
- **WHEN** 调用 repo.uploadPhoto("cab-1", file)
- **THEN** 返回 base64 字符串，照片追加到该储物柜的 photos 数组

#### 场景：删除照片
- **WHEN** 调用 repo.deletePhoto("cab-1", 0)
- **THEN** 该储物柜 photos 数组第 0 项被移除
