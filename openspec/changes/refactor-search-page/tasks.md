## 任务清单

### 1. 重写 Search.vue 页面
- 移除 `@/components/ui` 所有导入（`Card`、`CardContent`、`Badge`、`Empty`、`Tabs`、`TabsList`、`TabsTrigger`、`TabsContent`）
- 移除 `lucide-vue-next` 导入（`Search`、`X`、`Package`、`Archive`）
- 新增 `@element-plus/icons-vue` 导入：`Search`、`Close`、`Box`、`OfficeBuilding`
- 替换 `Card`/`CardContent` 为 `el-card`
- 替换 `Input` 为 `el-input`（prefix-icon + clearable）
- 替换 `Tabs` 体系为 `el-tabs`/`el-tab-pane`
- 移除 `Badge` 组件，改为自定义 CSS 圆角标签
- 实现自定义空状态（图标 + 文字），不使用 Reka UI `Empty`
- 更新 `getCategoryColors` 函数，返回温暖有机纯色（与分类管理页兼容）
- 页面背景改为 `#f3f9f6` + 径向渐变光晕
- 卡片添加毛玻璃效果和顶部色带装饰
- Tab 覆盖默认样式为墨绿色选中指示器

### 2. 路由 meta 确认
- 检查 `router/index.ts` 中 `/search` 路由的 `meta.title` 是否为"搜索"
- 确认 `MainLayout` 中搜索入口图标/文案无需调整

### 3. 构建验证
- 运行 `cd frontend && yarn build`
- 确保无 TypeScript 编译错误
- 确保无 Reka UI 组件引用导致的运行时错误

### 4. 功能测试
- 手动测试搜索输入框（输入、清除、防抖）
- 手动测试 Tab 切换（物品/储物柜）
- 手动测试点击结果卡片跳转详情
- 测试空状态（无关键词/有关键词无结果）
