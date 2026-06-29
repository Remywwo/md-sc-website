import { useCallback, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

function getInitial(): Theme {
  try {
    const stored = localStorage.getItem('md-sc-website:theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch { /* quota */ }
  return 'dark';
}

export function Nav() {
  const [theme, setTheme] = useState<Theme>(getInitial);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('md-sc-website:theme', theme); } catch { /* quota */ }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <nav className="nav">
      <span className="nav-logo">md-sc</span>
      <div className="nav-actions">
        <a
          className="nav-link"
          href="https://github.com/Remywwo/md-sc-examples"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <button className="btn btn-ghost nav-theme-btn" onClick={toggle}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
}
