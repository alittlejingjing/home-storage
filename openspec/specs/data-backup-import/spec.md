# data-backup-import Specification

## Purpose
TBD - created by archiving change refactor-data-backup. Update Purpose after archive.
## Requirements
### Requirement: 用户可上传 JSON 备份文件恢复数据
系统 SHALL 允许用户选择本地 JSON 备份文件，并在校验通过后根据所选策略恢复数据。

#### Scenario: 选择备份文件
- **WHEN** 用户在数据备份页面点击「选择备份文件」区域
- **THEN** 系统唤起系统文件选择器，仅接受 `.json` 类型文件
- **AND** 文件选择后弹出导入确认弹窗

#### Scenario: 合并模式导入成功
- **WHEN** 用户选择合并模式并确认导入
- **AND** 备份文件校验通过（R017）
- **THEN** 系统对所有分类、储物柜、物品进行智能去重（以 ID 唯一性为基准）
- **AND** 不存在的记录直接追加
- **AND** 已存在的同名或同 ID 记录以备份文件中的数据为准更新
- **AND** 照片数据恢复到 localStorage
- **AND** 各 Store 自动持久化更新后的数据
- **AND** 展示恢复统计（物品数、储物柜数、分类数）

#### Scenario: 覆盖模式导入成功
- **WHEN** 用户选择覆盖模式并确认导入
- **AND** 备份文件校验通过
- **THEN** 系统先清空现有物品、储物柜、分类数据
- **AND** 清空所有物品和储物柜的 photo localStorage 键
- **AND** 将备份文件中的全部数据写入
- **AND** 照片数据恢复到 localStorage
- **AND** 各 Store 自动持久化
- **AND** 展示恢复统计

#### Scenario: 导入文件校验失败
- **WHEN** 用户上传的文件不是合法 JSON 格式
- **THEN** 系统阻塞导入并提示「导入失败，请检查文件格式」
- **AND** 弹窗内展示错误信息，不关闭弹窗

### Requirement: 导入前须二次确认（R019）
用户确认导入前，系统 SHALL 明确要求用户选择导入模式（合并 / 覆盖）并展示确认弹窗。

#### Scenario: 显示导入模式选择
- **WHEN** 用户选择备份文件后
- **THEN** 弹窗内默认选中「合并模式」单选按钮
- **AND** 展示两种模式的说明文案
- **AND** 展示所选文件名

#### Scenario: 用户取消导入
- **WHEN** 用户点击确认弹窗的「取消」按钮
- **THEN** 系统关闭弹窗并放弃导入
- **AND** 不修改任何现有数据

