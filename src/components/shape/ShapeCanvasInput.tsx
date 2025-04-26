import React from 'react';
import { Coordinate } from '@/models/ShapeConfiguration';

interface ShapeCanvasInputProps {
  ShapeComponent: React.FC<any>;
  shapeProps: any;
  width: number;
  height: number;
  slots: { x: number; y: number }[];
  getOffset: (slot: { x: number; y: number }) => { x: number; y: number };
  inputValues: Record<string, number>;
  onInputChange: (coord: Coordinate, value: number) => void;
  scale: number;
  offsetX: number;
  offsetY: number;
  rowIndex: number;
  setShapeInputRef?: (row: number, key: string, el: HTMLInputElement | null) => void;
  handleShapeKeyDown?: (
    e: React.KeyboardEvent<HTMLInputElement>,
    row: number,
    key: string
  ) => void;
}

export default function ShapeCanvasInput({
  ShapeComponent,
  shapeProps,
  width,
  height,
  slots,
  getOffset,
  inputValues,
  onInputChange,
  scale,
  offsetX,
  offsetY,
  setShapeInputRef,
  rowIndex,
  handleShapeKeyDown
}: ShapeCanvasInputProps) {
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
      </svg>

      {/* Render number inputs only for selected coordinates */}
      {slots.map((slot) => {
        const key = `${slot.x}-${slot.y}`;
        const isSelected = Object.keys(inputValues).includes(key);
        if (!isSelected) return null;

        const { x, y } = getOffset(slot);

        return (
          <input
            key={key}
            type="text"
            inputMode="numeric"
            value={inputValues[key] ?? ''}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              onInputChange(slot, isNaN(parsed) ? 0 : parsed);
            }}
            ref={(el) => { 
              console.log("Setting ref", { rowIndex, key, el });
              setShapeInputRef?.(rowIndex, key, el)
            }}
            onKeyDown={(e) => handleShapeKeyDown?.(e, rowIndex, key)}
            className={`
              absolute w-12 h-6 text-[10px] text-center font-light rounded
              bg-transparent outline-none border border-transparent
              focus:border-blue-500 focus:bg-white
              hover:border-gray-300
              transition-all duration-100
              [appearance:textfield]
              focus:z-20
              hover:z-20
              z-10
            `}
            style={{
              left: `${x}px`,
              top: `${y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}
    </div>
  );
}
