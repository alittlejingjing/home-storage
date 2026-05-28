## 背景

数据备份页面（`Backup.vue`）当前使用 Reka UI 的 `Card`、`Button`、`Dialog`、`RadioGroup` 等组件，以及 `lucide-vue-next` 图标，与项目已迁移页面视觉和组件栈不统一。备份逻辑直接耦合各业务 Store（items、cabinets、categories），通过 `localStorage` 散落读写照片数据，违背 Repository 模式。

本设计将 `Backup.vue` 迁移至 Element Plus + 自定义 scoped less（对标首页/分类/搜索的蓝绿护眼温暖有机风格），引入 `IBackupRepository` 接口和 `LocalBackupRepository` V1 实现，隔离导出/导入/恢复业务逻辑，为 V2 `HttpBackupRepository` 预留切换位。

---

## 目标与排除项

**目标：**

1. `Backup.vue` 全面迁移至 Element Plus 组件 + scoped less + `@element-plus/icons-vue`
2. 移除所有 `@/components/ui` 和 `lucide-vue-next` 依赖
3. 样式与首页 `fd-home` 保持一致：蓝绿色背景渐变、毛玻璃卡片、顶部色带装饰
4. 新增 `IBackupRepository` 接口与 `LocalBackupRepository` V1 实现，严格遵循 R016–R019
5. 引入 `BackupData`、`BackupImportMode` 类型定义，类型安全贯穿导出导入流程

**排除项：**

1. 不改动物品/储物柜/分类 CRUD 逻辑
2. 不改动 `Profile.vue` 或路由配置
3. 不涉及 V2 HTTP 备份接口实现（仅预留接口位）

---

## 决策

### 决策 1：Element Plus 组件替换映射

将 Reka UI 组件替换为 Element Plus 等效组件。

- `Card` / `CardContent` → 自定义毛玻璃卡片（div + less，与分类管理页一致）
- `Button`（主按钮） → `el-button type="primary"`
- `Button`（outline） → `el-button`（自定义 border-dashed 样式）
- `Dialog` / `DialogContent` / `DialogHeader` / `DialogTitle` / `DialogDescription` / `DialogFooter` → `el-dialog` + `template #header` / `#footer`
- `RadioGroup` / `RadioGroupItem` / `Label` → `el-radio-group` / `el-radio`（border 样式）
- `Alert` → `el-alert`（importSuccess 及 importError 提示）
- `lucide-vue-next` 图标 → `@element-plus/icons-vue`：`Download`→`Download`, `Upload`→`Upload`, `FileJson`→`Document`, `AlertTriangle`→`Warning`, `CheckCircle`→`CircleCheck`, `RefreshCw`→`Refresh`, `ChevronLeft`→`ArrowLeft`

**决策依据**：项目规范已明确 Element Plus 负责所有交互组件。`el-dialog` 在 Element Plus 内置移动端适配，`el-upload` 支持拖拽/点击上传，减少 file-input 的手动隐藏和 click 触发代码。

### 决策 2：使用 `el-upload` 替代原生 `<input type="file">`

导出区域继续使用 `el-button` 触发浏览器下载；导入区域改用 `el-upload`（`action="#"`, `:auto-upload="false"`, `accept=".json"`），通过 `on-change` 钩子获取 `File` 对象。

**决策依据**：`el-upload` 提供更一致的拖拽/点击区域视觉、文件类型限制、已选文件回显，与其他页面文件操作体验一致。`action="#"` + 手动处理可避免无意义 HTTP 请求。

### 决策 3：Repository 模式隔离备份逻辑

新增 `IBackupRepository` 接口：

```typescript
export interface IBackupRepository {
  exportAll(): Promise<{ blob: Blob; filename: string }>
  importAll(file: File, mode: BackupImportMode): Promise<ImportResult>
  validateBackup(data: unknown): BackupValidationResult
}
```

`LocalBackupRepository` 实现：
- `exportAll`：聚合各 LocalRepository 数据 + 照片 Base64 → 组装 `BackupData` → `Blob` + 下载文件名
- `importAll`：读取 File → JSON parse → `validateBackup` → 根据 `mode` 执行合并/覆盖 → 写入各 LocalRepository + photo localStorage
- `validateBackup`：校验 version、items/cabinets/categories 数组完整性

**决策依据**：遵循概要设计 §2.4 的 Repository 规划，使 `Backup.vue` 不直接操作 `localStorage` 和各 Store 内部 state，便于 V2 切换为 `HttpBackupRepository`，也更便于单元测试。

### 决策 4：备份照片聚合方式

V1 继续使用 localStorage 存储照片（`jiaxiang-photo-{itemId}-{index}`）。`LocalBackupRepository.exportAll` 通过遍历 items/cabinets 的 photos 数组，从 localStorage 读取原始 Base64，打包到 `itemPhotos` / `cabinetPhotos` 字段。导入时反向恢复。

**决策依据**：与现有照片存储方式保持一致，不引入新的 IndexedDB 照片存储改动。R016 已要求照片以 Base64 编码存储在 JSON 中，当前实现已满足。

### 决策 5：页面风格和布局统一

页面整体采用与分类管理/搜索页面一致的蓝绿渐变背景，卡片使用 `backdrop-filter: blur(12px)` + 半透明白底，顶部 3px 渐变装饰色带。概览统计使用横向三列卡片（标签 + 数字大字体），导出/导入区使用纵向功能卡片。

**决策依据**：首页、物品、储物柜、分类、搜索已全部验证此风格在移动端视觉效果好、护眼、有层次感。保持统一减少用户认知负担。

---

## 风险与权衡

| 风险 | 缓解措施 |
|------|---------|
| `el-upload` 禁用 `auto-upload` 后 drag 行为可能不够直观 | 仅开启 click-to-select，不暴露 drag 区域；视觉区域使用 `el-card` + `el-button` 组合，点击范围明确 |
| 大的备份文件（照片多）解析可能阻塞主线程 | 导出过程使用进度条（10% 开始 → 照片读取 50% → JSON stringify 80% → 100%），导入建议在合并/覆盖时避免 UI 锁死（但 V1 localStorage 操作是同步的） |
| Repository 化后导出不再走 Store computed，可能导致 Store state 与 localStorage 短暂不一致 | `LocalBackupRepository` 读取各 LocalRepository 的 `list()` 方法获取最新数据，保证一致性 |
| 覆盖模式导入后需要刷新页面确保 Store 与 localStorage 同步 | 遵循 R019：导入成功后 `ElMessage.success` 提示用户「建议刷新页面以确保数据一致性」 |

---

## 迁移计划

1. 确认 `el-icon` + `@element-plus/icons-vue` 已全局可用
2. 创建 `IBackupRepository` 接口与 `LocalBackupRepository` 实现
3. 创建 `BackupData` / `BackupImportMode` 类型
4. 重写 `Backup.vue`：替换为 Element Plus 组件，接入 `IBackupRepository`
5. 构建验证：`yarn build` 确保无编译错误
6. 功能测试：手动测试导出下载、导入合并/覆盖、校验失败场景

---

## 待决策问题

- 是否需要为备份操作提供进度指示（如导入时的大文件进度）？—— 当前 V1 数据量小，暂不需要；V2 HTTP 导入时可再补充上传进度条。
