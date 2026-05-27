## 1. 共享温馨主题（cozy-visual-theme）

- [x] 1.1 新建 `frontend/src/assets/css/cozy-theme.less`（`--fd-cozy-*` 奶油黄/毛玻璃/暖棕文字变量）
- [x] 1.2 在 `main.css` 引入 `cozy-theme.less` 并同步 `:root` HSL 与温馨主题一致
- [x] 1.3 （可选）`views/login/index.less` 改为引用 `--fd-cozy-*`，去除重复色值

## 2. 目录与脚手架

- [x] 2.1 创建 `frontend/src/views/home/` 目录
- [x] 2.2 新建 `types/dashboard.ts`（`DashboardVO` 不含 `recentItems`、`cabinetSummary`）
- [x] 2.3 新建 `index.ts`（`useHomeDashboard`：聚合 Store、刷新、跳转 helpers）
- [x] 2.4 新建 `index.less`（`fd-home` BEM + 引用 cozy 变量）
- [x] 2.5 新建 `readme.md`（区块说明、API、设计依据）

## 3. 首页 UI（Element Plus + 温馨毛玻璃）

- [x] 3.1 新建 `index.vue`：欢迎区 + 下拉刷新指示（`Refresh` 图标）
- [x] 3.2 搜索入口：玻璃卡片，点击跳转 `/search`
- [x] 3.3 统计概览：三列 `el-card`（物品/储物柜/分类数量）
- [x] 3.4 分类横滑：`el-scrollbar` + `el-card`（点击筛选跳转）
- [x] 3.5 快捷入口（全部物品/储物柜）沿用温馨卡片样式
- [x] 3.6 自定义分类：`el-dialog` + `el-input` + `el-button`
- [x] 3.7 图标全部改用 `@element-plus/icons-vue`
- [x] 3.8 确认首页无「最近新增」区块
- [x] 3.9 确认首页无「储物柜摘要列表」区块

## 4. 业务逻辑与路由

- [x] 4.1 `useHomeDashboard` 实现 `DashboardVO` 内存聚合（分类统计、汇总计数，不含 recentItems/cabinetSummary）
- [x] 4.2 实现下拉刷新重新聚合数据
- [x] 4.3 实现分类/快捷入口路由跳转（含 query）
- [x] 4.4 更新 `router/index.ts` 懒加载为 `@/views/home/index.vue`
- [x] 4.5 删除 `frontend/src/views/Home.vue`

## 5. 验证

- [x] 5.1 `yarn build` 通过
- [x] 5.2 `yarn dev` 打开 `/home`：各区块渲染、无 `@/components/ui` / `lucide-vue-next`
- [x] 5.3 搜索入口、分类点击、快捷入口跳转正确
- [x] 5.4 下拉刷新与自定义分类弹窗可用
- [x] 5.5 与 `/login` 视觉一致（奶油黄毛玻璃，无紫色主色）
- [x] 5.6 确认首页不展示最近新增与储物柜摘要列表
