import type { ThemeOption } from '@antv/aimapui';

/**
 * 腾讯地图主题选项
 *
 * ⚠️ 腾讯地图样式需要先在腾讯位置服务后台
 *    https://lbs.qq.com/dev/console/personalStyles/
 * 创建并发布个性化样式后获得 styleId，再传入此处替换。
 *
 * 此处仅保留默认 style1 作为占位说明，切换其它需替换 value 为真实 styleId。
 */
export const TENCENT_THEME_OPTIONS: ThemeOption[] = [
  {
    text: '默认',
    value: 'style1',
    preview: 'linear-gradient(135deg, #e8e8e8 0%, #c8d8e8 40%, #a8c8d8 100%)',
  },
];
