import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import terminal from 'vite-plugin-terminal'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'
const projectId = process.env.PROJECT_ID || ''
const userId = process.env.USER_ID || ''
// 全栈编码沙箱带 userId（/sandbox/projectId_userId/），原型沙箱仅 projectId（/sandbox/projectId/）
const sandboxKey = userId ? `${projectId}_${userId}` : projectId
// 生产构建始终用 '/'，仅 dev 模式使用沙箱路径（避免在容器内打包时被环境变量污染）
const basePath = (!isProduction && projectId) ? `/sandbox/${sandboxKey}/` : '/'
const routerBasename = basePath.replace(/\/$/, '') || '/'

/**
 * Vite 插件：编译时为 Vue 模板元素注入源码定位属性
 *
 * 渲染后 DOM 元素会带上：
 *   data-source-file="src/views/Home.vue"
 *   data-source-line="12"
 *
 * 仅在开发模式下生效，生产构建自动跳过。
 */
function vueSourceLocatorPlugin(): Plugin {
  return {
    name: 'vue-source-locator',
    enforce: 'pre',
    transform(code, id) {
      // 生产环境不注入
      if (process.env.NODE_ENV === 'production') return;
      // 只处理 src/ 下的 .vue 文件
      if (!id.endsWith('.vue')) return;
      const normalized = id.replace(/\\/g, '/');
      const srcMatch = normalized.match(/(src\/.*)$/);
      if (!srcMatch) return;
      const filePath = srcMatch[1];

      const lines = code.split('\n');
      let inTemplate = false;
      let changed = false;

      const result = lines.map((line, idx) => {
        // 检测 <template> 区域边界
        if (/^\s*<template[\s>]/.test(line)) { inTemplate = true; return line; }
        if (/^\s*<\/template>/.test(line)) { inTemplate = false; return line; }
        if (!inTemplate) return line;

        // 匹配 HTML 开始标签（跳过 </ 闭合、<!-- 注释、<template>、<slot>、<component> 等）
        const replaced = line.replace(
          /(<(?!\/|!|template[\s>]|slot[\s>\/]|component[\s>\/]|transition[\s>\/]|keep-alive[\s>\/])([a-zA-Z][\w-]*))/g,
          (match) => {
            changed = true;
            return `${match} data-source-file="${filePath}" data-source-line="${idx + 1}"`;
          }
        );
        return replaced;
      });

      if (!changed) return;
      return result.join('\n');
    },
  };
}

function fixTerminalBasePath(): Plugin {
  return {
    name: 'fix-terminal-base-path',
    transform(code, id) {
      if (id.includes('vite-plugin-terminal') || id.includes('virtual:terminal')) {
        return code.replace(
          'const terminalUrl = ""',
          `const terminalUrl = "${routerBasename}"`
        )
      }
      return code
    }
  }
}

function injectEarlyErrorHandler(): Plugin {
  return {
    name: 'inject-early-error-handler',
    transformIndexHtml(html: string) {
      const script = `
    <script>
      window.addEventListener('error', function(event) {
        console.error('[Error] ' + event.message, {
          file: event.filename,
          line: event.lineno,
          col: event.colno,
          stack: event.error ? event.error.stack : undefined
        });
      });
      window.addEventListener('unhandledrejection', function(event) {
        console.error('[UnhandledRejection]', {
          message: event.reason ? (event.reason.message || String(event.reason)) : String(event.reason),
          stack: event.reason ? event.reason.stack : undefined
        });
      });
    </script>`
      return html.replace('</head>', script + '\n  </head>')
    }
  }
}

export default defineConfig({
  base: basePath,
  define: {
    __ROUTER_BASENAME__: JSON.stringify(routerBasename),
  },
  plugins: [
    vueSourceLocatorPlugin(),
    vue(),
    ...(!isProduction ? [
      terminal({
        console: 'terminal',
        output: ['console', 'terminal'],
      }),
      fixTerminalBasePath(),
    ] : []),
    injectEarlyErrorHandler(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
    open: false,
    hmr: {
      overlay: false,
    },
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'lucide-vue-next',
      'reka-ui',
      'clsx',
      'tailwind-merge',
      'date-fns',
      'leaflet',
    ],
  },
})
