import { useTilt } from '../hooks/useTilt';

const BLURBS = [
  { value: '81 KB', label: 'WASM gzipped' },
  { value: 'React + Vue', label: 'First-class adapters' },
  { value: 'Rust', label: 'Compiled to WebAssembly' },
  { value: 'MIT', label: 'Open source' },
];

export function Hero() {
  const { ref, tilt } = useTilt(10);

  return (
    <section className="section hero-section" ref={ref}>
      {/* 3D background layers */}
      <div
        className="hero-bg"
        style={{
          transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        }}
      >
        <div className="hero-bg-layer hero-bg-1" />
        <div className="hero-bg-layer hero-bg-2" />
        <div className="hero-bg-layer hero-bg-3" />
      </div>

      {/* Foreground content */}
      <div className="hero-content">
        <div className="hero-badge">v0.1.0</div>
        <h1 className="hero-title">
          md<span className="hero-title-accent">-sc</span>
        </h1>
        <p className="hero-desc">
          A Markdown WYSIWYG editor engine written in Rust, compiled to
          WebAssembly, with first-class React and Vue 3 adapters.
        </p>
        <div className="hero-actions">
          <a href="#demo-react" className="btn btn-primary">
            Try the demo
          </a>
          <a
            href="https://github.com/Remywwo/md-sc"
            className="btn btn-ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub →
          </a>
        </div>
        <div className="hero-stats">
          {BLURBS.map((blurb) => (
            <div key={blurb.label} className="hero-stat">
              <span className="hero-stat-value">{blurb.value}</span>
              <span className="hero-stat-label">{blurb.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="hero-scroll-hint" aria-hidden>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="7 13 12 18 17 13" />
          <polyline points="7 6 12 11 17 6" />
        </svg>
      </div>
    </section>
  );
}
