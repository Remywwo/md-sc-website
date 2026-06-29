<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { EditorView, injectDefaultTheme, useEditor, useEngine } from '@md-sc/vue';

const STORAGE_KEY = 'md-sc-demo:document';
const THEME_KEY = 'md-sc-demo:theme';
type Theme = 'light' | 'dark';
type ViewMode = 'wysiwyg' | 'source' | 'split';

const DEFAULT_DOC = `# md-sc Web Demo

This is a **Markdown** editor powered by the md-sc engine,
compiled to **WebAssembly** and running entirely in your browser.

## CommonMark

> A blockquote can contain **formatted** text and *emphasis*.

\`\`\`rust
fn main() {
    println!("Hello, md-sc!");
}
\`\`\`

- Unordered list item
- Another item

1. Ordered list item
2. Another ordered item

---

## GFM Extensions

### Strikethrough

This is ~~strikethrough text~~.

### Tables

| Feature | Status |
|---------|--------|
| CommonMark | ✅ |
| GFM Tables | ✅ |
| GFM Strikethrough | ✅ |
`;

const fileName = ref<string | null>(null);
const theme = ref<Theme>(getInitialTheme());
const viewMode = ref<ViewMode>('wysiwyg');
const sourceText = ref('');
const currentLine = ref(1);
const fileInputRef = ref<HTMLInputElement | null>(null);
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const gutterRef = ref<HTMLDivElement | null>(null);

const engine = useEngine();
const editor = useEditor({
  engine,
  initial: loadInitial(),
  onChange: (md) => {
    sourceText.value = md;
    try { localStorage.setItem(STORAGE_KEY, md); } catch { /* quota */ }
  },
});

const wasmStatus = computed(() => engine.value ? 'ready' : 'loading');
const editorReady = computed(() => engine.value !== null && editor.value !== null);

watch(engine, (e) => {
  if (e) injectDefaultTheme();
});

watch(theme, (t) => {
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem(THEME_KEY, t); } catch { /* quota */ }
}, { immediate: true });

onMounted(() => {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => {
    if (localStorage.getItem(THEME_KEY)) return;
    theme.value = e.matches ? 'dark' : 'light';
  };
  mq.addEventListener('change', handler);
});

// Scroll sync (split mode).
watch([viewMode, editor], () => {
  if (viewMode.value !== 'split') return;
  const src = textareaRef.value;
  const dst = editor.value?.el;
  if (!src || !dst) return;
  let syncing = false;
  const sync = (from: HTMLElement, to: HTMLElement) => {
    if (syncing) return;
    syncing = true;
    const pct = from.scrollTop / Math.max(1, from.scrollHeight - from.clientHeight);
    to.scrollTop = pct * Math.max(0, to.scrollHeight - to.clientHeight);
    requestAnimationFrame(() => { syncing = false; });
  };
  const onSrc = () => sync(src, dst);
  const onDst = () => sync(dst, src);
  src.addEventListener('scroll', onSrc, { passive: true });
  dst.addEventListener('scroll', onDst, { passive: true });
});

// Gutter.
function renderGutter(lineCount: number, activeLine: number) {
  if (!gutterRef.value) return;
  let html = '';
  for (let i = 1; i <= lineCount; i++) {
    html += `<span class="${i === activeLine ? 'line-active' : ''}">${i}\n</span>`;
  }
  gutterRef.value.innerHTML = html;
}

function updateGutter() {
  const ta = textareaRef.value;
  if (!ta) return;
  const text = ta.value;
  const lineCount = text.split('\n').length;
  const before = text.substring(0, ta.selectionStart);
  const line = before.split('\n').length;
  currentLine.value = line;
  renderGutter(lineCount, line);
}

function syncGutterScroll() {
  if (gutterRef.value && textareaRef.value) {
    gutterRef.value.scrollTop = textareaRef.value.scrollTop;
  }
}

watch([sourceText, viewMode], () => {
  if (viewMode.value !== 'wysiwyg' && textareaRef.value) updateGutter();
});

// Split-mode: debounce source edits into editor.
let splitTimer: number | null = null;
function handleSplitSourceChange(text: string) {
  sourceText.value = text;
  if (splitTimer !== null) window.clearTimeout(splitTimer);
  splitTimer = window.setTimeout(() => {
    editor.value?.setMarkdown(text);
  }, 300);
}

// Toolbar handlers.
function handleOpen() { fileInputRef.value?.click(); }

async function handleFileSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file || !editor.value) return;
  const text = await file.text();
  fileName.value = file.name;
  sourceText.value = text;
  editor.value.setMarkdown(text);
  try { localStorage.setItem(STORAGE_KEY, text); } catch { /* quota */ }
  (e.target as HTMLInputElement).value = '';
}

function handleDownload() {
  const md = viewMode.value === 'wysiwyg' ? (editor.value?.getMarkdown() ?? '') : sourceText.value;
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.value ?? 'document.md';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function handleNew() {
  if (!editor.value || !confirm('Discard current document?')) return;
  editor.value.setMarkdown('');
  sourceText.value = '';
  fileName.value = null;
}

function handleReset() {
  if (!editor.value || !confirm('Reset to default document?')) return;
  editor.value.setMarkdown(DEFAULT_DOC);
  sourceText.value = DEFAULT_DOC;
  fileName.value = null;
  try { localStorage.setItem(STORAGE_KEY, DEFAULT_DOC); } catch { /* quota */ }
}

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
}

function setMode(mode: ViewMode) {
  if (mode === 'wysiwyg') {
    const md = viewMode.value === 'wysiwyg' ? (editor.value?.getMarkdown() ?? '')
      : (textareaRef.value?.value ?? sourceText.value);
    if (splitTimer !== null) window.clearTimeout(splitTimer);
    editor.value?.setMarkdown(md);
    sourceText.value = md;
  } else {
    sourceText.value = editor.value?.getMarkdown() ?? '';
  }
  viewMode.value = mode;
}

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch { /* quota */ }
  return getSystemTheme();
}

function loadInitial(): string {
  try { return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_DOC; }
  catch { return DEFAULT_DOC; }
}
</script>

<template>
  <div class="app">
    <header class="filebar">
      <h1>md-sc</h1>
      <button @click="handleNew" :disabled="!editorReady">New</button>
      <button @click="handleOpen" :disabled="!editorReady">Open</button>
      <button @click="handleDownload" :disabled="!editorReady">Download</button>
      <button @click="handleReset" :disabled="!editorReady">Reset</button>
      <input ref="fileInputRef" type="file" accept=".md,.markdown,.txt"
        class="file-input" @change="handleFileSelected" />
      <span v-if="fileName" class="file-name" :title="fileName">{{ fileName }}</span>
      <span class="spacer" />
      <button @click="setMode('wysiwyg')" :disabled="!editorReady"
        :class="{ active: viewMode === 'wysiwyg' }">WYSIWYG</button>
      <button @click="setMode('source')" :disabled="!editorReady"
        :class="{ active: viewMode === 'source' }">Source</button>
      <button @click="setMode('split')" :disabled="!editorReady"
        :class="{ active: viewMode === 'split' }">Split</button>
      <button class="theme-toggle" @click="toggleTheme"
        :title="`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`">
        {{ theme === 'light' ? '🌙' : '☀️' }}
      </button>
      <span class="file-name">
        {{ wasmStatus === 'loading' ? 'loading wasm…' : 'wasm ready' }}
      </span>
    </header>

    <main :class="['main', 'editor-main', { 'split-layout': viewMode === 'split' }]">
      <div class="source-wrapper" :style="{ display: viewMode === 'wysiwyg' ? 'none' : '' }">
        <div ref="gutterRef" class="source-gutter" aria-hidden="true" />
        <div class="source-textarea-wrap">
          <textarea
            ref="textareaRef"
            class="source-textarea"
            :value="sourceText"
            @input="(e: Event) => viewMode === 'split'
              ? handleSplitSourceChange((e.target as HTMLTextAreaElement).value)
              : sourceText = (e.target as HTMLTextAreaElement).value"
            @keyup="updateGutter"
            @click="updateGutter"
            @scroll="syncGutterScroll"
            spellcheck="false"
          />
        </div>
      </div>
      <div class="editor-container" :style="{ display: viewMode === 'source' ? 'none' : '' }">
        <EditorView v-if="editor" :editor="editor" class="md-sc-editor-host" />
      </div>
    </main>

    <footer class="statusbar">
      <span class="ok">
        {{ editorReady ? 'ready' : 'loading…' }}
      </span>
      <span>WYSIWYG · contentEditable · {{ fileName ?? 'untitled.md' }}</span>
      <span style="flex: 1;" />
      <span>autosave on</span>
    </footer>
  </div>
</template>
