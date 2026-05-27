## 1. 目录与脚手架

- [x] 1.1 创建 `frontend/src/views/login/` 目录
- [x] 1.2 新建 `index.less`（`fd-login` BEM 块 + 文件头 JSDoc 注释）
- [x] 1.3 新建 `index.ts`（`useLoginForm` composable：表单 ref、rules、submit、fillDemo）
- [x] 1.4 新建 `readme.md`（组件说明、API、演示账号）

## 2. 登录页 UI（Element Plus + Tailwind）

- [x] 2.1 新建 `index.vue`：Tailwind 布局（Logo、卡片容器、移动端宽度）
- [x] 2.2 使用 `el-form` / `el-form-item` 绑定校验规则
- [x] 2.3 邮箱 `el-input`（`type="email"`、`autocomplete="email"`）
- [x] 2.4 密码 `el-input`（`show-password`、`autocomplete="current-password"`）
- [x] 2.5 主按钮 `el-button type="primary"` 提交；`el-button link` 演示账号入口
- [x] 2.6 Logo 图标改用 `@element-plus/icons-vue`（如 `House`）
- [x] 2.7 成功/失败使用 `ElMessage` / `ElMessage.error`

## 3. 业务逻辑与路由

- [x] 3.1 composable 内调用 `useAuthStore().login()`，成功 `router.push('/home')`
- [x] 3.2 实现 `fillDemoAccount`：`admin@example.com` / `password`
- [x] 3.3 更新 `router/index.ts` 懒加载路径为 `@/views/login/index.vue`
- [x] 3.4 删除旧文件 `frontend/src/views/Login.vue`

## 4. 验证

- [x] 4.1 执行 `yarn dev` 打开 `/login`，确认登录页正常渲染（`yarn build` 已通过）
- [x] 4.2 空提交与错误邮箱格式触发校验提示
- [x] 4.3 演示账号登录成功跳转首页；错误密码显示失败提示
- [x] 4.4 确认登录页无 `@/components/ui` 与 `lucide-vue-next` import
