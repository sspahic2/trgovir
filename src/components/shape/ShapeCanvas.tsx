'use client';

import React, { useEffect, useState } from 'react';
import SquareWithTailShape, { checkboxCount as squareCheckboxCount, SquareWithTailProps } from './SquareWithTail';
import LineShape, { checkboxCount as lineCheckboxCount, LineShapeProps } from './Line';
import ConnectedLinesShape, { checkboxCount as connectedCheckboxCount, ConnectedLinesShapeProps } from './ConnectingLines';
import { ShapeType, Coordinate, CanvasMode } from '@/models/ShapeConfiguration';
import ShapeCanvasView from './ShapeCanvasView';
import ShapeCanvasEdit from './ShapeCanvasEdit';
import ShapeCanvasInput from './ShapeCanvasInput';

interface ShapeCanvasProps {
  shapeType: ShapeType;
  squareProps?: SquareWithTailProps;
  lineProps?: LineShapeProps;
  connectedProps?: ConnectedLinesShapeProps;
  selectedCoords?: Coordinate[];
  onToggleCoord?: (coord: Coordinate) => void;
  mode?: CanvasMode;
  width?: number;
  height?: number;
  rowIndex?: number;
  setShapeInputRef?: (row: number, key: string, el: HTMLInputElement | null) => void;
  handleShapeKeyDown?: (
    e: React.KeyboardEvent<HTMLInputElement>,
    row: number,
    key: string
  ) => void;
  rowInputs?: Record<number, Record<string, number>>;
  setInputValue?: (rowIndex: number, key: string, value: number) => void;
}

export default function ShapeCanvas({
  shapeType,
  squareProps = {},
  lineProps = {},
  connectedProps = {},
  selectedCoords = [],
  onToggleCoord = () => {},
  mode = 'view',
  width = 300,
  height = 300,
  rowIndex,
  setShapeInputRef,
  handleShapeKeyDown,
  setInputValue,
  rowInputs
}: ShapeCanvasProps) {
  // Determine which shape component to render and its checkbox counts
  let ShapeComponent: React.FC<any>;
  let checkboxCount: { top: number; right: number; bottom: number; left: number };
  let shapeProps: any;
  let shapeWidth: number;
  let shapeHeight: number;

  if (shapeType === 'SquareWithTail') {
    ShapeComponent = SquareWithTailShape;
    checkboxCount = squareCheckboxCount;
    shapeProps = squareProps;
    shapeWidth = shapeProps.width || 100;
    shapeHeight = shapeProps.height || 100;

    // Adjust for tail length if present
    if (shapeProps.tail) {
      const tailLength = shapeProps.tail.length || 12;
      shapeWidth += tailLength;
      shapeHeight += tailLength;
    }
  } else if (shapeType === 'Line') {
    ShapeComponent = LineShape;
    checkboxCount = lineCheckboxCount;
    shapeProps = lineProps;
    const length = shapeProps.length || 100;
    shapeWidth = shapeProps.direction === 'vertical' ? (shapeProps.thickness || 2) : length;
    shapeHeight = shapeProps.direction === 'vertical' ? length : (shapeProps.thickness || 2);
  } else {
    ShapeComponent = ConnectedLinesShape;
    checkboxCount = connectedCheckboxCount;
    shapeProps = connectedProps;
    const length = shapeProps.length || 100;
    const angle = shapeProps.angle || 60;
    const halfAngleRad = (angle * Math.PI) / 360;
    shapeWidth = length * Math.sin(halfAngleRad) * 2;
    shapeHeight = length * Math.cos(halfAngleRad) + length;
  }

  // Add padding for checkboxes
  const margin = 20;
  const extraInputPadding = 48;

  const totalW = shapeWidth + margin * 2 + extraInputPadding * 2;
  const totalH = shapeHeight + margin * 2 + extraInputPadding * 2;

  // Calculate scaling to fit within the canvas
  const scaleX = width / totalW;
  const scaleY = height / totalH;
  const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down if needed

  // Adjusted dimensions after scaling
  const scaledWidth = shapeWidth * scale;
  const scaledHeight = shapeHeight * scale;

  // Center the shape
  const offsetX = (width - scaledWidth) / 2;
  const offsetY = (height - scaledHeight) / 2;

  const slots: Coordinate[] = [];
  for (let x = 0; x < 4; x++) {
    const count = [checkboxCount.top, checkboxCount.right, checkboxCount.bottom, checkboxCount.left][x];
    for (let y = 0; y < count; y++) {
      slots.push({ x, y });
    }
  }

  const getOffset = ({ x, y }: Coordinate) => {
    const sideCounts = [checkboxCount.top, checkboxCount.right, checkboxCount.bottom, checkboxCount.left];
    const count = sideCounts[x];
    const step = (x % 2 === 0 ? shapeWidth : shapeHeight) / (count + 1);
    let px: number, py: number;

    // Define an outward offset to move slots away from the shape's edges
    const slotOffset = 10; // Adjust this value to control how far the slots are from the shape

    if (x === 0) { // top
      px = step * (y + 1);
      py = 0 - slotOffset; // Move upward
    } else if (x === 1) { // right
      px = shapeWidth + slotOffset; // Move right
      py = step * (y + 1);
    } else if (x === 2) { // bottom
      px = step * (y + 1);
      py = shapeHeight + slotOffset; // Move downward
    } else { // left
      px = 0 - slotOffset; // Move left
      py = step * (y + 1);
    }

    // Apply scaling and centering
    px = px * scale + offsetX;
    py = py * scale + offsetY;

    return { x: px, y: py };
  };

  const getOffsetInput = ({ x, y }: Coordinate) => {
    const base = getOffset({ x, y });
  
    if (x === 0) {
      return { x: base.x, y: base.y - 12 }; // top → move up
    }
    if (x === 1) {
      return { x: base.x + 12, y: base.y }; // right → shift right
    }
    if (x === 2) {
      return { x: base.x, y: base.y + 12 }; // bottom → move down
    }
    if (x === 3) {
      return { x: base.x - 12, y: base.y }; // left → shift left
    }
  
    return base;
  };

  if (mode === 'view') {
    return (
      <ShapeCanvasView
        ShapeComponent={ShapeComponent}
        shapeProps={shapeProps}
        width={width}
        height={height}
        slots={slots}
        getOffset={getOffset}
        selectedCoords={selectedCoords}
        scale={scale}
        offsetX={offsetX}
        offsetY={offsetY}
      />
    );
  }

  else if (mode === 'edit') {
    return (
      <ShapeCanvasEdit
        onToggleCoord={onToggleCoord}
        ShapeComponent={ShapeComponent}
        shapeProps={shapeProps}
        width={width}
        height={height}
        slots={slots}
        getOffset={getOffset}
        selectedCoords={selectedCoords}
        scale={scale}
        offsetX={offsetX}
        offsetY={offsetY}
      />
    );
  }
  else if (mode === 'input') {
    const inputValues = rowIndex !== undefined && rowInputs ? rowInputs[rowIndex] || {} : {};
  
    const handleInputChange = (coord: Coordinate, value: number) => {
      const key = `${coord.x}-${coord.y}`;
      if (rowIndex !== undefined && setInputValue) {
        setInputValue(rowIndex, key, value);
      }
    };
  
    return (
      <ShapeCanvasInput
        ShapeComponent={ShapeComponent}
        shapeProps={shapeProps}
        width={width}
        height={height}
        slots={slots}
        getOffset={getOffsetInput}
        inputValues={inputValues}
        onInputChange={handleInputChange}
        scale={scale}
        offsetX={offsetX}
        offsetY={offsetY}
        rowIndex={rowIndex!}
        setShapeInputRef={setShapeInputRef}
        handleShapeKeyDown={handleShapeKeyDown}
      />
    );
  }
}