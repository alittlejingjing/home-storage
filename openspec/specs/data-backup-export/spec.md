# data-backup-export Specification

## Purpose
TBD - created by archiving change refactor-data-backup. Update Purpose after archive.
## Requirements
### Requirement: 用户可导出全量数据为 JSON 备份文件
系统 SHALL 允许用户将当前本地存储的全量数据打包为 JSON 文件并触发浏览器下载。

#### Scenario: 成功导出备份文件
- **WHEN** 用户在数据备份页面点击「立即导出」按钮
- **THEN** 系统聚合物品、储物柜、分类及照片 Base64 数据
- **AND** 生成文件名格式为 `家享收纳备份_{ISO8601时间戳}.json`
- **AND** 触发浏览器下载该 JSON 文件

#### Scenario: 导出进度反馈
- **WHEN** 导出过程正在进行中
- **THEN** 页面展示进度条和「正在打包数据...」文字提示
- **AND** 导出按钮置为不可点击状态

#### Scenario: 导出成功提示
- **WHEN** 导出完成且文件下载成功
- **THEN** 按钮文案变为「导出成功」并回退为可点击状态
- **AND** 3 秒后恢复为初始文案和进度 0%

### Requirement: 导出文件格式须满足可恢复性要求
导出的 JSON 备份文件 SHALL 包含 `version`、`exportedAt`、`items`、`cabinets`、`categories`、`itemPhotos`、`cabinetPhotos` 字段，确保导入端可完整恢复。

#### Scenario: 导出文件包含完整数据
- **WHEN** 系统生成备份 JSON 对象
- **THEN** `version` 值为 `"1.0"`
- **AND** `exportedAt` 值为导出时的 ISO 8601 字符串
- **AND** `items` 为当前全部物品数组
- **AND** `cabinets` 为当前全部储物柜数组
- **AND** `categories` 为当前全部分类数组
- **AND** `itemPhotos` 为以物品 ID 为键、Base64 照片数组为值的对象
- **AND** `cabinetPhotos` 为以储物柜 ID 为键、Base64 照片数组为值的对象

