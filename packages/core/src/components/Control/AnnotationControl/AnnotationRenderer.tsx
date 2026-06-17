/**
 * AnnotationRenderer — 标注 DOM Overlay 渲染器
 *
 * 将各类型标注渲染为地图上的 DOM 元素，通过 camerachange 事件批量同步位置。
 */
import React, { useEffect, useRef, useCallback } from 'react';
import type { AnnotationFeature, AnnotationStyleConfig, AnnotationProperties } from './annotation-types';
import { mergeAnnotationStyles } from './annotation-styles';

// ============================================================
// Props
// ============================================================

interface AnnotationRendererProps {
  features: AnnotationFeature[];
  selectedId: string | null;
  editingId: string | null;
  scene: any;
  mapsService: any;
  styles?: AnnotationStyleConfig;
  onSelect: (id: string | null) => void;
  onDoubleClick: (id: string) => void;
  onMove: (id: string, lng: number, lat: number) => void;
  /** 直接在地图上完成编辑(text/link) */
  onInlineCommit?: (id: string, properties: Partial<AnnotationProperties>) => void;
  /** 取消内联编辑 */
  onInlineCancel?: (id: string) => void;
  /** 图片缩放 */
  onResize?: (id: string, width: number, height: number) => void;
}

// ============================================================
// 锚点 transform — 不同类型用不同锚点对齐
//   marker: 底部居中 (图钉尖对准坐标)
//   其他:   中心对齐
// ============================================================

const ANCHOR_TRANSFORM: Record<string, string> = {
  marker: 'translate(-50%, -100%)',
  text: 'translate(-50%, -50%)',
  note: 'translate(-50%, -100%)',
  link: 'translate(-50%, -100%)',
  image: 'translate(-50%, -100%)',
  video: 'translate(-50%, -100%)',
};

// ============================================================
// 标注内容渲染
// ============================================================

function renderAnnotationContent(
  feature: AnnotationFeature,
  styles: ReturnType<typeof mergeAnnotationStyles>,
): string {
  const { annotationType } = feature.properties;

  switch (annotationType) {
    case 'marker': {
      const props = feature.properties;
      const color = props.color || styles.marker.color;
      return `
        <div class="aimapui-annotation-marker" style="color:${color}">
          <span class="material-symbols-outlined" style="font-size:${styles.marker.size}px;color:${color}">location_on</span>
          ${props.label ? `<div class="aimapui-annotation-marker-label">${escapeHtml(props.label)}</div>` : ''}
        </div>
      `;
    }
    case 'text': {
      const props = feature.properties;
      const color = props.color || styles.text.color;
      const fontSize = props.fontSize || styles.text.fontSize;
      const text = props.text || '(空文字)';
      return `
        <div class="aimapui-annotation-text" style="color:${color};font-size:${fontSize}px">
          ${escapeHtml(text)}
        </div>
      `;
    }
    case 'note': {
      const props = feature.properties;
      const color = props.color || styles.note.color;
      return `
        <div class="aimapui-annotation-note" style="border-left-color:${color};max-width:${styles.note.maxWidth}px">
          <div class="aimapui-annotation-note-title">${escapeHtml(props.title || '无标题')}</div>
          ${props.body ? `<div class="aimapui-annotation-note-body">${escapeHtml(props.body)}</div>` : ''}
        </div>
      `;
    }
    case 'link': {
      const props = feature.properties;
      const color = props.color || styles.link.color;
      return `
        <div class="aimapui-annotation-link" style="--link-color:${color}">
          <span class="material-symbols-outlined" style="font-size:16px">link</span>
          <span class="aimapui-annotation-link-title">${escapeHtml(props.title || props.url || '未设置链接')}</span>
        </div>
      `;
    }
    case 'image': {
      const props = feature.properties;
      const w = props.width || styles.image.maxWidth;
      const h = props.height;
      if (!props.src) {
        return `
          <div class="aimapui-annotation-image-placeholder" style="width:80px;height:60px">
            <span class="material-symbols-outlined" style="font-size:32px;color:#999">image</span>
          </div>
        `;
      }
      return `
        <div class="aimapui-annotation-image" style="width:${w}px"
             data-annotation-image-id="${(feature as any).id}">
          <img src="${escapeAttr(props.src)}" alt="${escapeAttr(props.alt || '')}"
               style="border-radius:${styles.image.borderRadius}px;width:100%;display:block;${h ? `height:${h}px;object-fit:cover;` : ''}" />
          <div class="aimapui-annotation-image-resize-handle" data-resize-id="${(feature as any).id}"></div>
        </div>
      `;
    }
    case 'video': {
      const props = feature.properties;
      return `
        <div class="aimapui-annotation-video" style="max-width:${styles.video.maxWidth}px">
          ${props.thumbnailUrl
            ? `<img src="${escapeAttr(props.thumbnailUrl)}" class="aimapui-annotation-video-thumb" />`
            : `<div class="aimapui-annotation-video-placeholder"><span class="material-symbols-outlined" style="font-size:32px">videocam</span></div>`
          }
          <div class="aimapui-annotation-video-play">
            <span class="material-symbols-outlined">play_arrow</span>
          </div>
          ${props.title ? `<div class="aimapui-annotation-video-title">${escapeHtml(props.title)}</div>` : ''}
        </div>
      `;
    }
    default:
      return '';
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ============================================================
// AnnotationRenderer Component
// ============================================================

export const AnnotationRenderer: React.FC<AnnotationRendererProps> = ({
  features,
  selectedId,
  editingId,
  scene,
  mapsService,
  styles: customStyles,
  onSelect,
  onDoubleClick,
  onMove,
  onInlineCommit,
  onInlineCancel,
  onResize,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const elementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const dragStateRef = useRef<{
    id: string;
    startLng: number;
    startLat: number;
    startX: number;
    startY: number;
    isDragging: boolean;
  } | null>(null);
  const resizeStateRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  const styles = mergeAnnotationStyles(customStyles);

  // 批量更新所有标注位置
  const updateAllPositions = useCallback(() => {
    if (!mapsService) return;
    const elements = elementsRef.current;

    for (const feature of features) {
      if (feature.properties.annotationType === 'highlighter') continue;
      const el = elements.get(feature.id);
      if (!el) continue;

      const coords = (feature.geometry as any).coordinates as [number, number];
      try {
        const pos = mapsService.lngLatToContainer(coords);
        if (!pos || isNaN(pos.x) || isNaN(pos.y)) continue;

        const anchor = ANCHOR_TRANSFORM[feature.properties.annotationType] || 'translate(-50%, -100%)';
        const x = Math.round(pos.x);
        const y = Math.round(pos.y);
        el.style.transform = `translate3d(${x}px, ${y}px, 0) ${anchor}`;
      } catch {
        // ignore
      }
    }
  }, [features, mapsService]);

  // 注册 camerachange 事件
  useEffect(() => {
    if (!mapsService) return;

    const handleCameraChange = () => updateAllPositions();
    mapsService.on('camerachange', handleCameraChange);

    return () => {
      mapsService.off('camerachange', handleCameraChange);
    };
  }, [mapsService, updateAllPositions]);

  // 同步 DOM 元素
  useEffect(() => {
    if (!mapsService) return;

    const markerContainer = mapsService.getMarkerContainer?.();
    if (!markerContainer) return;

    // 确保我们的容器存在
    if (!containerRef.current) {
      const container = document.createElement('div');
      container.className = 'aimapui-annotation-container';
      container.style.cssText = 'position:absolute;top:0;left:0;width:0;height:0;z-index:10;';
      markerContainer.appendChild(container);
      containerRef.current = container;
    }

    const container = containerRef.current;
    const prevElements = elementsRef.current;
    const nextElements = new Map<string, HTMLDivElement>();

    // 只渲染非 highlighter 的标注
    const pointFeatures = features.filter((f) => f.properties.annotationType !== 'highlighter');

    for (const feature of pointFeatures) {
      let el = prevElements.get(feature.id);

      if (!el) {
        // 创建新元素
        el = document.createElement('div');
        el.className = 'aimapui-annotation-item';
        el.style.cssText = 'position:absolute;left:0;top:0;pointer-events:auto;cursor:pointer;user-select:none;';
        el.dataset.annotationId = feature.id;

        // 事件绑定
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelect(feature.id);
        });
        el.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          onDoubleClick(feature.id);
        });
        el.addEventListener('mousedown', (e) => {
          if (e.button !== 0) return;
          const coords = (feature.geometry as any).coordinates as [number, number];
          dragStateRef.current = {
            id: feature.id,
            startLng: coords[0],
            startLat: coords[1],
            startX: e.clientX,
            startY: e.clientY,
            isDragging: false,
          };
        });

        container.appendChild(el);
      }

      // 更新内容 — text/link 编辑态用 inline input
      const isInlineEditing = feature.id === editingId &&
        (feature.properties.annotationType === 'text' || feature.properties.annotationType === 'link');

      if (isInlineEditing) {
        const aType = feature.properties.annotationType;
        const currentValue = aType === 'text'
          ? (feature.properties as any).text || ''
          : (feature.properties as any).url || '';
        const placeholder = aType === 'text' ? 'Add text...' : 'https://...';
        const color = feature.properties.color || (aType === 'text' ? styles.text.color : styles.link.color);
        const fontSize = aType === 'text' ? ((feature.properties as any).fontSize || styles.text.fontSize) : 14;

        el.innerHTML = `
          <input
            class="aimapui-annotation-inline-input"
            type="text"
            value="${escapeAttr(currentValue)}"
            placeholder="${placeholder}"
            style="color:${color};font-size:${fontSize}px"
            data-annotation-inline="${feature.id}"
            data-annotation-type="${aType}"
          />
        `;

        // 聚焦 input
        const input = el.querySelector('input') as HTMLInputElement | null;
        if (input && document.activeElement !== input) {
          requestAnimationFrame(() => { input?.focus(); input?.select(); });
        }

        // 绑定事件（只绑一次，通过 dataset 标记）
        if (!el.dataset.inlineBound) {
          el.dataset.inlineBound = '1';
          el.addEventListener('keydown', (e: Event) => {
            const ke = e as KeyboardEvent;
            const inp = ke.target as HTMLInputElement;
            if (!inp?.dataset?.annotationInline) return;

            if (ke.key === 'Enter') {
              ke.preventDefault();
              ke.stopPropagation();
              const fid = inp.dataset.annotationInline!;
              const ftype = inp.dataset.annotationType;
              const val = inp.value.trim();
              if (val) {
                const props = ftype === 'text'
                  ? { text: val } as any
                  : { url: val, title: val } as any;
                onInlineCommit?.(fid, props);
              } else {
                onInlineCancel?.(fid);
              }
            } else if (ke.key === 'Escape') {
              ke.preventDefault();
              ke.stopPropagation();
              const fid = inp.dataset.annotationInline!;
              onInlineCancel?.(fid);
            }
          });
          el.addEventListener('blur', (e: Event) => {
            const inp = e.target as HTMLInputElement;
            if (!inp?.dataset?.annotationInline) return;
            const fid = inp.dataset.annotationInline!;
            const ftype = inp.dataset.annotationType;
            const val = inp.value.trim();
            // 延迟处理 blur，避免和 Enter 事件冲突
            setTimeout(() => {
              if (val) {
                const props = ftype === 'text'
                  ? { text: val } as any
                  : { url: val, title: val } as any;
                onInlineCommit?.(fid, props);
              } else {
                onInlineCancel?.(fid);
              }
            }, 100);
          }, true);
        }
      } else {
        el.dataset.inlineBound = '';
        el.innerHTML = renderAnnotationContent(feature, styles);
      }

      // 绑定图片 resize handle
      const resizeHandle = el.querySelector('[data-resize-id]') as HTMLElement | null;
      if (resizeHandle) {
        resizeHandle.onmousedown = (e: MouseEvent) => {
          e.stopPropagation();
          e.preventDefault();
          const imgContainer = resizeHandle.parentElement;
          resizeStateRef.current = {
            id: feature.id,
            startX: e.clientX,
            startY: e.clientY,
            startWidth: imgContainer?.offsetWidth ?? 200,
            startHeight: imgContainer?.offsetHeight ?? 150,
          };
        };
      }

      // 选中状态
      if (feature.id === selectedId) {
        el.classList.add('aimapui-annotation-item--selected');
      } else {
        el.classList.remove('aimapui-annotation-item--selected');
      }

      if (feature.id === editingId) {
        el.classList.add('aimapui-annotation-item--editing');
      } else {
        el.classList.remove('aimapui-annotation-item--editing');
      }

      nextElements.set(feature.id, el);
      prevElements.delete(feature.id);
    }

    // 删除多余的旧元素
    for (const [, el] of prevElements) {
      container.removeChild(el);
    }

    elementsRef.current = nextElements;

    // 立即更新位置
    updateAllPositions();
  }, [features, selectedId, editingId, mapsService, styles, onSelect, onDoubleClick, updateAllPositions]);

  // 拖拽 + 缩放处理（document-level mousemove/mouseup）
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 图片缩放
      const resize = resizeStateRef.current;
      if (resize) {
        const dx = e.clientX - resize.startX;
        const dy = e.clientY - resize.startY;
        const newWidth = Math.max(60, resize.startWidth + dx);
        const newHeight = Math.max(40, resize.startHeight + dy);

        // 实时更新 DOM 尺寸（不等待 React 重渲染）
        const imgContainer = document.querySelector(`[data-annotation-image-id="${resize.id}"]`) as HTMLElement | null;
        if (imgContainer) {
          imgContainer.style.width = `${newWidth}px`;
          const img = imgContainer.querySelector('img') as HTMLElement | null;
          if (img) {
            img.style.height = `${newHeight}px`;
            img.style.objectFit = 'cover';
          }
        }
        return;
      }

      // 拖拽移动
      const drag = dragStateRef.current;
      if (!drag || !mapsService) return;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      if (!drag.isDragging && Math.abs(dx) + Math.abs(dy) < 4) return;

      drag.isDragging = true;

      try {
        const mapContainer = mapsService.getMapContainer?.() as HTMLElement | null;
        const rect = mapContainer?.getBoundingClientRect();
        const containerX = rect ? e.clientX - rect.left : e.clientX;
        const containerY = rect ? e.clientY - rect.top : e.clientY;
        const lngLat = mapsService.containerToLngLat({ x: containerX, y: containerY });
        if (lngLat) {
          onMove(drag.id, lngLat.lng, lngLat.lat);
        }
      } catch {
        // ignore
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      // 完成缩放 — 提交最终尺寸
      const resize = resizeStateRef.current;
      if (resize && onResize) {
        const dx = e.clientX - resize.startX;
        const dy = e.clientY - resize.startY;
        const newWidth = Math.max(60, resize.startWidth + dx);
        const newHeight = Math.max(40, resize.startHeight + dy);
        onResize(resize.id, newWidth, newHeight);
      }
      resizeStateRef.current = null;
      dragStateRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mapsService, onMove, onResize]);

  // 清理
  useEffect(() => {
    return () => {
      if (containerRef.current) {
        containerRef.current.parentElement?.removeChild(containerRef.current);
        containerRef.current = null;
      }
      elementsRef.current.clear();
    };
  }, []);

  return null;
};
