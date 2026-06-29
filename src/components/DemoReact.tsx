import { useCallback, useEffect, useRef, useState } from 'react';
import { useEngine, useEditor, EditorView, injectDefaultTheme } from '@md-sc/react';

const INITIAL = `# Hello, md-sc 👋

This is a **live demo** of the React adapter.

## What you're seeing

> A blockquote with *formatted* text inside.

\`\`\`tsx
import { useEditor, EditorView } from '@md-sc/react';
function App() {
  const editor = useEditor({ initial: '# Hello' });
  return <EditorView editor={editor} />;
}
\`\`\`

### Try it

- Type **bold** or *italic* inline
- Type \`\`\` for a code block
- Press Enter after \`# heading\` or \`- list\`

---

| Feature | Status |
|---------|--------|
| WYSIWYG | ✅ |
| GFM     | ✅ |
| Themes  | ✅ |
`;

type ViewMode = 'wysiwyg' | 'source' | 'split';

export function DemoReact() {
  const engine = useEngine();
  const [viewMode, setViewMode] = useState<ViewMode>('wysiwyg');
  const [sourceText, setSourceText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (engine) injectDefaultTheme();
  }, [engine]);

  const editor = useEditor({
    engine,
    initial: INITIAL,
    onChange: (md) => setSourceText(md),
  });

  // Split-mode scroll sync.
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
    src.addEventListener('scroll', () => sync(src, dst), { passive: true });
    dst.addEventListener('scroll', () => sync(dst, src), { passive: true });
  }, [viewMode, editor]);

  const switchMode = useCallback(
    (mode: ViewMode) => {
      if (mode === 'wysiwyg' || mode === 'split') {
        const md = editor?.getMarkdown() ?? sourceText;
        editor?.setMarkdown(md);
        setSourceText(md);
      } else {
        const md = editor?.getMarkdown() ?? '';
        setSourceText(md);
      }
      setViewMode(mode);
    },
    [editor, sourceText],
  );

  return (
    <section className="section demo-section" id="demo-react">
      <div className="demo-inner">
        {/* Header */}
        <div className="demo-header">
          <h2 className="section-title">
            Live <span className="section-title-accent">Demo</span>
          </h2>
          <div className="demo-toolbar">
            <button
              className={`btn btn-ghost demo-mode-btn${viewMode === 'wysiwyg' ? ' active' : ''}`}
              onClick={() => switchMode('wysiwyg')}
            >
              WYSIWYG
            </button>
            <button
              className={`btn btn-ghost demo-mode-btn${viewMode === 'source' ? ' active' : ''}`}
              onClick={() => switchMode('source')}
            >
              Source
            </button>
            <button
              className={`btn btn-ghost demo-mode-btn${viewMode === 'split' ? ' active' : ''}`}
              onClick={() => switchMode('split')}
            >
              Split
            </button>
          </div>
        </div>

        {/* Editor area */}
        <div className={`demo-editor-wrap${viewMode === 'split' ? ' demo-split' : ''}`}>
          {/* Source pane (source / split modes) */}
          {(viewMode === 'source' || viewMode === 'split') && (
            <div className="demo-source-pane">
              <textarea
                ref={textareaRef}
                className="demo-source-textarea"
                value={sourceText}
                onChange={(e) => {
                  setSourceText(e.target.value);
                  editor?.setMarkdown(e.target.value);
                }}
                spellCheck={false}
              />
            </div>
          )}

          {/* WYSIWYG pane (wysiwyg / split modes) */}
          {viewMode !== 'source' &&
            (editor ? (
              <div className="demo-wysiwyg-pane">
                <EditorView editor={editor} className="demo-editor-host" />
              </div>
            ) : (
              <div className="demo-loading">Loading engine…</div>
            ))}
        </div>
      </div>
    </section>
  );
}
