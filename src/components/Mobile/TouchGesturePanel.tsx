import React from 'react';
import { cx } from '../../utils/style';

export interface TouchGesturePanelProps {
  className?: string;
}

/**
 * 触摸手势面板 — 移动端增强
 * 未来可扩展为手势控制面板（如拖拽、旋转等手势切换）
 * 当前作为占位组件
 */
export function TouchGesturePanel({ className }: TouchGesturePanelProps) {
  // 预留：可在此实现触摸手势控制 UI
  return null;
}

export default TouchGesturePanel;