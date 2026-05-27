import React, { useMemo } from 'react';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);

interface SourceCodePanelProps {
  sourceCode: string;
  fileName: string;
  isDark: boolean;
  onClose: () => void;
}

/** 将源码高亮为 HTML */
function highlightCode(code: string): string {
  try {
    const result = hljs.highlight(code, { language: 'typescript' });
    return result.value;
  } catch {
    return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

/** hljs token 颜色 — 浅色 GitHub / 暗色 GitHub Dark Dimmed */
const LIGHT_THEME = `
.hljs-keyword,.hljs-selector-tag,.hljs-literal,.hljs-section,.hljs-link{color:#cf222e}
.hljs-string,.hljs-attr,.hljs-addition,.hljs-attribute{color:#0a3069}
.hljs-template-variable,.hljs-type,.hljs-selector-class,.hljs-selector-attr,.hljs-selector-pseudo,.hljs-number{color:#8250df}
.hljs-symbol,.hljs-bullet,.hljs-meta,.hljs-selector-id{color:#0550ae}
.hljs-built_in,.hljs-title,.hljs-class{color:#8250df}
.hljs-comment,.hljs-quote{color:#6e7781;font-style:italic}
.hljs-name,.hljs-tag{color:#116329}
.hljs-subst{color:#24292f}
.hljs-regexp{color:#0550ae}
.hljs-title.function_{color:#8250df}
.hljs-params{color:#24292f}
`;

const DARK_THEME = `
.hljs-keyword,.hljs-selector-tag,.hljs-literal,.hljs-section,.hljs-link{color:#f47067}
.hljs-string,.hljs-attr,.hljs-addition,.hljs-attribute{color:#96d0ff}
.hljs-template-variable,.hljs-type,.hljs-selector-class,.hljs-selector-attr,.hljs-selector-pseudo,.hljs-number{color:#6cb6ff}
.hljs-symbol,.hljs-bullet,.hljs-meta,.hljs-selector-id{color:#6cb6ff}
.hljs-built_in,.hljs-title,.hljs-class{color:#dcbdfb}
.hljs-comment,.hljs-quote{color:#768390;font-style:italic}
.hljs-name,.hljs-tag{color:#8ddb8c}
.hljs-subst{color:#adbac7}
.hljs-regexp{color:#96d0ff}
.hljs-title.function_{color:#dcbdfb}
.hljs-params{color:#adbac7}
`;

export function SourceCodePanel({ sourceCode, fileName, isDark, onClose }: SourceCodePanelProps) {
  const highlightedLines = useMemo(() => {
    const highlighted = highlightCode(sourceCode);
    return highlighted.split('\n');
  }, [sourceCode]);

  const colors = isDark
    ? { bg: '#0d1117', headerBg: '#161b22', border: 'rgba(255,255,255,0.06)', text: '#e6edf3', lineNum: '#484f58', shadow: '-4px 0 24px rgba(0,0,0,0.4)' }
    : { bg: '#ffffff', headerBg: '#f6f8fa', border: 'rgba(0,0,0,0.08)', text: '#1f2328', lineNum: '#8b949e', shadow: '-4px 0 24px rgba(0,0,0,0.08)' };

  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        width: 660,
        zIndex: 10000,
        background: colors.bg,
        borderLeft: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: colors.shadow,
      }}
    >
      {/* 注入当前主题的 hljs token 颜色 */}
      <style>{isDark ? DARK_THEME : LIGHT_THEME}</style>
      {/* 顶部标题栏 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          background: colors.headerBg,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: colors.text }}>code</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: colors.text, letterSpacing: 0.3 }}>{fileName}</span>
        <div style={{ flex: 1 }} />
        <button
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 24, height: 24, borderRadius: 6, border: 'none',
            background: 'transparent', color: colors.lineNum, cursor: 'pointer',
            transition: 'all 150ms',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = colors.text; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = colors.lineNum; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
        </button>
      </div>

      {/* 代码内容区 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <pre
          style={{
            margin: 0,
            padding: '16px 0',
            fontSize: 12,
            lineHeight: 1.7,
            fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', Menlo, Monaco, monospace",
            color: colors.text,
            whiteSpace: 'pre',
            tabSize: 2,
          }}
        >
          {highlightedLines.map((line, i) => (
            <div key={i} style={{ display: 'flex' }}>
              <span
                style={{
                  display: 'inline-block',
                  minWidth: 48,
                  paddingRight: 16,
                  textAlign: 'right',
                  color: colors.lineNum,
                  userSelect: 'none',
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <span
                style={{ flex: 1, paddingRight: 20 }}
                dangerouslySetInnerHTML={{ __html: line || ' ' }}
              />
            </div>
          ))}
        </pre>
      </div>

      {/* 底部复制按钮 */}
      <div
        style={{
          padding: '10px 16px',
          borderTop: `1px solid ${colors.border}`,
          background: colors.headerBg,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <button
          onClick={() => {
            navigator.clipboard.writeText(sourceCode).catch(() => {});
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 6, border: 'none',
            background: isDark ? '#21262d' : '#e8e8e8',
            color: colors.text, cursor: 'pointer',
            fontSize: 11, fontWeight: 500, transition: 'all 150ms',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? '#30363d' : '#d8d8d8'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = isDark ? '#21262d' : '#e8e8e8'; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>content_copy</span>
          复制代码
        </button>
      </div>
    </div>
  );
}

/** 源码切换按钮 */
export function SourceCodeToggle({
  showPanel,
  isDark,
  onClick,
}: {
  showPanel: boolean;
  isDark: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        right: showPanel ? 660 : 0,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10001,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        width: 28,
        padding: '12px 0',
        borderRadius: '6px 0 0 6px',
        border: 'none',
        background: isDark ? '#1a1a1a' : '#f0f0f0',
        color: isDark ? '#ccc' : '#444',
        cursor: 'pointer',
        transition: 'all 200ms ease',
        boxShadow: isDark ? '-2px 0 8px rgba(0,0,0,0.3)' : '-2px 0 8px rgba(0,0,0,0.06)',
        writingMode: 'vertical-rl',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isDark ? '#333' : '#e0e0e0';
        e.currentTarget.style.color = isDark ? '#fff' : '#000';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isDark ? '#1a1a1a' : '#f0f0f0';
        e.currentTarget.style.color = isDark ? '#ccc' : '#444';
      }}
      title={showPanel ? '收起源码' : '展开源码'}
    >
      <span
        className="pulse-hint"
        style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', writingMode: 'vertical-rl' }}
      >
        查看源码
      </span>
    </button>
  );
}
