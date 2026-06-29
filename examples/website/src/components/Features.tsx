const CARDS = [
  {
    icon: '⚡',
    title: 'WYSIWYG Editor',
    desc: 'contentEditable-based editor with input rules, format unwrapping, and block-level shortcuts. Type Markdown, see it rendered live.',
  },
  {
    icon: '🦀',
    title: 'Rust + WebAssembly',
    desc: 'The parsing engine runs in Rust compiled to WASM — fast, small (81 KB gzip), and safe.',
  },
  {
    icon: '📦',
    title: 'Framework adapters',
    desc: 'First-class React (hooks + components) and Vue 3 (composition API) packages. Thin layers over a shared vanilla-TS core.',
  },
  {
    icon: '🎨',
    title: 'Theme system',
    desc: 'CSS custom-property based theming with light/dark support. Plugin stylesheets stack via `registerThemePlugin()`.',
  },
  {
    icon: '📝',
    title: 'GFM extensions',
    desc: 'Tables, strikethrough, task lists, autolinks — all feature-gated at compile time so you only pay for what you use.',
  },
  {
    icon: '🔌',
    title: 'Embeddable',
    desc: 'Self-contained JS bundle with inlined WASM. Drop it into Vite, Next.js, Nuxt, or any bundler — zero config.',
  },
];

export function Features() {
  return (
    <section className="section features-section">
      <div className="features-inner">
        <h2 className="section-title">
          Everything you need <span className="section-title-dim">in one engine</span>
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
