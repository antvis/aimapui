import React from 'react';
import NavBar from './NavBar';

interface SkillPageProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onNavigateHome: () => void;
  onNavigateDemo: () => void;
  onNavigateDocs: () => void;
  onNavigateDesign: () => void;
  onNavigateBlock: () => void;
}

const SKILL_REPO_URL = 'https://github.com/antvis/aimapui';
const SKILL_PATH_IN_REPO = 'skills/aimapui';

const installCommands: Array<{ label: string; command: string; description: string; recommended?: boolean }> = [
  {
    label: 'npx skills add',
    description: '一行命令安装，自动下载并注册到 ~/.agents/skills/',
    recommended: true,
    command: `# 安装 aimapui skill
npx skills add antvis/aimapui

# 完成后重启你的 AI 编程助手（Claude Code / Cursor / ...），
# 输入 "aimapui" 即可触发`,
  },
];

const triggers = [
  '"用 aimapui 画一个气泡图，数据是各省人口"',
  '"基于 AiMap 写一个分级统计图"',
  '"帮我实现一个移动端打卡地图，要有底部抽屉和定位"',
  '"给我一个 Schema 驱动的地图配置示例"',
];

const skillFeatures = [
  { icon: 'auto_awesome', title: '自然语言生图', description: '用一句话让 AI 直接产出可运行的 AiMap 组件代码' },
  { icon: 'menu_book', title: '内置参考文档', description: '随用随加载，覆盖 30+ 主题的 references 知识库' },
  { icon: 'schema', title: 'Schema 优先', description: 'AI 输出符合 AiMapSchema 规范的 JSON，可直接驱动渲染' },
  { icon: 'verified', title: '组件 API 准确', description: '不再编造不存在的 Props，所有示例对齐当前版本' },
];

export default function SkillPage({ theme, onToggleTheme, onNavigateHome, onNavigateDemo, onNavigateDocs, onNavigateDesign, onNavigateBlock }: SkillPageProps) {
  const isDark = theme === 'dark';
  const [copiedIndex, setCopiedIndex] = React.useState<number>(-1);

  const c = {
    bg: isDark ? '#000000' : '#ffffff',
    fg: isDark ? '#fafafa' : '#171717',
    subtle: isDark ? '#111111' : '#fafafa',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    secondary: isDark ? '#888888' : '#666666',
    muted: isDark ? '#666666' : '#999999',
    codeBg: isDark ? '#0a0a0a' : '#f6f8fa',
    codeBorder: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    codeText: isDark ? '#e6edf3' : '#1f2328',
    accent: '#2563eb',
  };

  const shadow = (level: 'sm' | 'md') => {
    const base = `0 0 0 1px ${c.border}`;
    if (level === 'sm') return base;
    return `${base}, 0 4px 8px rgba(0,0,0,${isDark ? '0.2' : '0.04'})`;
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      window.setTimeout(() => setCopiedIndex(-1), 1500);
    });
  };

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', background: c.bg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <NavBar
        theme={theme}
        activePage="skill"
        onLogoClick={onNavigateHome}
        onNavigateDemos={onNavigateDemo}
        onNavigateDocs={onNavigateDocs}
        onNavigateDesign={onNavigateDesign}
        onNavigateBlock={onNavigateBlock}
        onToggleTheme={onToggleTheme}
      />

      {/* ═══ Hero ═══ */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 32px 48px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: c.subtle, fontSize: 12, color: c.secondary, marginBottom: 20 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: c.accent }}>auto_awesome</span>
          AI Skill · for Claude Code / Cursor / Aone Copilot
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.035em', color: c.fg, margin: '0 0 16px' }}>
          让 AI 用 AiMapUI 画地图
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, letterSpacing: '-0.01em', color: c.secondary, maxWidth: 620, margin: '0 auto 32px' }}>
          一行命令安装 aimapui skill，让你的 AI 编程助手准确理解 AiMap 的组件 API、Schema 规范与示例数据，
          一句话就能产出可运行的地图代码。
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <a
            href={`${SKILL_REPO_URL}/tree/main/${SKILL_PATH_IN_REPO}`}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 44, padding: '0 20px', borderRadius: 6, background: c.fg, color: c.bg, fontSize: 14, fontWeight: 500, textDecoration: 'none', boxShadow: shadow('sm') }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
            查看 SKILL.md
          </a>
          <button
            onClick={onNavigateDocs}
            style={{ height: 44, padding: '0 20px', borderRadius: 6, border: 'none', background: c.bg, color: c.fg, fontSize: 14, fontWeight: 500, cursor: 'pointer', boxShadow: shadow('sm') }}
          >
            阅读组件文档
          </button>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {skillFeatures.map((f) => (
            <div key={f.title} style={{ padding: '20px 16px', borderRadius: 8, background: c.subtle, textAlign: 'left' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: c.accent, display: 'block', marginBottom: 10 }}>{f.icon}</span>
              <div style={{ fontSize: 14, fontWeight: 600, color: c.fg, letterSpacing: '-0.01em', marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: c.muted, lineHeight: 1.5 }}>{f.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Install ═══ */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 32px 48px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: c.fg, letterSpacing: '-0.02em', margin: '0 0 8px' }}>安装</h2>
        <p style={{ fontSize: 14, color: c.secondary, margin: '0 0 24px' }}>
          一行命令安装，兼容 Claude Code / Cursor / Windsurf 等所有支持 <code style={{ padding: '2px 6px', borderRadius: 4, background: c.subtle, fontSize: 12.5 }}>~/.agents/skills/</code> 约定的 AI 编程助手：
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {installCommands.map((item, idx) => (
            <div
              key={item.label}
              style={{
                borderRadius: 10,
                border: item.recommended ? `1px solid ${c.accent}` : `1px solid ${c.border}`,
                background: c.subtle,
                overflow: 'hidden',
                boxShadow: item.recommended ? `0 0 0 3px ${isDark ? 'rgba(37,99,235,0.12)' : 'rgba(37,99,235,0.08)'}` : undefined,
              }}
            >
              <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${c.border}` }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: c.fg, marginBottom: 2, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {item.label}
                    {item.recommended && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 7px', borderRadius: 999, background: c.accent, color: '#fff', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.02em' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 11 }}>bolt</span>
                        最快
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: c.muted }}>{item.description}</div>
                </div>
                <button
                  onClick={() => handleCopy(item.command, idx)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 28, padding: '0 10px', borderRadius: 6, border: `1px solid ${c.border}`, background: c.bg, color: c.fg, fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'background 150ms' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    {copiedIndex === idx ? 'check' : 'content_copy'}
                  </span>
                  {copiedIndex === idx ? '已复制' : '复制'}
                </button>
              </div>
              <pre style={{ margin: 0, padding: '14px 18px', background: c.codeBg, color: c.codeText, fontSize: 12.5, lineHeight: 1.7, fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", overflow: 'auto', whiteSpace: 'pre' }}>
                <code>{item.command}</code>
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Triggers ═══ */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px 48px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: c.fg, letterSpacing: '-0.02em', margin: '0 0 8px' }}>试试这些指令</h2>
        <p style={{ fontSize: 14, color: c.secondary, margin: '0 0 20px' }}>
          安装完成后，直接在 AI 助手里输入下面这类自然语言，skill 会自动加载相应的参考文档：
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {triggers.map((t) => (
            <div key={t} style={{ padding: '14px 16px', borderRadius: 8, border: `1px solid ${c.border}`, background: c.subtle, fontSize: 13.5, color: c.fg, lineHeight: 1.55 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: c.accent, marginRight: 6, verticalAlign: '-2px' }}>chat</span>
              {t}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ What's inside ═══ */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px 80px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: c.fg, letterSpacing: '-0.02em', margin: '0 0 8px' }}>Skill 内容概览</h2>
        <p style={{ fontSize: 14, color: c.secondary, margin: '0 0 20px' }}>
          <code style={{ padding: '2px 6px', borderRadius: 4, background: c.subtle, fontSize: 12.5, fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace" }}>skills/aimapui/</code>
          {' '}采用 Anthropic Skill 规范组织，按需加载参考文档以控制 token 占用：
        </p>
        <div style={{ borderRadius: 10, border: `1px solid ${c.border}`, background: c.subtle, padding: '16px 20px', fontFamily: "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace", fontSize: 13, lineHeight: 1.8, color: c.codeText }}>
          <div>aimapui/</div>
          <div>├── SKILL.md            <span style={{ color: c.muted }}># 主入口（始终加载）</span></div>
          <div>└── references/        <span style={{ color: c.muted }}># 主题文档（按需加载）</span></div>
          <div>{'    '}├── core/         <span style={{ color: c.muted }}># AiMap 容器、EventBus</span></div>
          <div>{'    '}├── layers/       <span style={{ color: c.muted }}># 6 个基础图层</span></div>
          <div>{'    '}├── composite/    <span style={{ color: c.muted }}># 复合图层（Bubble/Route/...）</span></div>
          <div>{'    '}├── controls/     <span style={{ color: c.muted }}># 控件</span></div>
          <div>{'    '}├── interaction/  <span style={{ color: c.muted }}># Marker / Popup / Tooltip</span></div>
          <div>{'    '}├── legend/       <span style={{ color: c.muted }}># 8 类图例</span></div>
          <div>{'    '}├── mobile/       <span style={{ color: c.muted }}># 移动端组件</span></div>
          <div>{'    '}├── schema/       <span style={{ color: c.muted }}># Schema/JSON 驱动</span></div>
          <div>{'    '}├── data/         <span style={{ color: c.muted }}># 数据源</span></div>
          <div>{'    '}└── visual/       <span style={{ color: c.muted }}># 视觉映射规范</span></div>
        </div>
      </section>
    </div>
  );
}
