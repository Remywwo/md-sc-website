import { useCallback, useEffect, useRef, useState } from 'react';
import {
  EditorView,
  injectDefaultTheme,
  useEditor,
  useEngine,
} from '@md-sc/react';

const STORAGE_KEY = 'md-sc-demo:document';
const THEME_KEY = 'md-sc-demo:theme';

type Theme = 'light' | 'dark';
type ViewMode = 'wysiwyg' | 'source' | 'split';

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

export function App() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [viewMode, setViewMode] = useState<ViewMode>('wysiwyg');
  const [sourceText, setSourceText] = useState('');
  const [currentLine, setCurrentLine] = useState(1);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);

  // 1. Engine (loads WASM).
  const engine = useEngine();

  // 2. Editor (mounts when engine is ready).
  const editor = useEditor({
    engine,
    initial: (() => {
      try { return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_DOC; }
      catch { return DEFAULT_DOC; }
    })(),
    onChange: (md) => {
      setSourceText(md);
      try { localStorage.setItem(STORAGE_KEY, md); } catch { /* quota */ }
    },
  });

  const wasmStatus = !engine ? 'loading' : 'ready';
  const editorReady = engine !== null && editor !== null;

  // 3. Theme: persist + system.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* quota */ }
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      try { if (localStorage.getItem(THEME_KEY)) return; }
      catch { /* quota */ }
      setTheme(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // 4. Default theme CSS: inject once engine is ready.
  useEffect(() => {
    if (engine) injectDefaultTheme();
  }, [engine]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Scroll sync between source and editor in split mode.
  useEffect(() => {
    if (viewMode !== 'split') return;
    const src = textareaRef.current;
    const dst = editor?.el;
    if (!src || !dst) return;

    let syncing = false;
    const sync = (from: HTMLElement, to: HTMLElement) => {
      if (syncing) return;
      syncing = true;
      const pct = from.scrollTop / Math.max(1, from.scrollHeight - from.clientHeight);
      to.scrollTop = pct * Math.max(0, to.scrollHeight - to.clientHeight);
      requestAnimationFrame(() => { syncing = false; });
    };

    const onSrcScroll = () => sync(src, dst);
    const onDstScroll = () => sync(dst, src);

    src.addEventListener('scroll', onSrcScroll, { passive: true });
    dst.addEventListener('scroll', onDstScroll, { passive: true });
    return () => {
      src.removeEventListener('scroll', onSrcScroll);
      dst.removeEventListener('scroll', onDstScroll);
    };
  }, [viewMode, editor]);

  // Line number gutter.
  const renderGutter = useCallback((lineCount: number, activeLine: number) => {
    if (!gutterRef.current) return;
    let html = '';
    for (let i = 1; i <= lineCount; i++) {
      html += `<span class="${i === activeLine ? 'line-active' : ''}">${i}\n</span>`;
    }
    gutterRef.current.innerHTML = html;
  }, []);

  const updateGutter = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const text = ta.value;
    const lineCount = text.split('\n').length;
    const beforeCursor = text.substring(0, ta.selectionStart);
    const line = beforeCursor.split('\n').length;
    setCurrentLine(line);
    renderGutter(lineCount, line);
  }, [renderGutter]);

  const syncGutterScroll = useCallback(() => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  useEffect(() => {
    if (viewMode !== 'wysiwyg' && textareaRef.current) updateGutter();
  }, [sourceText, viewMode, updateGutter]);

  // In split mode, sync source edits to editor (debounced).
  const splitTimerRef = useRef<number | null>(null);
  const handleSplitSourceChange = useCallback((text: string) => {
    setSourceText(text);
    if (splitTimerRef.current !== null) window.clearTimeout(splitTimerRef.current);
    splitTimerRef.current = window.setTimeout(() => {
      editor?.setMarkdown(text);
    }, 300);
  }, [editor]);

  // ---- toolbar actions ----

  const handleOpen = () => fileInputRef.current?.click();

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const text = await file.text();
    setFileName(file.name);
    setSourceText(text);
    editor.setMarkdown(text);
    try { localStorage.setItem(STORAGE_KEY, text); } catch { /* quota */ }
    e.target.value = '';
  };

  const handleDownload = () => {
    const md = viewMode === 'wysiwyg' ? (editor?.getMarkdown() ?? '') : sourceText;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName ?? 'document.md';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleNew = () => {
    if (!editor || !confirm('Discard current document?')) return;
    editor.setMarkdown('');
    setSourceText('');
    setFileName(null);
  };

  const handleReset = () => {
    if (!editor || !confirm('Reset to default document?')) return;
    editor.setMarkdown(DEFAULT_DOC);
    setSourceText(DEFAULT_DOC);
    setFileName(null);
    try { localStorage.setItem(STORAGE_KEY, DEFAULT_DOC); } catch { /* quota */ }
  };

  return (
    <div className="app">
      <header className="filebar">
        <h1>md-sc</h1>
        <button onClick={handleNew} disabled={!editorReady}>New</button>
        <button onClick={handleOpen} disabled={!editorReady}>Open</button>
        <button onClick={handleDownload} disabled={!editorReady}>Download</button>
        <button onClick={handleReset} disabled={!editorReady}>Reset</button>
        <input ref={fileInputRef} type="file" accept=".md,.markdown,.txt"
          className="file-input" onChange={handleFileSelected} />
        {fileName && <span className="file-name" title={fileName}>{fileName}</span>}
        <span className="spacer" />
        <button onClick={() => {
            const md = viewMode === 'wysiwyg' ? (editor?.getMarkdown() ?? '')
              : (textareaRef.current?.value ?? sourceText);
            if (splitTimerRef.current !== null) window.clearTimeout(splitTimerRef.current);
            editor?.setMarkdown(md); setSourceText(md); setViewMode('wysiwyg');
          }}
          disabled={!editorReady} className={viewMode === 'wysiwyg' ? 'active' : ''}>
          WYSIWYG
        </button>
        <button onClick={() => {
            setSourceText(editor?.getMarkdown() ?? ''); setViewMode('source');
          }} disabled={!editorReady} className={viewMode === 'source' ? 'active' : ''}>
          Source
        </button>
        <button onClick={() => {
            setSourceText(editor?.getMarkdown() ?? ''); setViewMode('split');
          }} disabled={!editorReady} className={viewMode === 'split' ? 'active' : ''}>
          Split
        </button>
        <button className="theme-toggle" onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <span className="file-name">
          {wasmStatus === 'loading' && 'loading wasm…'}
          {wasmStatus === 'ready' && 'wasm ready'}
        </span>
      </header>

      <main className={`main editor-main${viewMode === 'split' ? ' split-layout' : ''}`}>
        <div className="source-wrapper"
          style={{ display: viewMode === 'wysiwyg' ? 'none' : '' }}>
          <div ref={gutterRef} className="source-gutter" aria-hidden="true" />
          <div className="source-textarea-wrap">
            <textarea
              ref={textareaRef}
              className="source-textarea"
              value={sourceText}
              onChange={(e) => viewMode === 'split'
                ? handleSplitSourceChange(e.target.value)
                : setSourceText(e.target.value)}
              onKeyUp={updateGutter}
              onClick={updateGutter}
              onScroll={syncGutterScroll}
              spellCheck={false}
            />
          </div>
        </div>
        <div className="editor-container"
          style={{ display: viewMode === 'source' ? 'none' : '' }}>
          {editor ? <EditorView editor={editor} className="md-sc-editor-host" /> : null}
        </div>
      </main>

      <footer className="statusbar">
        <span className="ok">
          {editorReady ? 'ready' : 'loading…'}
        </span>
        <span>WYSIWYG · contentEditable · {fileName ?? 'untitled.md'}</span>
        <span style={{ flex: 1 }} />
        <span>autosave on</span>
      </footer>
    </div>
  );
}
