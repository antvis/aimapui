import React, { useCallback, useState } from 'react';
import { Popup } from '@antv/aimapui';
import type { LayerEventPayload } from '@antv/aimapui';

/**
 * 复合图层 demo 用的统一交互工具：
 * - hoverTooltipEvents：传给"支持 events 透传"的复合图层（FillLayer / BubbleLayer
 *   / HexagonLayer / H3Layer / GlyphLayer / IconLayer 等），开启 hover Tooltip。
 * - useClickPopup：统一 click → Popup，renderContent 返回 HTML 字符串。
 *
 * 两者可同时挂在一个图层上（hover 出 Tooltip、click 弹 Popup），互不干扰。
 */

export type LayerHoverEvents = {
  enablePopup: true;
  popupTrigger: 'hover';
  popupFields?: string[];
  popupTemplate?: string;
};

/** hover Tooltip 事件配置：不传 template 时由 SchemaLayer 按字段渲染表格。 */
export function hoverTooltipEvents(
  fields?: string[],
  template?: string,
): LayerHoverEvents {
  const base: LayerHoverEvents = { enablePopup: true, popupTrigger: 'hover' };
  if (fields && fields.length > 0) base.popupFields = fields;
  if (template) base.popupTemplate = template;
  return base;
}

interface SelectedFeature {
  lng: number;
  lat: number;
  feature: Record<string, unknown>;
}

/** 统一 click → Popup。renderContent 接收 feature，返回 HTML 字符串。 */
export function useClickPopup(
  renderContent: (feature: Record<string, unknown>) => string,
) {
  const [sel, setSel] = useState<SelectedFeature | null>(null);

  const onClick = useCallback((payload: LayerEventPayload) => {
    if (!payload.feature) return;
    setSel({ lng: payload.lng, lat: payload.lat, feature: payload.feature });
  }, []);

  const popupNode = sel ? (
    <Popup
      longitude={sel.lng}
      latitude={sel.lat}
      content={renderContent(sel.feature)}
      closeButton
      size="compact"
      onClose={() => setSel(null)}
    />
  ) : null;

  return { onClick, popupNode };
}

/** 常用 Popup 内容：标题 + 字段表格（自动跳过缺失字段）。 */
export function popupContentWithFields(
  feature: Record<string, unknown>,
  titleField?: string,
  fields?: Array<{ label: string; field: string }>,
): string {
  const title = titleField ? String(feature[titleField] ?? '') : '';
  const rows = (fields ?? [])
    .filter((f) => feature[f.field] !== undefined && feature[f.field] !== null && feature[f.field] !== '')
    .map(
      (f) =>
        `<tr><td style="padding-right:10px;color:#64748b">${f.label}</td><td style="font-weight:600">${feature[f.field]}</td></tr>`,
    )
    .join('');
  return `<div style="min-width:120px">
    ${title ? `<div style="font-weight:700;font-size:13px;margin-bottom:6px">${title}</div>` : ''}
    ${rows ? `<table style="font-size:12px;line-height:1.6">${rows}</table>` : ''}
  </div>`;
}
