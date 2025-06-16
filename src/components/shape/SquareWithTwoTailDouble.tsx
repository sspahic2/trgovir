// src/components/shapes/SquareWithTwoTailDouble.tsx
'use client';

import { ColorHelper } from '@/helpers/color.helper';
import React from 'react';
import { Corner, Side, TailConfig } from './SquareWithTail';

type CornerSideKey = `${Corner}-${Side}`;

export const checkboxCount = {
  top: 5,
  right: 5,
  bottom: 5,
  left: 5,
};

export const innerCheckboxCount = {
  top: 1,
  right: 1,
  bottom: 1,
  left: 1
};

export const defaultConfig: SquareWithTwoTailDoubleProps = {
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

export interface SquareWithTwoTailDoubleProps {
  width?: number;
  height?: number;
  radius?: number;
  strokeColor?: string;
  tail?: TailConfig;
}

const cornerSideValues: Record<string, {
  xFactor: 1 | -1;
  yFactor: 1 | -1;
  inward: [number, number];
  angleOffset?: number;
  oppositeCorner?: Corner;
}> = {
  'top-left-top':       { xFactor: 1,  yFactor: 1,  inward: [0, +1], angleOffset: 90,  oppositeCorner: 'top-right' },
  'top-left-left':      { xFactor: 1,  yFactor: 1,  inward: [+1, 0], angleOffset: -90, oppositeCorner: 'bottom-left' },
  'top-left-bottom':    { xFactor: 1,  yFactor: 1,  inward: [+0, 0], angleOffset: 0,   oppositeCorner: 'top-left' }, // Invalid
  'top-left-right':     { xFactor: 1,  yFactor: 1,  inward: [+0, 0], angleOffset: 0,   oppositeCorner: 'top-left' }, // Invalid
  'top-right-top':      { xFactor: -1, yFactor: 1,  inward: [0, +1], angleOffset: -90, oppositeCorner: 'top-left' },
  'top-right-right':    { xFactor: -1, yFactor: 1,  inward: [-1, 0], angleOffset: 90,  oppositeCorner: 'bottom-right' },
  'top-right-bottom':   { xFactor: 1,  yFactor: 1,  inward: [+0, 0], angleOffset: 0,   oppositeCorner: 'top-left' }, // Invalid
  'top-right-left':     { xFactor: 1,  yFactor: 1,  inward: [+0, 0], angleOffset: 0,   oppositeCorner: 'top-left' }, // Invalid
  'bottom-left-bottom': { xFactor: 1,  yFactor: -1, inward: [0, -1], angleOffset: -90, oppositeCorner: 'bottom-right' },
  'bottom-left-left':   { xFactor: 1,  yFactor: -1, inward: [+1, 0], angleOffset: 90,  oppositeCorner: 'top-left' },
  'bottom-left-top':    { xFactor: 1,  yFactor: 1,  inward: [+0, 0], angleOffset: 0,   oppositeCorner: 'top-left' }, // Invalid
  'bottom-left-right':  { xFactor: 1,  yFactor: 1,  inward: [+0, 0], angleOffset: 0,   oppositeCorner: 'top-left' }, // Invalid
  'bottom-right-bottom':{ xFactor: -1, yFactor: -1, inward: [0, -1], angleOffset: 90,  oppositeCorner: 'bottom-left' },
  'bottom-right-right': { xFactor: -1, yFactor: -1, inward: [-1, 0], angleOffset: -90, oppositeCorner: 'top-right' },
  'bottom-right-left':  { xFactor: 1,  yFactor: 1,  inward: [+0, 0], angleOffset: 0,   oppositeCorner: 'top-left' }, // Invalid
  'bottom-right-top':   { xFactor: 1,  yFactor: 1,  inward: [+0, 0], angleOffset: 0,   oppositeCorner: 'top-left' }, // Invalid
};

const toRadians = (angleDeg: number) => (angleDeg * Math.PI) / 180;

const getTailOrigin = (
  corner: Corner,
  side: Side,
  width: number,
  height: number,
  radius: number,
  inward = false,
): [number, number] => {
  const offset = 6;
  const key = `${corner}-${side}` as CornerSideKey;
  const { xFactor, yFactor, inward: inwardDir } = cornerSideValues[key];

  const x = xFactor === 1 ? radius / 4 : width - radius / 4;
  const y = yFactor === 1 ? radius / 4 : height - radius / 4;

  if (!inward) return [x, y];

  return [x + inwardDir[0] * offset, y + inwardDir[1] * offset];
};

const getTailPath = (
  width: number,
  height: number,
  radius: number,
  { corner, side, length = 12, angle = 30 }: Required<TailConfig>
): string => {
  const [x, y] = getTailOrigin(corner, side, width, height, radius, true);

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

function getOppositeCornerOnSameSide(corner: Corner, side: Side): Corner {
  const map: Record<Side, [Corner, Corner]> = {
    top: ['top-left', 'top-right'],
    bottom: ['bottom-left', 'bottom-right'],
    left: ['top-left', 'bottom-left'],
    right: ['top-right', 'bottom-right'],
  };

  const [c1, c2] = map[side];
  return corner === c1 ? c2 : c1;
}

function getSecondTailConfig(primary?: TailConfig): { config: TailConfig, dx: number, dy: number } {
  if (!primary) return {
    config: { corner: 'top-right', side: 'right', length: 20, angle: 30 },
    dx: 0, dy: 0
  };

  const { corner, side, length = 12, angle = 30 } = primary;

  const secondCorner = getOppositeCornerOnSameSide(corner, side);

  // Optional: tweak angle or length slightly to avoid perfect overlap
  let angleOffset = 90;
  const lengthOffset = 0;

  switch (`${corner}-${side}`) {
    case "top-left-top":
    case "bottom-right-bottom":
    case "top-right-right":
    case "bottom-left-left":
      angleOffset = +15;
      break;

    case "top-right-top":
    case "bottom-left-bottom":
    case "top-left-left":
    case "bottom-right-right":
      angleOffset = -15;
      break;

    default:
      angleOffset = 90; // fallback
  }

  return {
    config: {
      corner: secondCorner,
      side,
      length: length + lengthOffset,
      angle: angle + angleOffset
    },
    dx: 0,
    dy: 0
  };
}

function innerRectangle(width: number, height: number, radius: number = 10, side: Side) {
  let showTop, showRight, showBottom, showLeft;
  let xOffset = 0, yOffset = 0;

  if(side == 'top') {
    yOffset = 4;
    showTop = true;
  } 
  else if(side == 'bottom') {
    yOffset = 4;
    showBottom = true;
  }
  else if(side == 'left') {
    xOffset = 4;
    showLeft = true;
  }
  else if(side == 'right') {
    xOffset = 4;
    showRight = true;
  }

  let x = xOffset;
  let y = yOffset;
  let w = width - 2 * xOffset;
  let h = height - 2 * yOffset;

  let d = "";

  // Corners
  const topLeftCorner = `
    M ${x + radius} ${y}
    A ${radius} ${radius} 0 0 0 ${x} ${y + radius}
  `;

  const topRightCorner = `
    M ${x + w - radius} ${y}
    A ${radius} ${radius} 0 0 1 ${x + w} ${y + radius}
  `;

  const bottomRightCorner = `
    M ${x + w} ${y + h - radius}
    A ${radius} ${radius} 0 0 1 ${x + w - radius} ${y + h}
  `;

  const bottomLeftCorner = `
    M ${x + radius} ${y + h}
    A ${radius} ${radius} 0 0 1 ${x} ${y + h - radius}
  `;

  // Sides (straight lines only, between corners)
  const topSide = `
    M ${x + 10} ${y - 10 + radius}
    L ${x + w - 10} ${y - 10 + radius}
  `;

  const rightSide = `
    M ${x + w} ${y + radius}
    L ${x + w} ${y + h - radius}
  `;

  const bottomSide = `
    M ${x + w - 10} ${y + h + 10 - radius}
    L ${x + 10} ${y + h + 10 - radius}
  `;

  const leftSide = `
    M ${x} ${y + h - radius}
    L ${x} ${y + radius}
  `;

  if (showTop) {
    d += topLeftCorner + topSide + topRightCorner;
  }
  if (showRight) {
    d += topRightCorner + rightSide + bottomRightCorner;
  }
  if (showBottom) {
    d += bottomRightCorner + bottomSide + bottomLeftCorner;
  }
  if (showLeft) {
    d += topLeftCorner + leftSide + bottomLeftCorner;
  }

  return d;
}

const SquareWithTwoTailDoubleShape: React.FC<SquareWithTwoTailDoubleProps> = ({
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
            stroke={ColorHelper.determineColor(strokeColor || "theme")}
            strokeWidth={2}
            fill="none"
          />

          <path
            d={getTailPath(width, height, radius, {
              corner: secondTail.config.corner,
              side: secondTail.config.side,
              length: secondTail.config.length ?? 12,
              angle: secondTail.config.angle ?? 30,
            })}
            stroke={ColorHelper.determineColor(strokeColor || "theme")}
            strokeWidth={2}
            fill="none"
          />

          {(() => {
            const [x1, y1] = getTailOrigin(tail.corner, tail.side, width, height, radius, true);
            const [x2, y2] = getTailOrigin(secondTail.config.corner, tail.side, width, height, radius, true);

            return (
              <path
                d={innerRectangle(width, height, radius, tail.side)}
                stroke={ColorHelper.determineColor(strokeColor || "theme")}
                strokeWidth={2}
                fill="none"
              />
            );
          })()}
        </>
      )}
    </svg>
  );

};

export default SquareWithTwoTailDoubleShape;
