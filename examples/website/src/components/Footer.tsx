export function Footer() {
  return (
    <footer className="section footer-section">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">md-sc</span>
          <span className="footer-tagline">Rust · WASM · Markdown</span>
        </div>
        <div className="footer-links">
          <a href="https://github.com/Remywwo/md-sc" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://github.com/Remywwo/md-sc/blob/main/README.md" target="_blank" rel="noopener noreferrer">Docs</a>
          <span>MIT OR Apache-2.0</span>
        </div>
      </div>
    </footer>
  );
}
