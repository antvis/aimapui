/**
 * AnnotationEditor — 标注内容编辑浮层
 *
 * 根据标注类型渲染不同的编辑表单：文字、笔记、链接、图片、视频。
 * 以 DOM Portal 方式挂载到地图 marker 容器上，跟随标注位置。
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { AnnotationFeature, AnnotationProperties } from './annotation-types';

// ============================================================
// Props
// ============================================================

interface AnnotationEditorProps {
  feature: AnnotationFeature | undefined;
  scene: any;
  mapsService: any;
  onSave: (id: string, properties: Partial<AnnotationProperties>) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  onUpload?: (file: File, type: 'image' | 'video') => Promise<string>;
}

// ============================================================
// 编辑器面板位置 Hook
// ============================================================

function useEditorPosition(
  feature: AnnotationFeature | undefined,
  mapsService: any,
  panelRef: React.RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!feature || !mapsService || !panelRef.current) return;

    const updatePos = () => {
      if (!panelRef.current || feature.properties.annotationType === 'highlighter') return;
      const coords = (feature.geometry as any).coordinates as [number, number];
      try {
        const pos = mapsService.lngLatToContainer(coords);
        if (!pos || isNaN(pos.x) || isNaN(pos.y)) return;

        // 找到对应标注 DOM 元素，获取实际高度以定位在其正上方
        const annotationEl = document.querySelector(`[data-annotation-id="${feature.id}"]`) as HTMLElement | null;
        const annotationHeight = annotationEl?.offsetHeight ?? 40;
        const gap = 8;
        const offsetY = annotationHeight + gap;

        panelRef.current.style.transform = `translate3d(${Math.round(pos.x)}px, ${Math.round(pos.y - offsetY)}px, 0) translate(-50%, -100%)`;
      } catch {
        // ignore
      }
    };

    updatePos();
    // 首帧后标注元素可能还没渲染，延迟再更新一次
    const raf = requestAnimationFrame(updatePos);
    mapsService.on('camerachange', updatePos);
    return () => {
      cancelAnimationFrame(raf);
      mapsService.off('camerachange', updatePos);
    };
  }, [feature, mapsService, panelRef]);
}

// ============================================================
// 子编辑器
// ============================================================

const TextEditor: React.FC<{
  feature: AnnotationFeature;
  onSave: (id: string, props: Partial<AnnotationProperties>) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
}> = ({ feature, onSave, onCancel, onDelete }) => {
  const [text, setText] = useState((feature.properties as any).text || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSave = () => {
    if (text.trim()) {
      onSave(feature.id, { text: text.trim() } as any);
    } else {
      onDelete(feature.id);
    }
    onCancel();
  };

  return (
    <div className="aimapui-annotation-editor-form">
      <input
        ref={inputRef}
        className="aimapui-annotation-editor-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel(); }}
        placeholder="输入文字..."
      />
      <div className="aimapui-annotation-editor-actions">
        <button className="aimapui-annotation-editor-btn aimapui-annotation-editor-btn--primary" onClick={handleSave}>确定</button>
        <button className="aimapui-annotation-editor-btn" onClick={onCancel}>取消</button>
      </div>
    </div>
  );
};

const NoteEditor: React.FC<{
  feature: AnnotationFeature;
  onSave: (id: string, props: Partial<AnnotationProperties>) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
}> = ({ feature, onSave, onCancel, onDelete }) => {
  const props = feature.properties as any;
  const [title, setTitle] = useState(props.title || '');
  const [body, setBody] = useState(props.body || '');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  const handleSave = () => {
    if (title.trim() || body.trim()) {
      onSave(feature.id, { title: title.trim(), body: body.trim() } as any);
    } else {
      onDelete(feature.id);
    }
    onCancel();
  };

  return (
    <div className="aimapui-annotation-editor-form">
      <input
        ref={titleRef}
        className="aimapui-annotation-editor-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="标题..."
        onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}
      />
      <textarea
        className="aimapui-annotation-editor-textarea"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="正文内容..."
        rows={4}
        onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}
      />
      <div className="aimapui-annotation-editor-actions">
        <button className="aimapui-annotation-editor-btn aimapui-annotation-editor-btn--primary" onClick={handleSave}>确定</button>
        <button className="aimapui-annotation-editor-btn" onClick={onCancel}>取消</button>
      </div>
    </div>
  );
};

const LinkEditor: React.FC<{
  feature: AnnotationFeature;
  onSave: (id: string, props: Partial<AnnotationProperties>) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
}> = ({ feature, onSave, onCancel, onDelete }) => {
  const props = feature.properties as any;
  const [url, setUrl] = useState(props.url || '');
  const [title, setTitle] = useState(props.title || '');
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => { urlRef.current?.focus(); }, []);

  const handleSave = () => {
    if (url.trim()) {
      onSave(feature.id, { url: url.trim(), title: title.trim() || url.trim() } as any);
    } else {
      onDelete(feature.id);
    }
    onCancel();
  };

  return (
    <div className="aimapui-annotation-editor-form">
      <input
        ref={urlRef}
        className="aimapui-annotation-editor-input"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel(); }}
      />
      <input
        className="aimapui-annotation-editor-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="链接标题（可选）..."
        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel(); }}
      />
      <div className="aimapui-annotation-editor-actions">
        <button className="aimapui-annotation-editor-btn aimapui-annotation-editor-btn--primary" onClick={handleSave}>确定</button>
        <button className="aimapui-annotation-editor-btn" onClick={onCancel}>取消</button>
      </div>
    </div>
  );
};

const ImageEditor: React.FC<{
  feature: AnnotationFeature;
  onSave: (id: string, props: Partial<AnnotationProperties>) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  onUpload?: (file: File, type: 'image' | 'video') => Promise<string>;
}> = ({ feature, onSave, onCancel, onDelete, onUpload }) => {
  const props = feature.properties as any;
  const [src, setSrc] = useState(props.src || '');
  const [alt, setAlt] = useState(props.alt || '');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // 自动弹出文件选择器（新建时 src 为空）
  useEffect(() => {
    if (!props.src && onUpload) {
      requestAnimationFrame(() => fileRef.current?.click());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      // 用户取消了文件选择 — 如果是新建的空图片则删除
      if (!props.src) {
        onDelete(feature.id);
        onCancel();
      }
      return;
    }
    if (!onUpload) return;

    setUploading(true);
    try {
      const url = await onUpload(file, 'image');
      setSrc(url);
      // 上传完成后自动保存并关闭编辑器
      onSave(feature.id, { src: url, alt: alt.trim() } as any);
      onCancel();
    } catch (err) {
      console.error('[AnnotationEditor] Image upload failed:', err);
    } finally {
      setUploading(false);
    }
  }, [onUpload, feature.id, alt, onSave, onCancel, onDelete, props.src]);

  const handleSave = () => {
    if (src.trim()) {
      onSave(feature.id, { src: src.trim(), alt: alt.trim() } as any);
    } else {
      onDelete(feature.id);
    }
    onCancel();
  };

  return (
    <div className="aimapui-annotation-editor-form">
      {onUpload && (
        <div className="aimapui-annotation-editor-upload">
          <button
            className="aimapui-annotation-editor-btn"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 4 }}>upload</span>
            {uploading ? '上传中...' : '选择图片'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
        </div>
      )}
      <input
        className="aimapui-annotation-editor-input"
        value={src}
        onChange={(e) => setSrc(e.target.value)}
        placeholder="或输入图片 URL..."
        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel(); }}
      />
      <input
        className="aimapui-annotation-editor-input"
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        placeholder="图片描述（可选）..."
        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel(); }}
      />
      {src && (
        <div className="aimapui-annotation-editor-preview">
          <img src={src} alt={alt} style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 4 }} />
        </div>
      )}
      <div className="aimapui-annotation-editor-actions">
        <button className="aimapui-annotation-editor-btn aimapui-annotation-editor-btn--primary" onClick={handleSave}>确定</button>
        <button className="aimapui-annotation-editor-btn" onClick={onCancel}>取消</button>
      </div>
    </div>
  );
};

const VideoEditor: React.FC<{
  feature: AnnotationFeature;
  onSave: (id: string, props: Partial<AnnotationProperties>) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
}> = ({ feature, onSave, onCancel, onDelete }) => {
  const props = feature.properties as any;
  const [url, setUrl] = useState(props.url || '');
  const [title, setTitle] = useState(props.title || '');
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => { urlRef.current?.focus(); }, []);

  const handleSave = () => {
    if (url.trim()) {
      onSave(feature.id, { url: url.trim(), title: title.trim() } as any);
    } else {
      onDelete(feature.id);
    }
    onCancel();
  };

  return (
    <div className="aimapui-annotation-editor-form">
      <input
        ref={urlRef}
        className="aimapui-annotation-editor-input"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="视频 URL..."
        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel(); }}
      />
      <input
        className="aimapui-annotation-editor-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="视频标题（可选）..."
        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel(); }}
      />
      <div className="aimapui-annotation-editor-actions">
        <button className="aimapui-annotation-editor-btn aimapui-annotation-editor-btn--primary" onClick={handleSave}>确定</button>
        <button className="aimapui-annotation-editor-btn" onClick={onCancel}>取消</button>
      </div>
    </div>
  );
};

// ============================================================
// AnnotationEditor Component
// ============================================================

export const AnnotationEditor: React.FC<AnnotationEditorProps> = ({
  feature,
  scene,
  mapsService,
  onSave,
  onCancel,
  onDelete,
  onUpload,
}) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEditorPosition(feature, mapsService, panelRef);

  // 挂载 DOM 容器到地图
  useEffect(() => {
    if (!mapsService) return;

    const markerContainer = mapsService.getMarkerContainer?.();
    if (!markerContainer) return;

    const container = document.createElement('div');
    container.className = 'aimapui-annotation-editor-container';
    container.style.cssText = 'position:absolute;top:0;left:0;width:0;height:0;z-index:20;pointer-events:none;';
    markerContainer.appendChild(container);
    containerRef.current = container;

    return () => {
      container.parentElement?.removeChild(container);
      containerRef.current = null;
    };
  }, [mapsService]);

  if (!feature || !containerRef.current) return null;

  const { annotationType } = feature.properties;

  // marker 类型无需编辑器
  if (annotationType === 'marker' || annotationType === 'highlighter') return null;

  const editorContent = (
    <div
      ref={panelRef}
      className="aimapui-annotation-editor"
      style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'auto' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="aimapui-annotation-editor-header">
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
          {annotationType === 'text' ? 'title' : annotationType === 'note' ? 'sticky_note_2' :
           annotationType === 'link' ? 'link' : annotationType === 'image' ? 'image' : 'videocam'}
        </span>
        <span style={{ marginLeft: 6, fontSize: 12 }}>
          {annotationType === 'text' ? '编辑文字' : annotationType === 'note' ? '编辑笔记' :
           annotationType === 'link' ? '编辑链接' : annotationType === 'image' ? '编辑图片' : '编辑视频'}
        </span>
      </div>

      {annotationType === 'text' && <TextEditor feature={feature} onSave={onSave} onCancel={onCancel} onDelete={onDelete} />}
      {annotationType === 'note' && <NoteEditor feature={feature} onSave={onSave} onCancel={onCancel} onDelete={onDelete} />}
      {annotationType === 'link' && <LinkEditor feature={feature} onSave={onSave} onCancel={onCancel} onDelete={onDelete} />}
      {annotationType === 'image' && <ImageEditor feature={feature} onSave={onSave} onCancel={onCancel} onDelete={onDelete} onUpload={onUpload} />}
      {annotationType === 'video' && <VideoEditor feature={feature} onSave={onSave} onCancel={onCancel} onDelete={onDelete} />}
    </div>
  );

  return createPortal(editorContent, containerRef.current);
};
