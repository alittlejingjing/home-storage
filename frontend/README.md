# vue3-example

Vue 3 项目脚手架，与 react-example 对应。技术选型见 `skills/vue3-spec.txt`。

## 技术栈

- Vue 3.4+、TypeScript 5.4+、Vite 5.2+
- Vue Router 4.3+、Pinia 2.1+、axios 1.7+
- Reka UI 2.0+（Headless/无样式）、Tailwind CSS 3.4+
- lucide-vue-next（图标）

## 布局模板（src/components/example）

与 react-example 下 `src/components/example` 一一实现：

| 文件 | 说明 |
|------|------|
| layout-admin-top.vue | 后台管理 - 顶部导航版 |
| layout-admin-side.vue | 后台管理 - 侧边导航版 |
| layout-dashboard.vue | 数据大屏 |
| layout-landing.vue | 产品 Landing 单页 |
| layout-website.vue | 企业官网 |
| layout-saas.vue | SaaS 产品 |
| layout-docs.vue | 文档站 |
| layout-im.vue | 即时通讯 |
| layout-command.vue | 命令行/终端风格 |
| layout-yzw-bigscreen.vue | 一张网风格 |

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```
