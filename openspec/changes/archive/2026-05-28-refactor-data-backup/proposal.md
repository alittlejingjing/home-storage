## 背景

数据备份页面（`Backup.vue`）是当前仍完全依赖 Reka UI 脚手架组件的页面之一，同时使用 `lucide-vue-next` 图标库，与项目已迁移的其他页面（首页、物品、储物柜、分类、搜索）在组件栈和视觉风格上脱节。page-level 逻辑直接耦合各 Store 与 `localStorage` 操作，缺乏 Repository 抽象，违背概要设计 §2.4 的接口驱动规划，也不利于 V2 接入远程备份 `HttpBackupRepository`。

## 变更内容

- **`Backup.vue` 全面迁移至 Element Plus 组件 + 自定义 scoped less 样式 + `@element-plus/icons-vue`**，移除所有 `@/components/ui` 和 `lucide-vue-next` 依赖
- **新增 `IBackupRepository` 接口**和 `LocalBackupRepository` V1 实现，隔离备份/导入/恢复逻辑，严格遵循需求文档 R016–R019
- **新增 `ISystemRepository.getStats` 与 `clearCache` 的 Store 联动**，统一通过 Repository 获取数据概览
- UI 风格与其他页面对齐：蓝绿色护眼背景、毛玻璃卡片、顶部渐变装饰色带、温暖有机配色
- 保持备份逻辑完整：JSON 导出（含时间戳文件名）、JSON 导入（合并/覆盖模式）、照片 Base64 恢复、校验与二次确认

## 能力

### 新增能力
- `data-backup-export`：全量数据导出为 JSON 文件（R016），含物品、储物柜、分类及照片 Base64
- `data-backup-import`：从 JSON 备份文件导入并恢复数据，支持合并与覆盖两种策略（R017–R019）

### 修改的能力
- 无

## 影响面

- `frontend/src/views/Backup.vue`：重写模板与样式，移除 Reka UI / lucide 依赖
- `frontend/src/repositories/types.ts`：新增 `IBackupRepository` 接口
- `frontend/src/repositories/local/backupRepository.ts`：新增 Local 实现
- `frontend/src/repositories/index.ts`：暴露 `getBackupRepository()` 工厂
- `frontend/src/stores/backup.ts`：可选新增 Pinia Store 作为 Backup.vue 与 Repository 的中间层
- `frontend/src/types/backup.ts`：新增 `BackupData`、`BackupImportMode` 类型定义
- 无 API 变更，V1 保持纯前端，V2 仅预留 `HttpBackupRepository` 接口位
