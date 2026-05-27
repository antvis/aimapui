import React from 'react';
import { marked } from 'marked';
import { docsNav, DocNavGroup, DocNavItem } from './docs-nav';
import NavBar from '../home/NavBar';

// ── 类型定义 ──
interface DemoItem {
  name: string;
  icon: string;
  component: React.ComponentType;
  group: string;
  file: string;
  device?: string;
}

interface DocsPageProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onNavigateHome: () => void;
  onNavigateDemo: () => void;
  onNavigateDesign: () => void;
  onNavigateBlock: () => void;
  docsMap: Record<string, string>; // id → markdown content
  demos?: DemoItem[];
  sourceModules?: Record<string, { default: string }>;
}

// 文档 ID → Demo file 的映射
const docToDemoMap: Record<string, string> = {
  // 复合图层
  'composite-layers/bubble-layer': 'composite/BubbleLayer',
  'composite-layers/arc-flow-layer': 'composite/ArcFlowLayer',
  'composite-layers/icon-font-layer': 'composite/IconFontLabel',
  'composite-layers/icon-image-layer': 'composite/IconLabel',
  'composite-layers/fill-layer': 'composite/ChoroplethMap',
  'composite-layers/hexagon-layer': 'composite/HexagonHeatmap',
  'composite-layers/marker-cluster-layer': 'composite/MarkerCluster',
  'composite-layers/route-layer': 'composite/RouteLayer',
  'composite-layers/satellite-layer': 'composite/SatelliteLayer',
  'composite-layers/tiff-raster-layer': 'composite/TiffRasterLayer',
  'composite-layers/china-district': 'layer/AdministrativeMap',
  // 基础图层
  'layers/point-layer': 'layer/PointLayer',
  'layers/line-layer': 'layer/LineLayer',
  'layers/polygon-layer': 'layer/FillLayer',
  'layers/heatmap-layer': 'layer/HeatmapLayer',
  'layers/image-layer': 'layer/ImageLayer',
  'layers/raster-layer': 'layer/RasterTileLayer',
  // 交互组件
  'interaction/marker': 'marker/Marker',
  'interaction/popup': 'marker/Popup',
  'interaction/tooltip': 'marker/Tooltip',
  // 控件
  'controls/zoom-control': 'control/ZoomControl',
  'controls/fullscreen-control': 'control/FullscreenControl',
  'controls/geo-locate-control': 'control/GeoLocateControl',
  'controls/export-image-control': 'control/ExportImageControl',
  'controls/map-theme-control': 'control/MapThemeControl',
  'controls/mouse-location-control': 'control/MouseLocationControl',
  'controls/layer-switch-control': 'control/ThemeToggle',
  // 容器 & 地图引擎
  'container/map-scene': 'engine/MaplibreMap',
};

// 文档 ID → 多 Demo 映射（Tab 切换）
const docToMultiDemoMap: Record<string, Array<{ label: string; file: string }>> = {
  'container/aimap': [
    { label: '高德地图', file: 'engine/GaodeMap' },
    { label: 'Maplibre', file: 'engine/MaplibreMap' },
    { label: 'Mapbox', file: 'engine/MapboxMap' },
    { label: '天地图', file: 'engine/TiandituMap' },
    { label: '独立 Map', file: 'engine/IndependentMap' },
  ],
};

// ── 简易语法高亮 Token 类型 ──
type TokenType = 'keyword' | 'string' | 'number' | 'comment' | 'type' | 'punctuation' | 'function' | 'operator' | 'plain';

// ── 简易代码语法高亮器 ──
function highlightCode(code: string, lang: string, isDark: boolean): string {
  const theme: Record<TokenType, string> = {
    keyword: isDark ? '#ff7b72' : '#cf222e',
    string: isDark ? '#a5d6ff' : '#0a3069',
    number: isDark ? '#79c0ff' : '#0550ae',
    comment: isDark ? '#8b949e' : '#8b949e',
    type: isDark ? '#ffa657' : '#953800',
    punctuation: isDark ? '#c9d1d9' : '#24292f',
    function: isDark ? '#d2a8ff' : '#8250df',
    operator: isDark ? '#ff7b72' : '#cf222e',
    plain: isDark ? '#e6edf3' : '#1f2328',
  };

  const tsKeywords = new Set([
    'import', 'export', 'from', 'const', 'let', 'var', 'function', 'return', 'if', 'else',
    'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'new', 'delete', 'typeof',
    'instanceof', 'in', 'of', 'class', 'extends', 'implements', 'interface', 'type', 'enum',
    'namespace', 'as', 'is', 'readonly', 'private', 'public', 'protected', 'static', 'abstract',
    'async', 'await', 'yield', 'throw', 'try', 'catch', 'finally', 'default', 'true', 'false',
    'null', 'undefined', 'void', 'never', 'unknown', 'any', 'string', 'number', 'boolean',
    'object', 'Record', 'Array', 'Promise',
  ]);

  const tokenize = (src: string): Array<{ type: TokenType; text: string }> => {
    const tokens: Array<{ type: TokenType; text: string }> = [];
    let i = 0;
    while (i < src.length) {
      if (src[i] === '/' && src[i + 1] === '/') {
        let end = src.indexOf('\n', i); if (end === -1) end = src.length;
        tokens.push({ type: 'comment', text: src.slice(i, end) }); i = end; continue;
      }
      if (src[i] === '/' && src[i + 1] === '*') {
        let end = src.indexOf('*/', i + 2); if (end === -1) end = src.length; else end += 2;
        tokens.push({ type: 'comment', text: src.slice(i, end) }); i = end; continue;
      }
      if (src[i] === '"' || src[i] === "'" || src[i] === '`') {
        const q = src[i]; let j = i + 1;
        while (j < src.length) { if (src[j] === '\\') { j += 2; continue; } if (src[j] === q) { j++; break; } j++; }
        tokens.push({ type: 'string', text: src.slice(i, j) }); i = j; continue;
      }
      if (/\d/.test(src[i]) && (i === 0 || !/\w/.test(src[i - 1]))) {
        let j = i; while (j < src.length && /[\d.xXa-fA-F]/.test(src[j])) j++;
        tokens.push({ type: 'number', text: src.slice(i, j) }); i = j; continue;
      }
      if (/[a-zA-Z_$]/.test(src[i])) {
        let j = i; while (j < src.length && /[\w$]/.test(src[j])) j++;
        const word = src.slice(i, j);
        if (tsKeywords.has(word)) tokens.push({ type: 'keyword', text: word });
        else if (j < src.length && src[j] === '(') tokens.push({ type: 'function', text: word });
        else if (/^[A-Z]/.test(word) && word.length > 1) tokens.push({ type: 'type', text: word });
        else tokens.push({ type: 'plain', text: word });
        i = j; continue;
      }
      if (/[=<>!&|?:+\-*/%^~]/.test(src[i])) {
        let j = i; while (j < src.length && /[=<>!&|?:+\-*/%^~]/.test(src[j])) j++;
        tokens.push({ type: 'operator', text: src.slice(i, j) }); i = j; continue;
      }
      if (/[{}()\[\];,.]/.test(src[i])) { tokens.push({ type: 'punctuation', text: src[i] }); i++; continue; }
      tokens.push({ type: 'plain', text: src[i] }); i++;
    }
    return tokens;
  };

  const shouldHighlight = ['tsx', 'ts', 'typescript', 'jsx', 'javascript', 'js'].includes(lang.toLowerCase());
  const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  if (!shouldHighlight) return `<span style="color:${theme.plain}">${escaped}</span>`;

  return tokenize(code).map(t => {
    const c = theme[t.type] || theme.plain;
    const e = t.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<span style="color:${c}">${e}</span>`;
  }).join('');
}

// ── Markdown → HTML 转换器（文档专用，基于 marked） ──
function docsMarkdownToHtml(md: string, isDark: boolean): string {
  const C = {
    codeBg: isDark ? '#0d1117' : '#f6f8fa',
    codeBorder: isDark ? '#30363d' : '#d0d7de',
    tableBg: isDark ? '#0d1117' : '#ffffff',
    tableBorder: isDark ? '#30363d' : '#d0d7de',
    tableHeaderBg: isDark ? '#161b22' : '#f6f8fa',
    tableHeaderText: isDark ? '#e6edf3' : '#1f2328',
    text: isDark ? '#e6edf3' : '#1f2328',
    text2: isDark ? '#8b949e' : '#656d76',
    inlineCodeBg: isDark ? 'rgba(110,118,129,0.2)' : 'rgba(0,0,0,0.06)',
    inlineCodeColor: isDark ? '#e6edf3' : '#1f2328',
    heading2Border: isDark ? '#30363d' : '#d8dee4',
    calloutBorder: isDark ? '#30363d' : '#d0d7de',
  };

  const slugify = (s: string) => s.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '');

  const renderer = new marked.Renderer();

  // marked v18: 自定义渲染器中 token.text 是原始文本，需用 parseInline(tokens) 渲染行内格式
  renderer.heading = function(this: { parser: { parseInline: (tokens: unknown[]) => string } }, token: { text: string; depth: number; tokens: unknown[] }) {
    const rawText = token.text;
    const html = this.parser.parseInline(token.tokens);
    const id = slugify(rawText.replace(/<[^>]+>/g, ''));
    if (token.depth === 1) return `<h1 style="font-size:28px;font-weight:700;color:${C.text};margin:0 0 6px;letter-spacing:-0.025em;line-height:1.3">${html}</h1>`;
    if (token.depth === 2) return `<h2 id="${id}" style="font-size:20px;font-weight:600;color:${C.text};margin:32px 0 14px;padding-bottom:10px;border-bottom:1px solid ${C.heading2Border};scroll-margin-top:80px">${html}</h2>`;
    if (token.depth === 3) return `<h3 id="${id}" style="font-size:16px;font-weight:600;color:${C.text};margin:28px 0 10px;scroll-margin-top:80px">${html}</h3>`;
    return `<h4 id="${id}" style="font-size:14px;font-weight:600;color:${C.text};margin:24px 0 8px;scroll-margin-top:80px">${html}</h4>`;
  };

  renderer.paragraph = function(this: { parser: { parseInline: (tokens: unknown[]) => string } }, token: { text: string; tokens: unknown[] }) {
    const html = this.parser.parseInline(token.tokens);
    return `<p style="margin:10px 0;font-size:14px;line-height:1.85;color:${C.text2}">${html}</p>`;
  };

  renderer.strong = ({ text }: { text: string }) => `<strong style="color:${C.text};font-weight:600">${text}</strong>`;

  renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
    const language = lang || 'tsx';
    const highlighted = highlightCode(text, language, isDark);
    return `<div style="margin:16px 0;border-radius:8px;overflow:hidden;border:1px solid ${C.codeBorder}"><div style="padding:8px 14px;background:${C.tableHeaderBg};border-bottom:1px solid ${C.codeBorder};font-size:12px;color:${C.text2};font-family:ui-sans-serif,-apple-system,sans-serif;display:flex;justify-content:space-between;align-items:center"><span style="text-transform:uppercase;letter-spacing:0.04em;font-weight:500">${language}</span></div><pre style="margin:0;padding:16px 18px;background:${C.codeBg};overflow-x:auto;tab-size:2"><code style="font-family:ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace;font-size:13px;line-height:1.7;display:block">${highlighted}</code></pre></div>`;
  };

  renderer.codespan = ({ text }: { text: string }) =>
    `<code style="background:${C.inlineCodeBg};padding:2px 6px;border-radius:4px;font-size:12px;color:${C.inlineCodeColor};font-family:ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace;border:none">${text}</code>`;

  renderer.table = function(this: { parser: { parseInline: (tokens: unknown[]) => string } }, token: { header: { tokens: unknown[] }[]; rows: { tokens: unknown[] }[][] }) {
    const thHtml = token.header.map((h) =>
      `<th style="padding:10px 14px;text-align:left;font-weight:600;font-size:12px;color:${C.tableHeaderText};white-space:nowrap;background:${C.tableHeaderBg};border-bottom:2px solid ${C.tableBorder};letter-spacing:0.01em">${this.parser.parseInline(h.tokens)}</th>`
    ).join('');
    const trHtml = token.rows.map((row, ri) => {
      const bg = ri % 2 === 1 ? (isDark ? 'rgba(110,118,129,0.04)' : 'rgba(175,184,193,0.06)') : 'transparent';
      return `<tr style="background:${bg};border-bottom:1px solid ${C.tableBorder}">${row.map((cell) =>
        `<td style="padding:9px 14px;font-size:13px;line-height:1.65;color:${C.text};vertical-align:top;min-width:60px">${this.parser.parseInline(cell.tokens)}</td>`
      ).join('')}</tr>`;
    }).join('');
    return `<div style="margin:20px 0;overflow-x:auto;border:1px solid ${C.tableBorder};border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.04)"><table style="width:100%;border-collapse:collapse;background:${C.tableBg}"><thead><tr>${thHtml}</tr></thead><tbody>${trHtml}</tbody></table></div>`;
  };

  renderer.blockquote = function(this: { parser: { parse: (tokens: unknown[]) => string } }, token: { tokens: unknown[] }) {
    return `<blockquote style="margin:16px 0;padding:10px 18px;border-left:3px solid ${C.calloutBorder};color:${C.text2};font-size:13.5px;line-height:1.75;background:${isDark ? 'rgba(110,118,129,0.04)' : 'rgba(175,184,193,0.04)'};border-radius:0 6px 6px 0">${this.parser.parse(token.tokens)}</blockquote>`;
  };

  renderer.list = function(this: { parser: { parse: (tokens: unknown[]) => string } }, token: { ordered: boolean; items: { tokens: unknown[] }[] }) {
    const itemsHtml = token.items.map((item) =>
      `<li style="margin:5px 0;padding-left:2px;font-size:14px;line-height:1.8;color:${C.text}">${this.parser.parse(item.tokens)}</li>`
    ).join('');
    return token.ordered
      ? `<ol style="list-style:decimal;padding-left:22px;margin:12px 0">${itemsHtml}</ol>`
      : `<ul style="list-style:disc;padding-left:22px;margin:12px 0">${itemsHtml}</ul>`;
  };

  renderer.link = ({ href, text }: { href: string; text: string }) => {
    const isExternal = href.startsWith('http://') || href.startsWith('https://');
    const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${href}"${target} style="color:${C.inlineCodeColor};text-decoration:underline;text-underline-offset:2px">${text}</a>`;
  };

  renderer.hr = () => `<hr style="border:none;border-top:1px solid ${C.codeBorder};margin:28px 0"/>`;

  return marked(md, { renderer, async: false }) as string;
}

// ── 从 markdown 中提取 TOC 条目 ──
function extractToc(md: string): Array<{ title: string; slug: string; level: number }> {
  const toc: Array<{ title: string; slug: string; level: number }> = [];
  for (const line of md.split('\n')) {
    const m = line.match(/^(#{2,4})\s+(.+)$/);
    if (m) {
      const title = m[2].replace(/`/g, '').replace(/\*\*/g, '');
      toc.push({ title, slug: title.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, ''), level: m[1].length });
    }
  }
  return toc;
}

// ── Demo 代码块（可展开/折叠） ──
function DemoCodeBlock({ code, isDark, border }: { code: string; isDark: boolean; border: string }) {
  const [expanded, setExpanded] = React.useState(false);
  const highlighted = highlightCode(code, 'tsx', isDark);
  return (
    <div style={{ borderTop: `1px solid ${border}` }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', cursor: 'pointer', fontSize: 12, color: isDark ? '#888' : '#666', background: isDark ? '#111' : '#f5f5f5', userSelect: 'none', transition: 'background 120ms' }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{expanded ? 'expand_less' : 'expand_more'}</span>
        <span style={{ fontWeight: 500 }}>{expanded ? '收起代码' : '查看代码'}</span>
      </div>
      {expanded && (
        <div style={{ maxHeight: 400, overflow: 'auto', background: isDark ? '#0d1117' : '#f8f9fa' }}>
          <pre style={{ margin: 0, padding: '14px 18px', fontSize: 12, lineHeight: 1.7, fontFamily: "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace", whiteSpace: 'pre', tabSize: 2 }}>
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          </pre>
        </div>
      )}
    </div>
  );
}

// ── 主组件 ──
export default function DocsPage({ theme, onToggleTheme, onNavigateHome, onNavigateDemo, onNavigateDesign, onNavigateBlock, docsMap, demos = [], sourceModules = {} }: DocsPageProps) {
  const isDark = theme === 'dark';

  const getInitialDoc = (): string => {
    const pathname = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
    const hash = window.location.hash.slice(1);
    const route = (pathname || hash).replace(/^docs\/?/, '');
    if (route && docsMap[route]) return route;
    return docsNav[0]?.items[0]?.id ?? '';
  };

  const [currentDoc, setCurrentDoc] = React.useState(getInitialDoc);
  const [activeTocSlug, setActiveTocSlug] = React.useState('');
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const c = {
    bg: isDark ? '#000000' : '#ffffff',
    fg: isDark ? '#fafafa' : '#171717',
    subtle: isDark ? '#0a0a0a' : '#fafafa',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    secondary: isDark ? '#888888' : '#666666',
    muted: isDark ? '#666666' : '#999999',
    navBg: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)',
    sidebarBg: isDark ? '#0a0a0a' : '#ffffff',
    activeItem: isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f0',
  };

  const content = docsMap[currentDoc] ?? '';
  const toc = React.useMemo(() => extractToc(content), [content]);
  const htmlContent = React.useMemo(() => docsMarkdownToHtml(content, isDark), [content, isDark]);
  const flatItems = React.useMemo(() => {
    const items: Array<DocNavItem & { groupTitle: string }> = [];
    for (const g of docsNav) for (const i of g.items) items.push({ ...i, groupTitle: g.title });
    return items;
  }, []);

  const currentIndex = flatItems.findIndex(i => i.id === currentDoc);
  const prevDoc = currentIndex > 0 ? flatItems[currentIndex - 1] : null;
  const nextDoc = currentIndex < flatItems.length - 1 ? flatItems[currentIndex + 1] : null;

  const navigateToDoc = (id: string) => {
    setCurrentDoc(id); setActiveTocSlug(''); setSidebarOpen(false);
    window.history.pushState(null, '', `/docs/${id}`);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  };

  React.useEffect(() => {
    const handleRoute = () => {
      const route = (window.location.pathname.replace(/^\//, '').replace(/\/$/, '') || window.location.hash.slice(1)).replace(/^docs\/?/, '');
      if (route && docsMap[route] && route !== currentDoc) setCurrentDoc(route);
    };
    window.addEventListener('popstate', handleRoute);
    window.addEventListener('hashchange', handleRoute);
    return () => { window.removeEventListener('popstate', handleRoute); window.removeEventListener('hashchange', handleRoute); };
  }, [currentDoc, docsMap]);

  React.useEffect(() => {
    if (!contentRef.current || toc.length === 0) return;
    const headings = contentRef.current.querySelectorAll('h2, h3, h4');
    if (headings.length === 0) return;
    toc.forEach(item => {
      for (const h of headings) {
        if (h.textContent?.replace(/`/g, '').replace(/\*\*/g, '') === item.title) { h.id = item.slug; break; }
      }
    });
    const obs = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) setActiveTocSlug(e.target.id);
    }, { root: contentRef.current, rootMargin: '-80px 0px -60% 0px', threshold: 0 });
    headings.forEach(h => obs.observe(h));
    return () => obs.disconnect();
  }, [toc, htmlContent]);

  const renderSidebar = () => (
    <aside style={{ width: 200, minWidth: 200, flexShrink: 0, padding: '20px 0', userSelect: 'none' }}>
      {docsNav.map((group: DocNavGroup) => (
        <div key={group.title} style={{ marginBottom: 4 }}>
          <div style={{ padding: '8px 12px 4px', fontSize: 10, fontWeight: 600, color: c.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{group.title}</div>
          {group.items.map((item: DocNavItem) => {
            const active = item.id === currentDoc;
            return (
              <div key={item.id} onClick={() => navigateToDoc(item.id)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 12px', margin: '1px 4px', borderRadius: 5,
                cursor: 'pointer', fontSize: 13, fontWeight: active ? 500 : 400,
                color: active ? c.fg : c.secondary,
                background: active ? c.activeItem : 'transparent',
                transition: 'background 120ms, color 120ms',
              }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = c.activeItem; e.currentTarget.style.color = c.fg; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c.secondary; } }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16, opacity: active ? 1 : 0.4, transition: 'opacity 120ms' }}>{item.icon}</span>
                <span>{item.name}</span>
              </div>
            );
          })}
        </div>
      ))}
    </aside>
  );

  const renderToc = () => {
    if (toc.length === 0) return null;
    return (
      <aside style={{ width: 180, minWidth: 180, flexShrink: 0, padding: '36px 0 24px', position: 'sticky', top: 0, alignSelf: 'flex-start', maxHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: c.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 16 }}>目录</div>
        {toc.map(item => {
          const active = activeTocSlug === item.slug;
          const indent = item.level === 3 ? 12 : item.level === 4 ? 24 : 0;
          return (
            <div key={item.slug} onClick={() => {
              const el = contentRef.current?.querySelector(`#${CSS.escape(item.slug)}`);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }} style={{
              padding: '3px 16px', marginLeft: indent,
              fontSize: 12, lineHeight: 1.6,
              color: active ? c.fg : c.muted,
              fontWeight: active ? 500 : 400,
              cursor: 'pointer',
              borderLeft: active ? `2px solid ${c.fg}` : '2px solid transparent',
              transition: 'color 120ms, border-color 120ms',
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = c.fg; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = c.muted; }}
            >{item.title}</div>
          );
        })}
      </aside>
    );
  };

  const [activeMultiTab, setActiveMultiTab] = React.useState(0);

  // 当文档切换时重置 tab
  React.useEffect(() => { setActiveMultiTab(0); }, [currentDoc]);

  const renderDocContent = () => {
    const multiDemos = docToMultiDemoMap[currentDoc];
    const demoFile = multiDemos ? multiDemos[activeMultiTab]?.file : docToDemoMap[currentDoc];
    const demoItem = demoFile ? demos.find(d => d.file === demoFile) : null;
    const DemoComponent = demoItem?.component;
    const sourceKey = demoFile ? `./${demoFile}.tsx` : '';
    const demoSource = sourceKey ? (sourceModules[sourceKey]?.default ?? '') : '';

    if (!DemoComponent && !multiDemos) {
      return <div style={{ color: isDark ? '#e6edf3' : '#1f2328', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    }

    // 在第一个 <h2 之前拆分，插入 Demo 预览
    const splitIndex = htmlContent.indexOf('<h2');
    const beforeProps = splitIndex > 0 ? htmlContent.substring(0, splitIndex) : htmlContent;
    const afterProps = splitIndex > 0 ? htmlContent.substring(splitIndex) : '';

    return (
      <>
        {/* 标题 + 描述部分 */}
        <div style={{ color: isDark ? '#e6edf3' : '#1f2328', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: beforeProps }} />

        {/* Demo 预览区域 */}
        <div style={{ margin: '24px 0 32px', borderRadius: 10, border: `1px solid ${c.border}`, overflow: 'hidden' }}>
          {/* 多 Demo Tab 切换 */}
          {multiDemos && (
            <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${c.border}`, background: isDark ? '#111' : '#f5f5f5' }}>
              {multiDemos.map((tab, idx) => (
                <button
                  key={tab.file}
                  onClick={() => setActiveMultiTab(idx)}
                  style={{
                    padding: '8px 16px', border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: idx === activeMultiTab ? 600 : 400,
                    color: idx === activeMultiTab ? c.fg : c.secondary,
                    background: idx === activeMultiTab ? (isDark ? '#1a1a1a' : '#fff') : 'transparent',
                    borderBottom: idx === activeMultiTab ? `2px solid ${c.fg}` : '2px solid transparent',
                    transition: 'all 120ms',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
          {/* 渲染区 */}
          <div style={{ height: 360, position: 'relative', background: isDark ? '#0a0a0a' : '#fafafa' }}>
            {DemoComponent ? (
              <React.Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: c.muted }}>加载中...</div>}>
                <DemoComponent />
              </React.Suspense>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: c.muted }}>暂无预览</div>
            )}
          </div>
          {/* 代码区 */}
          {demoSource && (
            <DemoCodeBlock code={demoSource} isDark={isDark} border={c.border} />
          )}
        </div>

        {/* Props 表格等后续内容 */}
        {afterProps && <div style={{ color: isDark ? '#e6edf3' : '#1f2328', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: afterProps }} />}
      </>
    );
  };

  const renderPrevNext = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${c.border}`, marginTop: 48, paddingTop: 24 }}>
      {prevDoc ? (
        <div onClick={() => navigateToDoc(prevDoc.id)} style={{ cursor: 'pointer', flex: '0 0 auto', maxWidth: '45%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${c.border}`, transition: 'background 120ms' }}
          onMouseEnter={e => e.currentTarget.style.background = c.activeItem}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <div style={{ fontSize: 11, color: c.muted, marginBottom: 2 }}>← 上一篇</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: c.fg }}>{prevDoc.name}</div>
        </div>
      ) : <div />}
      {nextDoc ? (
        <div onClick={() => navigateToDoc(nextDoc.id)} style={{ cursor: 'pointer', flex: '0 0 auto', maxWidth: '45%', textAlign: 'right', padding: '10px 14px', borderRadius: 8, border: `1px solid ${c.border}`, transition: 'background 120ms' }}
          onMouseEnter={e => e.currentTarget.style.background = c.activeItem}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <div style={{ fontSize: 11, color: c.muted, marginBottom: 2 }}>下一篇 →</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: c.fg }}>{nextDoc.name}</div>
        </div>
      ) : <div />}
    </div>
  );

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: c.bg, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <NavBar theme={theme} activePage="docs" onLogoClick={onNavigateHome} onNavigateDemos={onNavigateDemo} onNavigateDocs={() => {}} onNavigateDesign={onNavigateDesign} onNavigateBlock={onNavigateBlock} onToggleTheme={onToggleTheme} />

      {/* 移动端 sidebar toggle */}
      <div className="docs-mobile-toggle" style={{ display: 'none', padding: '8px 16px', borderBottom: `1px solid ${c.border}`, background: c.bg }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: `1px solid ${c.border}`, borderRadius: 6, padding: '6px 12px', color: c.fg, cursor: 'pointer', fontSize: 13 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{sidebarOpen ? 'menu_open' : 'menu'}</span>
          {sidebarOpen ? '关闭目录' : '打开目录'}
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', width: '100%', maxWidth: 1440, margin: '0 auto', padding: '0 48px' }}>
        {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} />}
        <div className="docs-sidebar" style={{ height: '100%', overflowY: 'auto', ...(sidebarOpen ? { position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50, background: c.sidebarBg } : {}) }}>
          {renderSidebar()}
        </div>

        <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }} ref={contentRef}>
          {content ? (
            <div style={{ display: 'flex', padding: '0 0 80px 0' }}>
              <div style={{ flex: 1, minWidth: 0, maxWidth: 832, padding: '48px 24px 0' }}>
                {renderDocContent()}
                {renderPrevNext()}
              </div>
              <div style={{ width: 160, flexShrink: 0 }} className="docs-toc-aside">
                {renderToc()}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: c.muted }}>
              <span className="material-symbols-outlined" style={{ fontSize: 52, marginBottom: 16, opacity: 0.5 }}>menu_book</span>
              <div style={{ fontSize: 16, fontWeight: 500 }}>选择左侧文档开始阅读</div>
              <div style={{ fontSize: 13, marginTop: 8, opacity: 0.6 }}>AiMapUI 组件文档</div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @media (max-width: 1200px) { .docs-toc-aside { display: none !important; } }
        @media (max-width: 768px) {
          .docs-mobile-toggle { display: flex !important; }
          .docs-sidebar aside { box-shadow: 2px 0 12px rgba(0,0,0,0.15); }
          .docs-sidebar:not([style*="position: fixed"]) aside { display: none; }
        }
        @media (min-width: 769px) { .docs-mobile-toggle { display: none !important; } }
      `}</style>
    </div>
  );
}