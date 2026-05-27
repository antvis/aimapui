import React from 'react';
import NavBar from './NavBar';
import { SourceCodePanel, SourceCodeToggle } from '../components/SourceCodePanel';

interface BlockDemo {
  name: string;
  icon: string;
  component: React.ComponentType;
  file: string;
  device?: string;
}

interface BlockPageProps {
  demos: BlockDemo[];
  theme: 'light' | 'dark';
  sourceModules: Record<string, { default: string }>;
  onToggleTheme: () => void;
  onNavigateHome: () => void;
  onNavigateDemo: () => void;
  onNavigateDocs: () => void;
  onNavigateDesign: () => void;
  onNavigateBlock: () => void;
}

export default function BlockPage({ demos, theme, sourceModules, onToggleTheme, onNavigateHome, onNavigateDemo, onNavigateDocs, onNavigateDesign }: BlockPageProps) {
  const isDark = theme === 'dark';
  const [current, setCurrent] = React.useState(0);
  const [showPanel, setShowPanel] = React.useState(false);

  const c = {
    bg: isDark ? '#000000' : '#ffffff',
    fg: isDark ? '#fafafa' : '#171717',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    secondary: isDark ? '#888888' : '#666666',
    muted: isDark ? '#666666' : '#999999',
    activeItem: isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f0',
  };

  const demo = demos[current];
  const DemoComponent = demo?.component;
  const sourceKey = demo ? `./${demo.file}.tsx` : '';
  const sourceCode = sourceKey ? (sourceModules[sourceKey]?.default ?? '// 源码加载失败') : '';

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: c.bg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <NavBar
        theme={theme}
        activePage="block"
        onLogoClick={onNavigateHome}
        onNavigateDemos={onNavigateDemo}
        onNavigateDocs={onNavigateDocs}
        onNavigateDesign={onNavigateDesign}
        onNavigateBlock={() => {}}
        onToggleTheme={onToggleTheme}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', maxWidth: 1440, margin: '0 auto', width: '100%', padding: '0 48px' }}>
        {/* 左侧目录 */}
        <aside style={{ width: 220, minWidth: 220, flexShrink: 0, overflowY: 'auto', padding: '24px 0', userSelect: 'none' }}>
          {(() => {
            const mobileItems = demos.filter(d => d.device === 'mobile');
            const desktopItems = demos.filter(d => d.device !== 'mobile');
            const renderGroup = (label: string, icon: string, items: BlockDemo[]) => (
              <div key={label} style={{ marginBottom: 16 }}>
                <div style={{ padding: '4px 16px 8px', fontSize: 10, fontWeight: 600, color: c.muted, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13, opacity: 0.5 }}>{icon}</span>
                  {label}
                </div>
                {items.map((d) => {
                  const idx = demos.indexOf(d);
                  const isActive = idx === current;
                  return (
                    <div
                      key={d.file}
                      onClick={() => setCurrent(idx)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 16px', margin: '2px 6px', borderRadius: 6,
                        cursor: 'pointer', fontSize: 13, fontWeight: isActive ? 500 : 400,
                        color: isActive ? c.fg : c.secondary,
                        background: isActive ? c.activeItem : 'transparent',
                        transition: 'background 120ms, color 120ms',
                      }}
                      onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = c.activeItem; e.currentTarget.style.color = c.fg; } }}
                      onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c.secondary; } }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 17, opacity: isActive ? 1 : 0.4 }}>{d.icon}</span>
                      <span>{d.name}</span>
                    </div>
                  );
                })}
              </div>
            );
            return (
              <>
                {renderGroup('移动端', 'smartphone', mobileItems)}
                {renderGroup('桌面端', 'desktop_windows', desktopItems)}
              </>
            );
          })()}
        </aside>

        {/* 中间内容区 */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {demo?.device === 'mobile' ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.bg }}>
              <div style={{ width: 390, height: 844, maxHeight: 'calc(100% - 40px)', borderRadius: 20, overflow: 'hidden', border: `2px solid ${c.border}`, position: 'relative' }}>
                <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                  {DemoComponent && <DemoComponent />}
                </div>
              </div>
            </div>
          ) : (
            DemoComponent && <DemoComponent />
          )}
        </div>

        {/* 右侧源码切换按钮 + 面板 */}
        <SourceCodeToggle showPanel={showPanel} isDark={isDark} onClick={() => setShowPanel(!showPanel)} />
        {showPanel && (
          <SourceCodePanel sourceCode={sourceCode} fileName={`${demo?.file}.tsx`} isDark={isDark} onClose={() => setShowPanel(false)} />
        )}
      </div>
    </div>
  );
}
