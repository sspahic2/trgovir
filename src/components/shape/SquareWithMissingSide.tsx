'use client';

import React from 'react';
import { ColorHelper } from '@/helpers/color.helper';

export interface SquareWithMissingSideProps {
  radius?: number;
  strokeColor?: string;
  sides?: {
    top?: boolean;
    right?: boolean;
    bottom?: boolean;
    left?: boolean;
  };
  lengths: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

export const checkboxCount = {
  top: 5,
  right: 5,
  bottom: 5,
  left: 5,
};

export const defaultConfig: SquareWithMissingSideProps = {
  radius: 10,
  strokeColor: 'theme',
  sides: {
    top: true,
    right: true,
    bottom: true,
    left: true,
  },
  lengths: {
    top: 100,
    right: 100,
    bottom: 100,
    left: 100,
  }
};

const SquareWithMissingSide: React.FC<SquareWithMissingSideProps> = ({
  radius = 10,
  strokeColor = 'theme',
  sides = { top: true, right: true, bottom: true, left: true },
  lengths
}) => {

  let x = 0;
  let y = 0;
  let d = "";

  const topLen = (lengths.top ?? lengths.bottom) ?? 0;
  const bottomLen = lengths.bottom ?? topLen;
  const leftLen = (lengths.left ?? lengths.right) ?? 0;
  const rightLen = lengths.right ?? leftLen;

  const width = Math.max(topLen, bottomLen);
  const height = Math.max(leftLen, rightLen);

  // Corners
  const topLeftCorner = `
    M ${x + radius} ${y}
    A ${radius} ${radius} 0 0 0 ${x} ${y + radius}
  `;

  const topRightCorner = `
    M ${x + topLen - radius} ${y}
    A ${radius} ${radius} 0 0 1 ${x + topLen} ${y + radius}
  `;

  const bottomRightCorner = `
    M ${x + bottomLen} ${y + rightLen - radius}
    A ${radius} ${radius} 0 0 1 ${x + bottomLen - radius} ${y + rightLen}
  `;

  const bottomLeftCorner = `
    M ${x + radius} ${y + leftLen}
    A ${radius} ${radius} 0 0 1 ${x} ${y + leftLen - radius}
  `;

  // Sides (straight lines only, between corners)
  const topSide = `
    M ${x + radius} ${y - radius + radius}
    L ${x + topLen - radius} ${y - radius + radius}
  `;

  const rightSide = `
    M ${x + topLen} ${y + radius}
    L ${x + bottomLen} ${y + rightLen - radius}
  `;

  const bottomSide = `
    M ${x + bottomLen - radius} ${y + rightLen + radius - radius}
    L ${x + radius} ${y + leftLen + radius - radius}
  `;

  const leftSide = `
    M ${x} ${y + leftLen - radius}
    L ${x} ${y + radius}
  `;

  if (sides.top) {
    d += topLeftCorner + topSide + topRightCorner;
  }
  if (sides.right) {
    d += topRightCorner + rightSide + bottomRightCorner;
  }
  if (sides.bottom) {
    d += bottomRightCorner + bottomSide + bottomLeftCorner;
  }
  if (sides.left) {
    d += topLeftCorner + leftSide + bottomLeftCorner;
  }

  return (
    <svg width={width + 20} height={height + 20} viewBox={`0 0 ${width} ${height}`}>
      <path
        d={d}
        fill="none"
        stroke={ColorHelper.determineColor(strokeColor || 'theme')}
        strokeWidth={2}
      />
    </svg>
  );
};

export default SquareWithMissingSide;
