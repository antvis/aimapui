import React from 'react';
import NavBar from './NavBar';

interface HomePageProps {
  onNavigate: (demoIndex: number) => void;
  onNavigateDesign: () => void;
  onNavigateBlock: () => void;
  onNavigateSkill?: () => void;
  onNavigateDocs: () => void;
  onToggleTheme: () => void;
  demos: Array<{
    name: string;
    icon: string;
    group: string;
    file: string;
    device?: string;
  }>;
  theme: 'light' | 'dark';
}

const showcaseCards = [
  { title: '移动端应用', description: '开箱即用的移动地图模板', icon: 'smartphone', demoFile: 'app/MobileApp' },
  { title: '气泡图', description: '数据驱动的可视化气泡标注', icon: 'bubble_chart', demoFile: 'composite/BubbleLayer' },
  { title: '分级统计图', description: '行政区域数据映射渲染', icon: 'stacked_bar_chart', demoFile: 'composite/ChoroplethMap' },
  { title: 'PC 端应用', description: '完整的桌面端地图应用模板', icon: 'desktop_windows', demoFile: 'app/PcApp' },
  { title: '蜂窝热力图', description: '六边形聚合空间热力可视化', icon: 'hexagon', demoFile: 'composite/HexagonHeatmap' },
  { title: '弧线流向图', description: 'OD 弧线数据流向可视化', icon: 'south_east', demoFile: 'composite/ArcFlowLayer' },
];

const features = [
  { icon: 'code', title: 'Schema 驱动', description: '通过 JSON Schema 描述地图，无需手动管理实例' },
  { icon: 'widgets', title: '组件化 API', description: 'React 声明式组件，开箱即用' },
  { icon: 'palette', title: '主题定制', description: '内置亮/暗主题，支持自定义样式' },
  { icon: 'devices', title: '响应式', description: '自适应 PC 与移动端多种终端' },
  { icon: 'layers', title: '多引擎支持', description: '高德、Maplibre、Mapbox、天地图' },
  { icon: 'speed', title: '高性能', description: '基于 L7 WebGL 渲染，支持海量数据' },
];

export default function HomePage({ onNavigate, onNavigateDesign, onNavigateBlock, onNavigateDocs, onNavigateSkill, onToggleTheme, demos, theme }: HomePageProps) {
  const isDark = theme === 'dark';

  // Geist/Vercel design tokens
  const c = {
    bg: isDark ? '#000000' : '#ffffff',
    fg: isDark ? '#fafafa' : '#171717',
    subtle: isDark ? '#111111' : '#fafafa',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    borderHover: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
    secondary: isDark ? '#888888' : '#666666',
    muted: isDark ? '#666666' : '#999999',
    accent: isDark ? '#fafafa' : '#171717',
    cardBg: isDark ? '#111111' : '#ffffff',
    navBg: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)',
  };

  const shadow = (level: 'sm' | 'md' | 'card') => {
    const base = `0 0 0 1px ${c.border}`;
    if (level === 'sm') return base;
    if (level === 'md') return `${base}, 0 4px 8px rgba(0,0,0,${isDark ? '0.2' : '0.04'})`;
    return `${base}, 0 2px 4px rgba(0,0,0,${isDark ? '0.1' : '0.02'}), 0 8px 16px rgba(0,0,0,${isDark ? '0.15' : '0.04'})`;
  };

  const handleCardClick = (demoFile: string) => {
    const index = demos.findIndex((d) => d.file === demoFile);
    if (index >= 0) onNavigate(index);
  };

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', background: c.bg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* ══════ Navigation ══════ */}
      <NavBar
        theme={theme}
        activePage="home"
        onLogoClick={() => {}}
        onNavigateDemos={() => onNavigate(0)}
        onNavigateDocs={onNavigateDocs}
        onNavigateDesign={onNavigateDesign}
        onNavigateBlock={onNavigateBlock}
        onNavigateSkill={onNavigateSkill}
        onToggleTheme={onToggleTheme}
      />

      {/* ══════ Hero ══════ */}
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '80px 32px 64px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.035em', color: c.fg, margin: '0 0 16px' }}>
          Good Maps, Made Easy.
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, letterSpacing: '-0.01em', color: c.secondary, maxWidth: 560, margin: '0 auto 40px' }}>
          Schema-driven React components for instant map visualization.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => onNavigate(0)}
            style={{ height: 44, padding: '0 20px', borderRadius: 6, border: 'none', background: c.fg, color: c.bg, fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'opacity 150ms', boxShadow: shadow('sm') }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            Get Started
          </button>
          <button
            onClick={() => window.open('https://github.com/antvis/aimapui', '_blank')}
            style={{ height: 44, padding: '0 20px', borderRadius: 6, border: 'none', background: c.bg, color: c.fg, fontSize: 14, fontWeight: 500, cursor: 'pointer', boxShadow: shadow('sm'), transition: 'box-shadow 150ms' }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = shadow('md'); }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = shadow('sm'); }}
          >
            GitHub
          </button>
        </div>
      </section>

      {/* ══════ Features ══════ */}
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {features.map((f) => (
            <div key={f.title} style={{ padding: '20px 16px', borderRadius: 8, background: c.subtle, textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: c.fg, display: 'block', marginBottom: 12 }}>{f.icon}</span>
              <div style={{ fontSize: 14, fontWeight: 600, color: c.fg, letterSpacing: '-0.01em', marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: c.muted, lineHeight: 1.5 }}>{f.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ Showcase Grid ══════ */}
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px 80px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.025em', color: c.fg, marginBottom: 24, textAlign: 'center' }}>
          精选示例
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {showcaseCards.map((card) => (
            <div
              key={card.title}
              onClick={() => handleCardClick(card.demoFile)}
              style={{
                borderRadius: 8,
                padding: 24,
                minHeight: 140,
                background: c.cardBg,
                boxShadow: shadow('sm'),
                cursor: 'pointer',
                transition: 'box-shadow 200ms ease, transform 200ms ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = shadow('card'); e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = shadow('sm'); e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: c.muted, marginBottom: 16 }}>{card.icon}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: c.fg, letterSpacing: '-0.01em', marginBottom: 4 }}>{card.title}</div>
                <div style={{ fontSize: 13, color: c.secondary, lineHeight: 1.5 }}>{card.description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ Categories ══════ */}
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px 80px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.025em', color: c.fg, marginBottom: 24, textAlign: 'center' }}>
          组件分类
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { group: '应用模板', icon: 'apps' },
            { group: '复合图层', icon: 'layers' },
            { group: 'Marker 标注', icon: 'location_on' },
            { group: '控件', icon: 'tune' },
            { group: '地图引擎', icon: 'public' },
            { group: '基础图层', icon: 'map' },
          ].map((cat) => {
            const count = demos.filter((d) => d.group === cat.group).length;
            return (
              <div
                key={cat.group}
                onClick={() => { const idx = demos.findIndex((d) => d.group === cat.group); if (idx >= 0) onNavigate(idx); }}
                style={{
                  padding: '16px 20px',
                  borderRadius: 8,
                  background: c.cardBg,
                  boxShadow: shadow('sm'),
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  transition: 'box-shadow 200ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = shadow('md'); }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = shadow('sm'); }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: c.muted }}>{cat.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: c.fg, letterSpacing: '-0.01em' }}>{cat.group}</div>
                  <div style={{ fontSize: 12, color: c.muted }}>{count} 个示例</div>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: c.muted }}>chevron_right</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════ Footer ══════ */}
      <footer style={{ textAlign: 'center', padding: '24px', borderTop: `1px solid ${c.border}`, fontSize: 13, color: c.muted }}>
        @antv/AiMapUI · Schema-driven React Map Components · Built with L7
      </footer>
    </div>
  );
}
