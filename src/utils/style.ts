import clsx from 'clsx';

/**
 * 合并 className（基于 clsx）
 */
export function cx(...inputs: (string | undefined | null | false)[]): string {
  return clsx(inputs);
}

/**
 * 将十六进制颜色转为 RGBA
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const match = hex.replace('#', '').match(/.{2}/g);
  if (!match || match.length < 3) return hex;
  const [r, g, b] = match.map((v) => parseInt(v, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}