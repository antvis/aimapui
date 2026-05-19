/**
 * JSON Schema 导出 — 供 AI / LLM 理解 Schema 结构
 * 可用于验证、自动补全、文档生成等场景
 */
export const AimapJSONSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'AimapSchema',
  description: 'Schema-driven React map visualization component configuration',
  type: 'object',
  required: ['map', 'layers'],
  properties: {
    map: {
      type: 'object',
      required: ['basemap'],
      properties: {
        basemap: {
          type: 'string',
          enum: ['gaode', 'mapbox', 'tianditu', 'tencent', 'baidu', 'map'],
          description: 'Map base tile provider',
        },
        token: { type: 'string', description: 'API token for the map service' },
        style: {
          type: 'string',
          description: 'Map style preset (light/dark/normal/darkblue/satellite) or custom URL',
        },
        center: {
          type: 'array',
          items: { type: 'number' },
          minItems: 2,
          maxItems: 2,
          description: 'Map center [longitude, latitude], default [105, 35]',
        },
        zoom: { type: 'number', description: 'Map zoom level, default 4' },
        pitch: { type: 'number', description: 'Map pitch in degrees, default 0' },
        rotation: { type: 'number', description: 'Map rotation in degrees, default 0' },
        minZoom: { type: 'number', description: 'Minimum zoom level' },
        maxZoom: { type: 'number', description: 'Maximum zoom level' },
        bounds: {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'number' },
            minItems: 2,
            maxItems: 2,
          },
          minItems: 2,
          maxItems: 2,
          description: 'Initial bounds [[swLng, swLat], [neLng, neLat]]',
        },
        gestureConfig: {
          type: 'object',
          properties: {
            dragPan: { type: 'boolean' },
            pinchZoom: { type: 'boolean' },
            dragRotate: { type: 'boolean' },
          },
        },
      },
    },
    layers: {
      type: 'array',
      description: 'Array of map layers',
      items: {
        type: 'object',
        required: ['type', 'source'],
        properties: {
          id: { type: 'string', description: 'Unique layer ID (auto-generated if omitted)' },
          type: {
            type: 'string',
            enum: ['point', 'line', 'polygon', 'heatmap', 'raster', 'image'],
            description: 'Layer visualization type',
          },
          name: { type: 'string', description: 'Human-readable layer name' },
          visible: { type: 'boolean', default: true },
          zIndex: { type: 'number', default: 0 },
          minZoom: { type: 'number' },
          maxZoom: { type: 'number' },
          autoFit: { type: 'boolean', default: false },
          source: { description: 'GeoJSON, JSON array, or URL string' },
          sourceType: { type: 'string', enum: ['geojson', 'json', 'csv'] },
          sourceConfig: {
            type: 'object',
            properties: {
              x: { type: 'string', description: 'Longitude field name' },
              y: { type: 'string', description: 'Latitude field name' },
              x1: { type: 'string', description: 'End longitude field (for arc lines)' },
              y1: { type: 'string', description: 'End latitude field (for arc lines)' },
              coordinates: { type: 'string', description: 'Coordinates field' },
            },
          },
          color: { type: 'string', description: 'Fixed color' },
          colorField: { type: 'string', description: 'Field to map color to' },
          colorValues: {
            oneOf: [
              { type: 'string', description: 'Color palette name' },
              { type: 'array', items: { type: 'string' }, description: 'Array of color values' },
            ],
          },
          size: { type: 'number', description: 'Fixed size' },
          sizeField: { type: 'string', description: 'Field to map size to' },
          sizeValues: {
            type: 'array',
            items: { type: 'number' },
            description: 'Size range [min, max]',
          },
          shape: { type: 'string', description: 'Fixed shape' },
          shapeField: { type: 'string', description: 'Field to map shape to' },
          shapeValues: { type: 'array', items: { type: 'string' } },
          style: { type: 'object', description: 'Additional style properties' },
          filterField: { type: 'string' },
          filterValues: { type: 'array' },
          animate: {
            type: 'object',
            properties: {
              enable: { type: 'boolean' },
              speed: { type: 'number' },
              duration: { type: 'number' },
              trailLength: { type: 'number' },
              repeat: { type: 'number' },
            },
          },
          active: {
            oneOf: [
              { type: 'boolean' },
              { type: 'object', properties: { color: { type: 'string' } } },
            ],
          },
          select: {
            oneOf: [
              { type: 'boolean' },
              { type: 'object', properties: { color: { type: 'string' } } },
            ],
          },
          events: {
            type: 'object',
            description: 'Layer event configuration',
            properties: {
              click: { type: 'string', description: 'Event identifier emitted on click (via EventBus)' },
              mousemove: { type: 'string', description: 'Event identifier emitted on mousemove' },
              mouseenter: { type: 'string', description: 'Event identifier emitted on mouseenter' },
              mouseleave: { type: 'string', description: 'Event identifier emitted on mouseleave' },
              enablePopup: { type: 'boolean', description: 'Auto-show popup on click' },
              popupFields: { type: 'array', items: { type: 'string' }, description: 'Fields to show in popup' },
              popupTemplate: { type: 'string', description: 'HTML template with {{field}} interpolation' },
            },
          },
        },
      },
    },
    controls: {
      type: 'array',
      description: 'Map control widgets',
      items: {
        type: 'object',
        required: ['type'],
        properties: {
          type: {
            type: 'string',
            enum: ['zoom', 'scale', 'fullscreen', 'geoLocate', 'mapTheme', 'mouseLocation', 'exportImage', 'layerSwitch'],
          },
          position: {
            type: 'string',
            enum: ['topleft', 'topright', 'bottomleft', 'bottomright', 'topcenter', 'bottomcenter'],
          },
          options: { type: 'object' },
        },
      },
    },
    interactions: {
      type: 'array',
      description: 'Interactive elements (markers, popups, tooltips)',
      items: {
        oneOf: [
          {
            type: 'object',
            required: ['type', 'longitude', 'latitude'],
            properties: {
              type: { type: 'string', const: 'marker' },
              longitude: { type: 'number' },
              latitude: { type: 'number' },
              content: { type: 'string' },
              draggable: { type: 'boolean' },
            },
          },
          {
            type: 'object',
            required: ['type', 'longitude', 'latitude', 'content'],
            properties: {
              type: { type: 'string', const: 'popup' },
              longitude: { type: 'number' },
              latitude: { type: 'number' },
              content: { type: 'string' },
              closeButton: { type: 'boolean' },
            },
          },
          {
            type: 'object',
            required: ['type', 'content'],
            properties: {
              type: { type: 'string', const: 'tooltip' },
              content: { type: 'string' },
              trigger: { type: 'string', enum: ['hover', 'click'] },
            },
          },
        ],
      },
    },
    legends: {
      type: 'array',
      description: 'Legend configurations',
      items: {
        oneOf: [
          {
            type: 'object',
            required: ['type', 'labels', 'colors'],
            properties: {
              type: { type: 'string', const: 'categories' },
              title: { type: 'string' },
              labels: { type: 'array', items: { type: 'string' } },
              colors: { type: 'array', items: { type: 'string' } },
            },
          },
          {
            type: 'object',
            required: ['type', 'labels', 'colors'],
            properties: {
              type: { type: 'string', const: 'ramp' },
              title: { type: 'string' },
              labels: { type: 'array', items: { type: 'string' } },
              colors: { type: 'array', items: { type: 'string' } },
              isContinuous: { type: 'boolean' },
            },
          },
          {
            type: 'object',
            required: ['type', 'labels'],
            properties: {
              type: { type: 'string', const: 'proportion' },
              title: { type: 'string' },
              labels: { type: 'array', items: { type: 'array', items: { type: 'number' } } },
              fillColor: { type: 'string' },
            },
          },
          {
            type: 'object',
            required: ['type', 'items'],
            properties: {
              type: { type: 'string', const: 'icon' },
              title: { type: 'string' },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    icon: { type: 'string' },
                    label: { type: 'string' },
                  },
                },
              },
            },
          },
        ],
      },
    },
    responsive: {
      type: 'object',
      properties: {
        breakpoint: { type: 'number', default: 768 },
        mobile: {
          type: 'object',
          properties: {
            controls: {
              type: 'object',
              properties: {
                position: { type: 'string' },
                scale: { type: 'number' },
                hide: { type: 'array', items: { type: 'string' } },
              },
            },
            legends: {
              type: 'object',
              properties: {
                compact: { type: 'boolean' },
                position: { type: 'string' },
              },
            },
            toolbar: {
              type: 'object',
              required: ['items', 'position'],
              properties: {
                items: { type: 'array', items: { type: 'string' } },
                position: { type: 'string', enum: ['bottom', 'top'] },
              },
            },
          },
        },
      },
    },
    events: {
      type: 'object',
      description: 'Global event identifier mappings for map and interactions',
      properties: {
        mapMove: { type: 'string', description: 'Event identifier for map move' },
        mapZoom: { type: 'string', description: 'Event identifier for map zoom' },
        markerDragEnd: { type: 'string', description: 'Event identifier for marker drag end' },
      },
    },
  },
} as const;

export default AimapJSONSchema;