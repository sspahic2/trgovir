// src/components/shape/ShapeCard.tsx
'use client';

import React from 'react';
import ShapeCanvas from '@/components/shape/ShapeCanvas';
import PrettyButton from '@/components/common/button/PrettyButton';
import { Trash2 } from 'lucide-react';
import { ShapeType, Coordinate } from '@/models/ShapeConfiguration';
import type { SquareWithTailProps } from '@/components/shape/SquareWithTail';
import type { LineShapeProps } from '@/components/shape/Line';
import type { ConnectedLinesShapeProps } from '@/components/shape/ConnectingLines';

interface ShapeCardProps {
  /** Only relevant in view‐mode to show “×” markers */
  selectedCoords?: Coordinate[];
  /** Layout mode: view shows delete & can navigate, select only shows click‐to‐pick */
  mode?: 'view' | 'select';
  /** Width/height of the preview area */
  width?: number;
  height?: number;
  /** Called when the card body is clicked (navigate or pick) */
  onClick?: () => void;
  /** Shown only in view‐mode: trash icon callback */
  onDelete?: () => void;

  selected?: boolean;
  rawConfig?: string;
  title?: string;
}

export default function ShapeCard({
  selectedCoords = [],
  mode = 'view',
  width = 200,
  height = 200,
  onClick,
  onDelete,
  selected = false,
  rawConfig,
  title
}: ShapeCardProps) {
  return (
    <div
      className={`relative bg-white rounded-lg shadow transition ${
        onClick ? 'cursor-pointer' : ''
      } ${selected ? 'ring-4 ring-blue-500' : 'hover:shadow-lg'}`}
      style={{ width: `${width}px`, height: `${height}px` }}
      onClick={onClick}
    >
      {/* delete button (view‐mode) */}
      {mode === 'view' && onDelete && (
        <div
          className="absolute top-2 right-2 z-10"
          onClick={e => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <PrettyButton color="red">
            <Trash2 size={16} />
          </PrettyButton>
        </div>
      )}

      {/* shape preview */}
      <div className="p-2 flex items-center justify-center h-full flex-col" style={{ backgroundColor: 'var(--card-bg)' }}>
        <ShapeCanvas
          selectedCoords={selectedCoords}
          rawConfig={rawConfig}
          onToggleCoord={() => {}}
          mode={mode === 'view' ? 'view' : 'input'}
          width={width - 16}
          height={height - 64}
        />
        <div className='text-sm text-center'>
          {title}
        </div>
      </div>
    </div>
  );
}
