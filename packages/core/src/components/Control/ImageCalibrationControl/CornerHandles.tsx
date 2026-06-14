import React, { useCallback } from 'react';
import type { CornerIndex } from './image-calibration-types';
import type { CalibrationPhase } from './image-calibration-types';
import type { Point2D } from './perspective-transform';

interface CornerHandlesProps {
  screenPositions: [Point2D, Point2D, Point2D, Point2D];
  draggingCorner: CornerIndex | null;
  phase: CalibrationPhase;
  onStartDrag: (corner: CornerIndex) => void;
}

const CORNER_LABELS = ['TL', 'TR', 'BR', 'BL'] as const;
const HANDLE_SIZE = 14;

export function CornerHandles({
  screenPositions,
  draggingCorner,
  phase,
  onStartDrag,
}: CornerHandlesProps) {
  const handleMouseDown = useCallback(
    (corner: CornerIndex) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onStartDrag(corner);
    },
    [onStartDrag],
  );

  const canDrag = phase === 'calibrating';

  // 边框 SVG 路径
  const svgPath = `M ${screenPositions[0][0]},${screenPositions[0][1]} ` +
    `L ${screenPositions[1][0]},${screenPositions[1][1]} ` +
    `L ${screenPositions[2][0]},${screenPositions[2][1]} ` +
    `L ${screenPositions[3][0]},${screenPositions[3][1]} Z`;

  return (
    <>
      {/* 边框线 SVG */}
      <svg
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          overflow: 'visible',
        }}
      >
        <path
          d={svgPath}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeDasharray="6 3"
        />
      </svg>

      {/* 4个角点拖拽手柄 */}
      {canDrag && screenPositions.map((pos, i) => (
        <div
          key={i}
          onMouseDown={handleMouseDown(i as CornerIndex)}
          style={{
            position: 'absolute',
            left: pos[0] - HANDLE_SIZE / 2,
            top: pos[1] - HANDLE_SIZE / 2,
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            borderRadius: '50%',
            backgroundColor: '#fff',
            border: '2px solid #f59e0b',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            cursor: draggingCorner === i ? 'grabbing' : 'grab',
            transform: draggingCorner === i ? 'scale(1.3)' : 'scale(1)',
            transition: draggingCorner === null ? 'transform 0.15s ease' : 'none',
            zIndex: draggingCorner === i ? 10 : 1,
            pointerEvents: 'auto',
          }}
          title={`${CORNER_LABELS[i]} 角点`}
        />
      ))}
    </>
  );
}
