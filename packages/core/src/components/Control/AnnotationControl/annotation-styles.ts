/**
 * AnnotationControl 默认样式配置
 */
import type { AnnotationStyleConfig } from './annotation-types';

export const DEFAULT_ANNOTATION_STYLES: Required<AnnotationStyleConfig> = {
  marker: { color: '#3f51b5', size: 32 },
  highlighter: { color: '#ffeb3b', width: 8, opacity: 0.5 },
  text: { color: '#1a1a2e', fontSize: 14, fontFamily: 'inherit' },
  note: { color: '#3f51b5', maxWidth: 240 },
  link: { color: '#3f51b5' },
  image: { maxWidth: 200, borderRadius: 8 },
  video: { maxWidth: 200 },
};

export const ANNOTATION_COLORS = [
  '#3f51b5', '#e53935', '#43a047', '#fb8c00', '#8e24aa',
  '#00897b', '#5c6bc0', '#d81b60',
];

export function mergeAnnotationStyles(
  custom?: AnnotationStyleConfig,
): Required<AnnotationStyleConfig> {
  if (!custom) return DEFAULT_ANNOTATION_STYLES;
  return {
    marker: { ...DEFAULT_ANNOTATION_STYLES.marker, ...custom.marker },
    highlighter: { ...DEFAULT_ANNOTATION_STYLES.highlighter, ...custom.highlighter },
    text: { ...DEFAULT_ANNOTATION_STYLES.text, ...custom.text },
    note: { ...DEFAULT_ANNOTATION_STYLES.note, ...custom.note },
    link: { ...DEFAULT_ANNOTATION_STYLES.link, ...custom.link },
    image: { ...DEFAULT_ANNOTATION_STYLES.image, ...custom.image },
    video: { ...DEFAULT_ANNOTATION_STYLES.video, ...custom.video },
  };
}
