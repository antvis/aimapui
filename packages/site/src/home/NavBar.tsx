import React from 'react';

interface NavItem {
  label: string;
  active?: boolean;
  action: () => void;
}

interface NavBarProps {
  theme: 'light' | 'dark';
  activePage: 'home' | 'demos' | 'docs' | 'block' | 'skill';
  onLogoClick: () => void;
  onNavigateDemos: () => void;
  onNavigateDocs: () => void;
  onNavigateBlock?: () => void;
  onNavigateSkill?: () => void;
  onToggleTheme: () => void;
}

export default function NavBar({ theme, activePage, onLogoClick, onNavigateDemos, onNavigateDocs, onNavigateBlock, onNavigateSkill, onToggleTheme }: NavBarProps) {
  const isDark = theme === 'dark';

  const c = {
    fg: isDark ? '#fafafa' : '#171717',
    secondary: isDark ? '#888888' : '#666666',
    muted: isDark ? '#666666' : '#999999',
    navBg: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
  };

  const navItems: NavItem[] = [
    { label: 'Docs', active: activePage === 'docs', action: onNavigateDocs },
    { label: 'Components', active: activePage === 'demos', action: onNavigateDemos },
    { label: 'Blocks', active: activePage === 'block', action: onNavigateBlock || (() => {}) },
    { label: 'Skill', active: activePage === 'skill', action: onNavigateSkill || (() => {}) },
  ];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, height: 64, flexShrink: 0, backdropFilter: 'blur(12px)', background: c.navBg, boxShadow: `0 1px 0 0 ${c.border}` }}>
      <nav style={{ width: '100%', maxWidth: 1440, margin: '0 auto', height: '100%', padding: '0 48px', display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Logo */}
        <div onClick={onLogoClick} style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, cursor: 'pointer', marginRight: 16 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill={c.fg} />
          </svg>
          <span style={{ fontSize: 15, fontWeight: 600, color: c.fg, letterSpacing: '-0.02em' }}>AiMapUI</span>
        </div>

        {/* Nav Items */}
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: 'transparent', color: item.active ? c.fg : c.secondary, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'color 150ms ease' }}
            onMouseEnter={(e) => { if (!item.active) e.currentTarget.style.color = c.fg; }}
            onMouseLeave={(e) => { if (!item.active) e.currentTarget.style.color = c.secondary; }}
          >
            {item.label}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {/* GitHub */}
        <button
          onClick={() => window.open('https://github.com/antvis/aimapui', '_blank')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 6, border: 'none', background: 'transparent', color: c.muted, cursor: 'pointer', transition: 'color 150ms' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = c.fg; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = c.muted; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 6, border: 'none', background: 'transparent', color: c.muted, cursor: 'pointer', transition: 'color 150ms' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = c.fg; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = c.muted; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </nav>
    </header>
  );
}
