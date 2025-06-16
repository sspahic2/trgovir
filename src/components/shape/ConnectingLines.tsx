'use client';

import { ColorHelper } from '@/helpers/color.helper';
import React from 'react';
const toRadians = (deg: number) => (deg * Math.PI) / 180;

export interface ConnectedLinesShapeProps {
  length?: number;
  thickness?: number;
  strokeColor?: string;
  angle?: number;
}

export const checkboxCount = {
  top:    1,
  right:  1,
  bottom: 1,
  left:   1,
};

export const defaultConfig: ConnectedLinesShapeProps = {
  length: 80,
  thickness: 4,
  angle: 60,
  strokeColor: "theme",
};

const ConnectedLinesShape: React.FC<ConnectedLinesShapeProps> = ({
  length = 100,
  thickness = 2,
  strokeColor = 'white',
  angle = 60,
}) => {
  const offset = thickness / 2;
  const halfAngleRad = toRadians(angle / 2);

  // how much the endpoints sit below the apex
  const verticalSpan = length * Math.cos(halfAngleRad);
  // shift apex up by half that span
  const shiftUp = verticalSpan / 2;

  // center of our original square viewBox
  const cx = length + offset;
  // move apex up so shape is balanced around mid‑height
  const cy = length + offset - shiftUp;

  const angle1 = -halfAngleRad;
  const angle2 =  halfAngleRad;

  // endpoints
  const x1 = cx + length * Math.sin(angle1);
  const y1 = cy + length * Math.cos(angle1);
  const x2 = cx + length * Math.sin(angle2);
  const y2 = cy + length * Math.cos(angle2);

  const svgSize = length * 2 + thickness;

  return (
    <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
      <line
        x1={x1}
        y1={y1}
        x2={cx}
        y2={cy}
        stroke={ColorHelper.determineColor(strokeColor || "theme")}
        strokeWidth={thickness}
        strokeLinecap="round"
      />
      <line
        x1={x2}
        y1={y2}
        x2={cx}
        y2={cy}
        stroke={strokeColor}
        strokeWidth={thickness}
        strokeLinecap="round"
      />
    </svg>
  );
};

export default ConnectedLinesShape;