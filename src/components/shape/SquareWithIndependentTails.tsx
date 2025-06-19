// src/components/shape/SquareWithIndependentTails.tsx
'use client';

import { ColorHelper } from '@/helpers/color.helper';
import React from 'react';
import type { Corner, Side, TailConfig } from './SquareWithTail';

/*
 * A configurable square that supports up to **two independent tails**
 * and per‑side visibility/length (like SquareWithMissingSide).
 *
 * ───────────────────────────────────────────────── Config schema
 *  • tails        Array<[TailConfig, TailConfig]>
 *  • sides        Record<'top'|'right'|'bottom'|'left', boolean>
 *  • lengths      (optional) per‑side lengths – falls back to width/height props
 *
 *  Example serialisation string (for serializer helper):
 *      SquareWithIndependentTails;width=100;height=100;radius=10;stroke=theme;
 *      tail1=bottom-right:right:20:30;tail2=top-left:left:15:-25;
 *      sides=1,1,0,1;len=100,100,90,100
 */

export interface DualTailConfig {
  corner: Corner;
  side: Side;
  length?: number;
  angle?: number; // degrees
}

export interface SquareWithIndependentTailsProps {
  width?: number;   // fallback if lengths not provided
  height?: number;  // fallback if lengths not provided
  radius?: number;
  strokeColor?: string;
  /** Up to TWO tails – undefined entries are ignored */
  tails?: [DualTailConfig?, DualTailConfig?];
  /** Toggle visibility of each side */
  sides?: {
    top?: boolean;
    right?: boolean;
    bottom?: boolean;
    left?: boolean;
  };
  /** Explicit per‑side lengths (top, right, bottom, left) */
  lengths: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

export const checkboxCount = {
  top: 3,
  right: 3,
  bottom: 3,
  left: 3,
};

export const innerCheckboxCount = {
  top: 1,
  right: 1,
  bottom: 1,
  left: 1
};

export const defaultConfig: SquareWithIndependentTailsProps = {
  width: 100,
  height: 100,
  radius: 10,
  strokeColor: 'theme',
  tails: [
    { corner: 'bottom-right', side: 'right', length: 20, angle: 30 },
    { corner: 'top-left',     side: 'left',  length: 20, angle: -30 },
  ],
  sides: { top: true, right: true, bottom: true, left: true },
  lengths: { top: 100, right: 100, bottom: 100, left: 100 },
};

// ────────────────────────────────────────── Geometry helpers
const toRad = (deg: number) => (deg * Math.PI) / 180;

function tailPath(
  w: number,
  h: number,
  r: number,
  { corner, side, length = 12, angle = 30 }: Required<DualTailConfig>,
): string {
  // Compute tail origin – slight inwards bias so it starts inside the rounded corner
  let ox = 0,
      oy = 0;

  switch (corner) {
    case 'top-left':     ox = r / 4;           oy = r / 4;           break;
    case 'top-right':    ox = w - r / 4;       oy = r / 4;           break;
    case 'bottom-left':  ox = r / 4;           oy = h - r / 4;       break;
    case 'bottom-right': ox = w - r / 4;       oy = h - r / 4;       break;
  }

  const rad = toRad(angle);
  let dx = 0, dy = 0;
  switch (side) {
    case 'top':    dx =  length * Math.cos(rad); dy =  length * Math.sin(rad); break;
    case 'right':  dx = -length * Math.sin(rad); dy =  length * Math.cos(rad); break;
    case 'bottom': dx = -length * Math.cos(rad); dy = -length * Math.sin(rad); break;
    case 'left':   dx =  length * Math.sin(rad); dy = -length * Math.cos(rad); break;
  }

  return `M${ox} ${oy} L${ox + dx} ${oy + dy}`;
}

// Straight side between two offsets
function lineSeg(x1: number, y1: number, x2: number, y2: number) {
  return `M ${x1} ${y1} L ${x2} ${y2}`;
}

// Corner arc (clockwise/anticlockwise derived automatically by svg A command)
function arc(
  cx: number,
  cy: number,
  r: number,
  sweepFlag: 0 | 1,
  largeArc: 0 | 1 = 0,
) {
  return `A ${r} ${r} 0 ${largeArc} ${sweepFlag} ${cx} ${cy}`;
}

export const SquareWithIndependentTails: React.FC<SquareWithIndependentTailsProps> = ({
  radius = 10,
  strokeColor = 'theme',
  sides = { top: true, right: true, bottom: true, left: true },
  lengths,
  tails = [],
}) => {
  let x = 0, y = 0, d = '';

  const topLen    = (lengths.top    ?? lengths.bottom) ?? 0;
  const bottomLen = lengths.bottom ?? topLen;
  const leftLen   = (lengths.left   ?? lengths.right)  ?? 0;
  const rightLen  = lengths.right  ?? leftLen;

  const width  = Math.max(topLen,    bottomLen);
  const height = Math.max(leftLen,   rightLen);

  const tl = `M ${x + radius} ${y} A ${radius} ${radius} 0 0 0 ${x} ${y + radius}`;
  const tr = `M ${x + topLen - radius} ${y} A ${radius} ${radius} 0 0 1 ${x + topLen} ${y + radius}`;
  const br = `M ${x + bottomLen} ${y + rightLen - radius} A ${radius} ${radius} 0 0 1 ${x + bottomLen - radius} ${y + rightLen}`;
  const bl = `M ${x + radius} ${y + leftLen} A ${radius} ${radius} 0 0 1 ${x} ${y + leftLen - radius}`;

  const topSide    =  `M ${x + radius} ${y - radius + radius} L ${x + topLen - radius} ${y - radius + radius}`;
  const rightSide  =  `M ${x + topLen} ${y + radius} L ${x + bottomLen} ${y + rightLen - radius}`;
  const bottomSide =  `M ${x + bottomLen - radius} ${y + rightLen} L ${x + radius} ${y + leftLen}`;
  const leftSide   =  `M ${x} ${y + leftLen - radius} L ${x} ${y + radius}`;

  if (sides.top)    d += tl + topSide + tr;
  if (sides.right)  d += tr + rightSide + br;
  if (sides.bottom) d += br + bottomSide + bl;
  if (sides.left)   d += tl + leftSide + bl;

  const stroke = ColorHelper.determineColor(strokeColor || 'theme');

  return (
    <svg width={width} height={height} viewBox={`-${width / 2} -${height / 2} ${width * 2} ${height * 2}`}>
      <path d={d} fill="none" stroke={stroke} strokeWidth={3} /> 
      {tails.map(
        (t, i) =>
          t && (
            <path
              key={i}
              d={tailPath(width, height, radius, {
                corner: t.corner,
                side: t.side,
                length: t.length ?? 12,
                angle: t.angle ?? 30,
              })}
              fill="none"
              stroke={stroke}
              strokeWidth={2}
            />
          ),
      )}
    </svg>
  );
};

export default SquareWithIndependentTails;
