import React from 'react';
import NavBar from './NavBar';

interface DesignDoc {
  id: string;
  name: string;
  icon: string;
  group: string;
  content: string;
  htmlDemo: string;
}

interface DesignPageProps {
  docs: DesignDoc[];
  groups: string[];
  theme: 'light' | 'dark';
  initialDocIndex?: number;
  onDocChange?: (docId: string) => void;
  onToggleTheme: () => void;
  onNavigateHome: () => void;
  onNavigateDemo: () => void;
  onNavigateDocs: () => void;
  onNavigateBlock: () => void;
  markdownToHtml: (md: string) => string;
}

export default function DesignPage({ docs, groups, theme, initialDocIndex = 0, onDocChange, onToggleTheme, onNavigateHome, onNavigateDemo, onNavigateDocs, onNavigateBlock, markdownToHtml }: DesignPageProps) {
  const isDark = theme === 'dark';
  const [currentDoc, setCurrentDoc] = React.useState(initialDocIndex);
  const [showSource, setShowSource] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // 注入 data-theme 到 srcDoc，确保首帧渲染就使用正确主题
  const injectTheme = (html: string, dark: boolean): string => {
    const themeAttr = dark ? 'dark' : 'light';
    return html.replace(/<html(\s[^>]*)?>/i, `<html$1 data-theme="${themeAttr}">`);
  };

  // 同步主题到 iframe（切换主题时动态更新，避免重新加载）
  React.useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument;
      if (doc?.documentElement) {
        doc.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      }
    } catch (_) { /* cross-origin guard */ }
  }, [isDark]);

  const handleSelectDoc = (index: number) => {
    setCurrentDoc(index);
    const doc = docs[index];
    if (doc && onDocChange) {
      onDocChange(doc.id);
    }
  };

  const c = {
    bg: isDark ? '#000000' : '#ffffff',
    fg: isDark ? '#fafafa' : '#171717',
    subtle: isDark ? '#111111' : '#fafafa',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    secondary: isDark ? '#888888' : '#666666',
    muted: isDark ? '#666666' : '#999999',
    cardBg: isDark ? '#0a0a0a' : '#ffffff',
    navBg: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)',
    sidebarBg: isDark ? '#0a0a0a' : '#ffffff',
    activeItem: isDark ? 'rgba(255,255,255,0.06)' : '#fafafa',
  };

  const selectedDoc = docs[currentDoc];

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: c.bg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* ══════ Navigation ══════ */}
      <NavBar
        theme={theme}
        activePage="design"
        onLogoClick={onNavigateHome}
        onNavigateDemos={onNavigateDemo}
        onNavigateDocs={onNavigateDocs}
        onNavigateDesign={() => {}}
        onNavigateBlock={onNavigateBlock}
        onToggleTheme={onToggleTheme}
      />

      {/* ══════ Content ══════ */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', maxWidth: 1440, margin: '0 auto', width: '100%', padding: '0 48px' }}>
        {/* Sidebar */}
        <aside style={{ width: 220, minWidth: 220, flexShrink: 0, overflowY: 'auto', padding: '24px 0', userSelect: 'none' }}>
          {groups.map((group) => {
            const groupIcon: Record<string, string> = { '应用模板': 'widgets', '复合图层': 'bubble_chart', 'Marker 标注': 'location_on', '控件': 'tune', '基础图层': 'layers' };
            return (
              <div key={group} style={{ marginBottom: 8 }}>
                <div style={{ padding: '4px 16px 8px', fontSize: 10, fontWeight: 600, color: c.muted, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13, opacity: 0.5 }}>{groupIcon[group] || 'folder'}</span>
                  {group}
                </div>
                {docs
                  .map((doc, index) => ({ ...doc, index }))
                  .filter((doc) => doc.group === group)
                  .map((doc) => {
                    const isActive = doc.index === currentDoc;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => handleSelectDoc(doc.index)}
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
                        <span className="material-symbols-outlined" style={{ fontSize: 17, opacity: isActive ? 1 : 0.4 }}>{doc.icon}</span>
                        <span>{doc.name}</span>
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* HTML Demo 内容 */}
          {selectedDoc ? (
            selectedDoc.htmlDemo ? (
              <iframe
                ref={iframeRef}
                srcDoc={injectTheme(selectedDoc.htmlDemo, isDark)}
                style={{ width: '100%', height: '100%', border: 'none', background: isDark ? '#000' : '#fff' }}
                title={`${selectedDoc.name} Demo`}
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: c.muted }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, marginBottom: 12 }}>construction</span>
                <div style={{ fontSize: 14 }}>暂无 HTML Demo</div>
              </div>
            )
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: c.muted }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, marginRight: 8 }}>description</span>
              暂无设计规范文档
            </div>
          )}

        </main>

        {/* 右侧源码切换按钮（fixed 定位在页面最右侧居中） */}
        {selectedDoc && (
          <button
            onClick={() => setShowSource(!showSource)}
            style={{
              position: 'fixed', right: showSource ? 660 : 0, top: '50%', transform: 'translateY(-50%)',
              zIndex: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
              width: 28, padding: '12px 0', borderRadius: '6px 0 0 6px', border: 'none',
              background: isDark ? '#1a1a1a' : '#f0f0f0',
              color: isDark ? '#ccc' : '#444', cursor: 'pointer',
              transition: 'all 200ms ease',
              boxShadow: isDark ? '-2px 0 8px rgba(0,0,0,0.3)' : '-2px 0 8px rgba(0,0,0,0.06)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? '#333' : '#e0e0e0'; e.currentTarget.style.color = isDark ? '#fff' : '#000'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = isDark ? '#1a1a1a' : '#f0f0f0'; e.currentTarget.style.color = isDark ? '#ccc' : '#444'; }}
            title={showSource ? '收起源码' : '展开源码'}
          >
            <span className="pulse-hint" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', writingMode: 'vertical-rl' }}>查看规范定义</span>
          </button>
        )}

        {/* 右侧 Markdown 源码面板（fixed 定位） */}
        {showSource && selectedDoc && (
          <div style={{ position: 'fixed', right: 0, top: 64, bottom: 0, width: 660, zIndex: 55, background: c.cardBg, borderLeft: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: isDark ? '-4px 0 24px rgba(0,0,0,0.4)' : '-4px 0 24px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderBottom: `1px solid ${c.border}` }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: c.fg }}>description</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: c.fg, letterSpacing: 0.3 }}>设计规范</span>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => setShowSource(false)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent', color: c.muted, cursor: 'pointer', transition: 'all 150ms' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = c.fg; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = c.muted; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
              </button>
            </div>
            <div className="md-prose" data-theme={isDark ? 'dark' : 'light'} style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
              <style dangerouslySetInnerHTML={{ __html: `
                .md-prose { font-size: 14px; line-height: 1.8; }
                .md-prose[data-theme="light"] { color: #1f2328; }
                .md-prose[data-theme="dark"] { color: #e6edf3; }
                .md-prose h1 { font-size: 22px; font-weight: 700; margin: 0 0 12px; }
                .md-prose h2 { font-size: 17px; font-weight: 600; margin: 28px 0 12px; padding-bottom: 8px; }
                .md-prose h3 { font-size: 15px; font-weight: 600; margin: 20px 0 8px; }
                .md-prose[data-theme="light"] h1,
                .md-prose[data-theme="light"] h2,
                .md-prose[data-theme="light"] h3 { color: #1f2328; }
                .md-prose[data-theme="light"] h2 { border-bottom: 1px solid #d1d9e0; }
                .md-prose[data-theme="dark"] h1,
                .md-prose[data-theme="dark"] h2,
                .md-prose[data-theme="dark"] h3 { color: #e6edf3; }
                .md-prose[data-theme="dark"] h2 { border-bottom: 1px solid #30363d; }
                .md-prose p { margin: 8px 0; font-size: 14px; line-height: 1.8; }
                .md-prose[data-theme="light"] p { color: #1f2328; }
                .md-prose[data-theme="dark"] p { color: #c9d1d9; }
                .md-prose strong { font-weight: 600; }
                .md-prose[data-theme="light"] strong { color: #1f2328; }
                .md-prose[data-theme="dark"] strong { color: #e6edf3; }
                .md-prose ul { list-style: disc; padding-left: 24px; margin: 10px 0; }
                .md-prose li { margin: 4px 0; font-size: 14px; line-height: 1.8; }
                .md-prose[data-theme="light"] li { color: #1f2328; }
                .md-prose[data-theme="dark"] li { color: #c9d1d9; }
                .md-prose hr { border: none; margin: 20px 0; }
                .md-prose[data-theme="light"] hr { border-top: 1px solid #d1d9e0; }
                .md-prose[data-theme="dark"] hr { border-top: 1px solid #30363d; }
                .md-prose .md-inline-code { font-family: 'JetBrains Mono', monospace; font-size: 12px; padding: 2px 6px; border-radius: 4px; }
                .md-prose[data-theme="light"] .md-inline-code { background: #eff1f3; color: #0550ae; }
                .md-prose[data-theme="dark"] .md-inline-code { background: #161b22; color: #79c0ff; }
                .md-prose .md-code-block { border-radius: 8px; padding: 14px 16px; overflow-x: auto; margin: 14px 0; font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.6; }
                .md-prose[data-theme="light"] .md-code-block { background: #f6f8fa; border: 1px solid #d1d9e0; color: #1f2328; }
                .md-prose[data-theme="dark"] .md-code-block { background: #161b22; border: 1px solid #30363d; color: #e6edf3; }
                .md-prose .md-table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 13px; }
                .md-prose .md-table th { text-align: left; font-weight: 600; padding: 8px 12px; font-size: 12px; }
                .md-prose .md-table td { padding: 7px 12px; }
                .md-prose[data-theme="light"] .md-table th { border-bottom: 2px solid #d1d9e0; color: #1f2328; background: #f6f8fa; }
                .md-prose[data-theme="light"] .md-table td { border-bottom: 1px solid #eaecf0; color: #1f2328; }
                .md-prose[data-theme="dark"] .md-table th { border-bottom: 2px solid #30363d; color: #58a6ff; background: rgba(22,27,34,0.5); }
                .md-prose[data-theme="dark"] .md-table td { border-bottom: 1px solid #21262d; color: #c9d1d9; }
              ` }} />
              <div dangerouslySetInnerHTML={{ __html: markdownToHtml(selectedDoc.content) }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
