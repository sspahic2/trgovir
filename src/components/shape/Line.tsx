'use client';

import React from 'react';

export type LineDirection = 'horizontal' | 'vertical';

export const checkboxCount = {
  top:    1,
  right:  0,
  bottom: 0,
  left:   0,
};

export interface LineShapeProps {
  length?: number;
  thickness?: number;
  direction?: LineDirection;
  strokeColor?: string;
}

const LineShape: React.FC<LineShapeProps> = ({
  length = 100,
  thickness = 2,
  direction = 'horizontal',
  strokeColor = 'white',
}) => {
  const isHorizontal = direction === 'horizontal';

  const offset = thickness / 2; // enough padding for rounded ends
  const width = isHorizontal ? length + offset * 2 : thickness + offset * 2;
  const height = isHorizontal ? thickness + offset * 2 : length + offset * 2;

  const x1 = isHorizontal ? offset : width / 2;
  const y1 = isHorizontal ? height / 2 : offset;
  const x2 = isHorizontal ? length + offset : width / 2;
  const y2 = isHorizontal ? height / 2 : length + offset;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={strokeColor}
        strokeWidth={thickness}
        strokeLinecap="round"
      />
    </svg>
  );
};

export default LineShape;
