# 登录页组件（login）

## 描述

家享收纳演示登录页，采用 **Element Plus** 表单组件 + **Less** 温馨 ins 风视觉，逻辑与样式分离。

### 视觉风格

- **色调**：奶油黄为主（白 → 奶油 → 蜂蜜黄渐变），无紫色
- **氛围**：温馨舒适、柔和毛玻璃卡片与暖色光晕
- **质感**：毛玻璃卡片与输入框（`backdrop-filter` + 半透明白底 + 高光描边）
- **字体**：标题 `Fraunces`、正文 `Nunito`（在 `frontend/index.html` 通过 link 引入）
- **动效**：入场上浮、背景 blob 缓动（支持 `prefers-reduced-motion`）
- **组件**：圆角胶囊输入框、蜂蜜琥珀渐变登录按钮、磨砂玻璃卡片

## 目录结构

| 文件 | 说明 |
|------|------|
| `index.vue` | 模板：布局与 Element Plus 组件 |
| `index.ts` | `useLoginForm` composable |
| `index.less` | `fd-login` BEM 样式 |
| `readme.md` | 本文档 |

## 功能

- 邮箱 / 密码表单校验（必填、邮箱格式）
- 密码显隐（Element Plus `show-password`）
- 演示账号一键填充
- 登录成功跳转 `/home`；失败提示错误

## API

### `useLoginForm()`

| 返回项 | 类型 | 说明 |
|--------|------|------|
| `formRef` | `Ref<FormInstance>` | 表单实例 |
| `formModel` | `{ email, password }` | 表单数据 |
| `rules` | `FormRules` | 校验规则 |
| `loading` | `Ref<boolean>` | 提交中状态 |
| `submit` | `() => Promise<void>` | 校验并登录 |
| `fillDemoAccount` | `() => void` | 填充演示账号 |

## 演示账号

- 邮箱：`admin@example.com`
- 密码：`password`

## 路由

- 路径：`/login`
- 懒加载：`@/views/login/index.vue`

## 后续（V2）

`useLoginForm.submit` 内可将 `useAuthStore().login` 替换为 `IAuthRepository.login`（见 `详细设计_用户与系统.md`）。
