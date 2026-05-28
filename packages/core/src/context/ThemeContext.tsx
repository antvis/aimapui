import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export type MapTheme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  /** 当前解析后的实际主题（light 或 dark） */
  resolvedTheme: 'light' | 'dark';
  /** 用户设置的主题偏好 */
  theme: MapTheme;
  /** 设置主题 */
  setTheme: (theme: MapTheme) => void;
  /** 切换亮/暗 */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  resolvedTheme: 'light',
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

export interface ThemeProviderProps {
  /** 默认主题，默认 'light' */
  defaultTheme?: MapTheme;
  /** 挂载 data-theme 属性的目标元素选择器，默认挂载到最近的 .aimapui-container 或 :root */
  target?: 'root' | 'container';
  children: React.ReactNode;
}

/**
 * 地图主题 Provider
 *
 * 通过 CSS 变量 + data-theme 属性实现亮/暗主题切换。
 * - `light`: 亮色主题（默认）
 * - `dark`: 暗色主题
 * - `system`: 跟随系统 prefers-color-scheme
 */
export function ThemeProvider({
  defaultTheme = 'light',
  target = 'container',
  children,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<MapTheme>(defaultTheme);
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>('light');

  // 监听系统主题变化
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPreference(mql.matches ? 'dark' : 'light');

    const handler = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const resolvedTheme: 'light' | 'dark' = theme === 'system' ? systemPreference : theme;

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      if (current === 'system') return systemPreference === 'light' ? 'dark' : 'light';
      return current === 'light' ? 'dark' : 'light';
    });
  }, [systemPreference]);

  // 如果 target 是 root，挂载到 documentElement
  useEffect(() => {
    if (target === 'root') {
      document.documentElement.setAttribute('data-theme', resolvedTheme);
    }
  }, [resolvedTheme, target]);

  const value = useMemo<ThemeContextValue>(() => ({
    resolvedTheme,
    theme,
    setTheme,
    toggleTheme,
  }), [resolvedTheme, theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {target === 'container' ? (
        <div data-theme={resolvedTheme} style={{ display: 'contents' }}>
          {children}
        </div>
      ) : (
        children
      )}
    </ThemeContext.Provider>
  );
}

/**
 * 获取当前主题信息
 */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

export { ThemeContext };
