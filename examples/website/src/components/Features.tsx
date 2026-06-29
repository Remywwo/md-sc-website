const CARDS = [
  {
    icon: '⚡',
    title: 'WYSIWYG Editor',
    desc: 'contentEditable-based editor with input rules, format unwrapping, and block-level shortcuts. Type Markdown, see it rendered live.',
  },
  {
    icon: '📦',
    title: 'Framework adapters',
    desc: 'First-class React (hooks + components) and Vue 3 (composition API) packages. Thin layers over a shared TypeScript core SDK.',
  },
  {
    icon: '🔷',
    title: 'TypeScript first',
    desc: 'Fully typed public API — Engine, Editor, AST node, and event types are exported from every adapter package.',
  },
  {
    icon: '🎨',
    title: 'Theme system',
    desc: 'CSS custom-property based theming with light/dark support. Plugin stylesheets stack via registerThemePlugin().',
  },
  {
    icon: '📝',
    title: 'GFM extensions',
    desc: 'Tables, strikethrough, task lists, and autolinks — all enabled by default in the standard adapter packages.',
  },
  {
    icon: '🔌',
    title: 'Zero config',
    desc: 'Self-contained JS bundle. Drop it into Vite, Next.js, Nuxt, or any bundler — import and go.',
  },
];

export function Features() {
  return (
    <section className="section features-section">
      <div className="features-inner">
        <h2 className="section-title">
          Everything you need{' '}
          <span className="section-title-dim">in one SDK</span>
        </h2>
        <div className="features-grid">
          {CARDS.map((card) => (
            <div key={card.title} className="feature-card">
              <span className="feature-icon">{card.icon}</span>
              <h3 className="feature-title">{card.title}</h3>
              <p className="feature-desc">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
