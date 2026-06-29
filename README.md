# md-sc

> Markdown WYSIWYG editor — TypeScript SDK with first-class React and Vue 3 adapters.

## 可用包

| 包名 | 框架 | 状态 |
|------|------|------|
| `@md-sc/react` | React 18 | ✅ 可用 |
| `@md-sc/vue` | Vue 3 | ✅ 可用 |
| `@md-sc/svelte` | Svelte 5 | 🔜 规划中 |
| `@md-sc/solid` | SolidJS | 🔜 规划中 |

## 前置条件

- Node.js ≥ 18
- pnpm ≥ 9（或 npm / yarn）

## 快速开始 & 使用教程

### React

```bash
pnpm add @md-sc/react react react-dom
```

```tsx
import { useEngine, useEditor, EditorView, injectDefaultTheme } from '@md-sc/react';
import { useEffect } from 'react';

function App() {
  // 1. 加载引擎（异步，全局单例缓存）
  const engine = useEngine();

  // 2. 挂载编辑器
  const editor = useEditor({
    engine,
    initial: '# Hello, **md-sc**!',
    onChange: (markdown) => console.log('内容更新:', markdown),
  });

  // 3. 注入内置主题
  useEffect(() => {
    if (engine) injectDefaultTheme();
  }, [engine]);

  if (!editor) return <p>加载中…</p>;
  return <EditorView editor={editor} />;
}
```

### Vue 3

```bash
pnpm add @md-sc/vue vue
```

```vue
<script setup lang="ts">
import { useEngine, useEditor, EditorView, injectDefaultTheme } from '@md-sc/vue';
import { watch } from 'vue';

const engine = useEngine();
const editor = useEditor({
  engine,
  initial: '# Hello, **md-sc**!',
  onChange: (md) => console.log('内容更新:', md),
});

watch(engine, (e) => {
  if (e) injectDefaultTheme();
});
</script>

<template>
  <p v-if="!engine">加载中…</p>
  <EditorView v-else :editor="editor" />
</template>
```

### 在框架外的项目中使用

```bash
pnpm add @md-sc/sdk
```

```ts
import { loadEngine, createEditor, injectDefaultTheme } from '@md-sc/sdk';

const engine = await loadEngine();
injectDefaultTheme();

const host = document.getElementById('editor')!;
const editor = createEditor(host, '# Hello', {
  engine,
  onChange: (md) => console.log(md),
});
```

## API 参考

### Engine

```ts
const engine = await loadEngine();

engine.parseAst(source);          // 解析为 AST
engine.parseEvents(source);       // 解析为事件流
engine.renderHtml(source);        // 渲染为 HTML
engine.lineCount(source);         // 总行数
engine.byteCount(source);         // 字节数
```

### Editor

```ts
const editor = createEditor(container, initial, { engine, onChange });

editor.getMarkdown();             // 获取 Markdown 源码
editor.setMarkdown('# New');      // 替换内容
editor.setOnChange((md) => {});   // 更新回调
editor.destroy();                 // 销毁
```

### 主题

```ts
injectDefaultTheme();   // 注入内置主题（亮色 / 暗色）

// 注册样式插件（覆盖 CSS 变量）
const cleanup = registerThemePlugin('my-theme', `
  :root { --md-code-bg: #f5f5f5; }
  :root[data-theme="dark"] { --md-code-bg: #1a1a2e; }
`);
cleanup();              // 卸载
```

## 输入规则

在编辑器中直接输入 Markdown 语法，自动转换为富文本：

| 输入 | 效果 |
|------|------|
| `**文本**` | **粗体** |
| `*文本*` | *斜体* |
| `` `代码` `` | `行内代码` |
| `~~文本~~` | ~~删除线~~ |
| `# 标题` | H1–H6 标题 |
| `> 引用` | 引用块 |
| `- 列表` | 无序列表 |
| `1. 列表` | 有序列表 |

