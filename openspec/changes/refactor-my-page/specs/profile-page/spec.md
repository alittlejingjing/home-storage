## ADDED Requirements

### Requirement: 用户信息卡片展示
系统 SHALL 在「我的」页面顶部展示当前登录用户的信息卡片，包含用户头像（首字母回退）、显示名称、角色标签。

#### Scenario: 已登录用户查看个人中心
- **WHEN** 已登录用户进入「我的」页面
- **THEN** 页面顶部显示用户信息卡片，头像为用户名称首字母，名称显示为「家庭管理员」等，角色标签显示「家庭管理员」

#### Scenario: 未登录状态访问
- **WHEN** 未登录用户通过非法方式进入「我的」页面
- **THEN** 用户信息卡片显示「未登录」，头像显示为「?」

### Requirement: 功能入口列表
系统 SHALL 在用户信息卡片下方提供功能入口列表，包含「分类管理」「数据备份」「清除缓存」三项入口，每项含图标、名称和右箭头。

#### Scenario: 用户点击功能入口
- **WHEN** 用户点击「分类管理」入口
- **THEN** 页面跳转至 `/categories`

#### Scenario: 用户点击数据备份入口
- **WHEN** 用户点击「数据备份」入口
- **THEN** 页面跳转至 `/backup`

#### Scenario: 用户点击清除缓存入口
- **WHEN** 用户点击「清除缓存」入口
- **THEN** 弹出二次确认对话框，提示「这将清除所有本地数据，不可恢复」

### Requirement: 数据统计展示
系统 SHALL 在功能入口下方展示三项数据统计卡片：总物品数、总储物柜数、总分类数，数字实时从仓库聚合计算。

#### Scenario: 用户查看统计数据
- **WHEN** 用户进入「我的」页面
- **THEN** 页面显示 3 列统计卡片，分别展示当前物品总数、储物柜总数、分类总数

#### Scenario: 数据变化后统计更新
- **WHEN** 用户在其他页面新增/删除物品、储物柜或分类后返回「我的」页面
- **THEN** 统计数字已反映最新数据

### Requirement: 系统操作区
系统 SHALL 在页面底部提供「退出登录」按钮，点击后清除登录态并跳转至登录页。

#### Scenario: 用户退出登录
- **WHEN** 用户点击「退出登录」按钮
- **THEN** 系统清除当前用户的 token 和用户信息，并跳转至 `/login`

### Requirement: 清除缓存确认与执行
系统 SHALL 在用户确认清除缓存后，清除所有 `jiaxiang-*` 前缀的 localStorage 数据及 `jiaxiang-db` IndexedDB 数据库，并刷新页面。

#### Scenario: 用户确认清除缓存
- **WHEN** 用户在二次确认对话框中点击「确认清除」
- **THEN** 系统清除全部本地业务数据，关闭对话框，页面自动刷新

#### Scenario: 用户取消清除缓存
- **WHEN** 用户在二次确认对话框中点击「取消」
- **THEN** 对话框关闭，不做任何数据清理

### Requirement: 技术栈合规
系统 SHALL 确保「我的」页面全部使用 Element Plus 组件、Tailwind CSS 布局、`@element-plus/icons-vue` 图标，禁止引入 `@/components/ui` 和 `lucide-vue-next`。

#### Scenario: 代码审查技术栈
- **WHEN** 审查 `views/profile/` 目录下的代码
- **THEN** 不存在 `import { ... } from '@/components/ui'` 或 `import { ... } from 'lucide-vue-next'` 语句
