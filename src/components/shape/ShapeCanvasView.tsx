// Updated ShapeCanvasView.tsx with correct scaling and transform
'use client';

import React from 'react';
import { Coordinate } from '@/models/ShapeConfiguration';

interface ShapeCanvasViewProps {
  ShapeComponent: React.FC<any>;
  shapeProps: any;
  width: number;
  height: number;
  slots: { x: number; y: number }[];
  getOffset: (slot: { x: number; y: number }) => { x: number; y: number };
  selectedCoords: Coordinate[];
  scale: number;
  offsetX: number;
  offsetY: number;
}

export default function ShapeCanvasView({
  ShapeComponent,
  shapeProps,
  width,
  height,
  slots,
  getOffset,
  selectedCoords,
  scale,
  offsetX,
  offsetY
}: ShapeCanvasViewProps) {

  return (
    <div className="relative" style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Center and scale the shape */}
        <g transform={`translate(${offsetX}, ${offsetY}) scale(${scale})`}>
          <ShapeComponent {...shapeProps} />
        </g>

        {/* Draw red "×" for each selected coord or clickable area in edit mode */}
        {slots.map((slot) => {
          const { x, y } = getOffset(slot);
          const isSel = selectedCoords.some(
            (sc) => sc.x === slot.x && sc.y === slot.y
          );

          return isSel ? (
            <text
              key={`${slot.x}-${slot.y}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="red"
              fontSize={14}
            >
              x
            </text>
          ) : null;
        })}
      </svg>
    </div>
  );
}