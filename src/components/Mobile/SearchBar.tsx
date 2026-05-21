import React, { useState, useCallback } from 'react';

export interface SearchBarProps {
  /** 占位文本 */
  placeholder?: string;
  /** 搜索值变化回调 */
  onSearch?: (value: string) => void;
  /** 筛选按钮点击回调 */
  onFilter?: () => void;
  /** 自定义样式类名 */
  className?: string;
  /** 右侧自定义操作区域 */
  trailing?: React.ReactNode;
}

/**
 * 移动端浮动搜索框组件
 *
 * Material Design 3 毛玻璃风格，固定在顶部
 *
 * ```tsx
 * <SearchBar placeholder="搜索地点..." onSearch={(v) => console.log(v)} />
 * ```
 */
export function SearchBar({
  placeholder = '搜索地点...',
  onSearch,
  onFilter,
  className,
  trailing,
}: SearchBarProps) {
  const [value, setValue] = useState('');

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setValue(newValue);
      onSearch?.(newValue);
    },
    [onSearch],
  );

  const handleClear = useCallback(() => {
    setValue('');
    onSearch?.('');
  }, [onSearch]);

  return (
    <div
      className={`glass-panel ${className ?? ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        borderRadius: 16,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(195, 198, 215, 0.3)',
      }}
    >
      {/* 搜索图标 */}
      <span
        className="material-symbols-outlined"
        style={{ color: 'var(--color-primary, #004ac6)', marginRight: 12, fontSize: 22 }}
      >
        search
      </span>

      {/* 输入框 */}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        style={{
          flex: 1,
          border: 'none',
          background: 'transparent',
          outline: 'none',
          fontSize: 14,
          lineHeight: '20px',
          color: 'var(--color-on-surface, #121c2a)',
        }}
      />

      {/* 清除按钮 */}
      {value && (
        <button
          onClick={handleClear}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 18, color: 'var(--color-on-surface-variant, #434655)' }}
          >
            close
          </span>
        </button>
      )}

      {/* 筛选按钮 */}
      {onFilter && (
        <button
          onClick={onFilter}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 4,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 22, color: 'var(--color-on-surface-variant, #434655)' }}
          >
            tune
          </span>
        </button>
      )}

      {/* 自定义尾部 */}
      {trailing}
    </div>
  );
}

export default SearchBar;
