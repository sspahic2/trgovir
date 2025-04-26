'use client';

import { ColorHelper } from '@/helpers/color.helper';
import React from 'react';

export type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type Side = 'top' | 'right' | 'bottom' | 'left';

export const checkboxCount = {
  top: 5,
  right: 5,
  bottom: 5,
  left: 5,
};


export interface TailConfig {
  corner: Corner;
  side: Side;
  length?: number;
  angle?: number; // degrees
}

export interface SquareWithTailProps {
  width?: number;
  height?: number;
  radius?: number;
  strokeColor?: string;
  tail?: TailConfig;
}

// Utility to convert degrees to radians
const toRadians = (angleDeg: number) => (angleDeg * Math.PI) / 180;

// Computes SVG path for the tail
const getTailPath = (
  width: number,
  height: number,
  radius: number,
  { corner, side, length = 12, angle = 30 }: Required<TailConfig>
): string => {
  let x = 0, y = 0;

  switch (corner) {
    case 'top-left':
      x = radius / 4;
      y = radius / 4;
      break;
    case 'top-right':
      x = width - radius / 4;
      y = radius / 4;
      break;
    case 'bottom-left':
      x = radius / 4;
      y = height - radius / 4;
      break;
    case 'bottom-right':
      x = width - radius / 4;
      y = height - radius / 4;
      break;
  }

  const angleRad = toRadians(angle);
  let dx = 0, dy = 0;

  switch (side) {
    case 'top':
      dx = length * Math.cos(angleRad);
      dy = length * Math.sin(angleRad);
      break;
    case 'right':
      dx = -length * Math.sin(angleRad);
      dy = length * Math.cos(angleRad);
      break;
    case 'bottom':
      dx = -length * Math.cos(angleRad);
      dy = -length * Math.sin(angleRad);
      break;
    case 'left':
      dx = length * Math.sin(angleRad);
      dy = -length * Math.cos(angleRad);
      break;
  }

  const x2 = x + dx;
  const y2 = y + dy;

  return `M${x} ${y} L${x2} ${y2}`;
};

const SquareWithTailShape: React.FC<SquareWithTailProps> = ({
  width = 100,
  height = 100,
  radius = 10,
  strokeColor = 'white',
  tail,
}) => {
  return (
    <svg width={width + 20} height={height + 20} viewBox={`0 0 ${width} ${height}`}>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={radius}
        ry={radius}
        stroke={ColorHelper.determineColor(strokeColor || "theme")}
        strokeWidth={2}
        fill="none"
      />

      {tail && (
        <path
          d={getTailPath(width, height, radius, {
            corner: tail.corner,
            side: tail.side,
            length: tail.length ?? 12,
            angle: tail.angle ?? 30,
          })}
          stroke={ColorHelper.determineColor(strokeColor || "theme")}
          strokeWidth={2}
          fill="none"
        />
      )}
    </svg>
  );
};

export default SquareWithTailShape;
