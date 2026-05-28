## 1. 类型定义与接口设计

- [x] 1.1 新建 `frontend/src/types/backup.ts`，定义 `BackupData`、`BackupImportMode`、`BackupValidationResult`、`ImportResult` 类型
- [x] 1.2 在 `frontend/src/repositories/types.ts` 追加 `IBackupRepository` 接口

## 2. Repository 层实现

- [x] 2.1 新建 `frontend/src/repositories/local/backupRepository.ts`，实现 `LocalBackupRepository`
- [x] 2.2 在 `frontend/src/repositories/index.ts` 追加 `getBackupRepository()` 工厂函数

## 3. 页面视图重构

- [x] 3.1 重写 `frontend/src/views/Backup.vue` 模板：替换 Reka UI 为 Element Plus 组件（`el-button`、`el-dialog`、`el-radio-group`、`el-alert`、`el-upload`、`el-progress`、`el-card`）
- [x] 3.2 重写 `Backup.vue` script：接入 `IBackupRepository`，替换 `lucide-vue-next` 为 `@element-plus/icons-vue`
- [x] 3.3 为 `Backup.vue` 编写 scoped less 样式，对齐蓝绿护眼温暖有机风格（毛玻璃卡片、顶部色带、渐变背景）

## 4. 构建与验证

- [x] 4.1 运行 `yarn build`，确保无编译错误
- [x] 4.2 手动验证：数据导出功能（文件名含时间戳、JSON 格式正确）
- [x] 4.3 手动验证：数据导入功能（合并模式、覆盖模式、校验失败提示）
