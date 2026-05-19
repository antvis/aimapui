const AMAP_KEY = process.env.NEXT_PUBLIC_AMAP_KEY!

export function getAmapKey(): string {
  // 高德地图 Key 为可选配置,不强制要求
  // 未配置时使用高德地图默认配额
  return AMAP_KEY || ''
}

export function injectAmapKey(schema: any): any {
  const key = getAmapKey()
  
  // 如果没有配置 Key,则不注入
  if (!key) {
    return schema
  }

  return {
    ...schema,
    map: {
      ...schema.map,
      token: key
    }
  }
}
