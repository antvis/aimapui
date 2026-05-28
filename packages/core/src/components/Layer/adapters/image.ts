import type { LayerSchema } from '../../../schema/types';

/**
 * Image 图层适配器
 */
export function adaptImageLayer(schema: LayerSchema) {
  return {
    type: 'ImageLayer' as const,
    sourceConfig: {
      data: schema.source,
      options: {
        parser:
          schema.sourceConfig?.parser
          ?? (schema.sourceType === 'image'
            ? { type: 'image' }
            : undefined),
      },
    },
    visual: {
      color: undefined,
      size: undefined,
      shape: undefined,
      style: schema.style ? { ...schema.style } : undefined,
    },
    schema,
  };
}
