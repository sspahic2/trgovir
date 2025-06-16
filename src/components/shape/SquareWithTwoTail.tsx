'use client';

import { ColorHelper } from '@/helpers/color.helper';
import React from 'react';
import { Corner, Side, TailConfig } from './SquareWithTail';

export const checkboxCount = {
  top: 5,
  right: 5,
  bottom: 5,
  left: 5,
};

export const defaultConfig: SquareWithTwoTailProps = {
  width: 100,
  height: 100,
  radius: 10,
  strokeColor: "theme",
  tail: {
    corner: "bottom-right",
    side: "right",
    length: 20,
    angle: 30,
  },
};

export interface SquareWithTwoTailProps {
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

function getSecondTailConfig(primary?: TailConfig): { config: TailConfig, dx: number, dy: number } {
  if(!primary) return { config :{ corner: 'bottom-right', side: 'right', length: 20, angle: 90 }, dx: 0, dy: 0 };
  const { corner, side, length = 12, angle = 30 } = primary;

  let secondCorner = corner;
  let secondSide: Side;
  let secondAngle: number;
  let secondLength: number = length;
  let dx = 0, dy = 0;

  // Map based on corner + side to keep orientation and symmetry
  switch (`${corner}-${side}`) {
    case 'top-left-top':
      secondSide = 'left';
      secondAngle = angle + 90;
      dx = -5, dy = 5;
      secondLength += 1.5;
      break;
    case 'top-left-left':
      secondSide = 'top';
      secondAngle = angle - 90;
      dx = -5, dy = 5;
      secondLength += 1.5
      break;

    case 'top-right-top':
      secondSide = 'right';
      secondAngle = angle - 90;
      dx = 5, dy = 5
      secondLength += 1.5
      break;
    case 'top-right-right':
      secondSide = 'top';
      secondAngle = angle + 90;
      dx = 5, dy = 5
      secondLength += 1.5;
      break;

    case 'bottom-left-bottom':
      secondSide = 'left';
      secondAngle = angle - 90;
      secondLength += 1.5
      dx = 5, dy = 5;
      break;
    case 'bottom-left-left':
      secondSide = 'bottom';
      secondAngle = angle + 90;
      secondLength += 3
      dx = 3, dy = 5
      break;

    case 'bottom-right-bottom':
      secondSide = 'right';
      secondAngle = angle + 90;
      secondLength += 1.5
      dx = 5, dy = -5
      break;
    case 'bottom-right-right':
      secondSide = 'bottom';
      secondAngle = angle - 90;
      secondLength -= 1.5
      dx = 3, dy = -5
      break;

    default:
      // fallback: use same side and angle
      secondSide = side;
      secondAngle = angle + 85;
  }

  return {
    config: {
      corner: secondCorner,
      side: secondSide,
      length: secondLength,
      angle: secondAngle,
    },
    dx: dx,
    dy: dy
  };
}


const SquareWithTwoTailShape: React.FC<SquareWithTwoTailProps> = ({
  width = 100,
  height = 100,
  radius = 10,
  strokeColor = 'white',
  tail,
}) => {

  const secondTail = getSecondTailConfig(tail);
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
        <>
          <path
            d={getTailPath(width, height, radius, {
              corner: tail.corner,
              side: tail.side,
              length: tail.length ?? 12,
              angle: tail.angle ?? 30,
            })}
            transform={`translate(${-secondTail.dx/2},${-secondTail.dy/2})`}
            stroke={ColorHelper.determineColor(strokeColor || "theme")}
            strokeWidth={2}
            fill="none"
          />

          <path
            d={getTailPath(width, height, radius, {
              corner: secondTail.config.corner,
              length: secondTail.config.length ?? 12,
              angle: secondTail.config.angle ?? 30,
              side: secondTail.config.side
            })}
            transform={`translate(${secondTail.dx},${secondTail.dy})`}
            stroke={ColorHelper.determineColor(strokeColor || "theme")}
            strokeWidth={2}
            fill="none"
          />
        </>
      )}
    </svg>
  );
};

export default SquareWithTwoTailShape;
