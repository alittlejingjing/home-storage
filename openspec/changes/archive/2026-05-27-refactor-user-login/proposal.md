## Why

当前登录页 `Login.vue` 仍依赖遗留的 `@/components/ui`（Reka UI 脚手架）与 `lucide-vue-next` 图标，与项目目标栈（Vue 3 + Element Plus + Tailwind CSS）及 html/js/css 分离规范不一致。重构登录组件可统一 UI 体系、消除技术债，并为后续接入 `IAuthRepository`（V1 本地 / V2 远程）预留清晰边界。

## What Changes

- 将 `frontend/src/views/Login.vue` 重构为 **Element Plus 表单 + Tailwind 布局** 的独立登录模块
- 采用 **html / js / css 分离**：`views/login/index.vue`、`index.ts`、`index.less`
- 使用 `el-form` 校验（邮箱格式、必填）、`el-input`（含密码显隐）、`el-button`、`ElMessage` 反馈
- 图标改用 `@element-plus/icons-vue`（如 `House`、`View`、`Hide`）
- 保留演示账号一键填充与登录成功后跳转 `/home` 行为
- 登录逻辑经 composable 或 Store 调用，为 `LocalAuthRepository` / `HttpAuthRepository` 切换做准备（本期仍走 `useAuthStore`）
- 新增组件目录 `readme.md` 说明 API 与用法
- 路由改为懒加载 `views/login/index.vue`（或保持路径 `/login` 不变）

## Capabilities

### New Capabilities

- `user-login`: 演示账号登录页 UI、表单校验、密码显隐、演示账号快捷填充、登录成功/失败反馈

### Modified Capabilities

（无。`openspec/specs/` 下尚无既有 capability，登录行为与需求文档一致，仅实现层重构。）

## Impact

- **代码**：`frontend/src/views/Login.vue`（删除或替换）、新增 `frontend/src/views/login/` 目录；`frontend/src/router/index.ts` 更新 import 路径
- **依赖**：不再引用 `@/components/ui` 的 Input/Button/Card/Label/toast；不再使用 `lucide-vue-next` 于登录页
- **行为**：功能与需求文档 6.3 演示账号一致，无 **BREAKING** 对外 API 变更
- **后续**：可与 `详细设计_用户与系统.md` 中 `IAuthRepository` 对接，Store 内部逐步替换 mock 登录
