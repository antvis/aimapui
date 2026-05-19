/**
 * 深度合并工具函数
 * 适用于合并 Schema 配置，如响应式覆盖
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DeepMergeable = Record<string, any>;

export function deepMerge<T extends DeepMergeable>(target: T, source: Partial<T>): T {
  if (!source) return target;

  const result = { ...target };

  for (const key of Object.keys(source) as (keyof T)[]) {
    const sourceVal = source[key];
    const targetVal = result[key];

    if (
      sourceVal !== null &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      targetVal !== null &&
      typeof targetVal === 'object' &&
      !Array.isArray(targetVal)
    ) {
      result[key] = deepMerge(
        targetVal as DeepMergeable,
        sourceVal as DeepMergeable,
      ) as T[keyof T];
    } else if (sourceVal !== undefined) {
      result[key] = sourceVal as T[keyof T];
    }
  }

  return result;
}

/**
 * 根据响应式配置合并 Schema
 */
export function applyResponsiveOverrides<T extends DeepMergeable>(
  base: T,
  overrides: Partial<T> | undefined,
): T {
  if (!overrides) return base;
  return deepMerge(base, overrides);
}