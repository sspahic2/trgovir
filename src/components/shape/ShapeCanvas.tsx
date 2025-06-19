'use client';

import React from 'react';
import SquareWithTailShape, { checkboxCount as squareCheckboxCount, SquareWithTailProps } from './SquareWithTail';
import LineShape, { checkboxCount as lineCheckboxCount, LineShapeProps } from './Line';
import ConnectedLinesShape, { checkboxCount as connectedCheckboxCount, ConnectedLinesShapeProps } from './ConnectingLines';
import { ShapeType, Coordinate, CanvasMode } from '@/models/ShapeConfiguration';
import ShapeCanvasView from './ShapeCanvasView';
import ShapeCanvasEdit from './ShapeCanvasEdit';
import ShapeCanvasInput from './ShapeCanvasInput';
import { parseGeneralConfig } from '@/lib/parser/parseShapeConfig';
import SquareWithTwoTailShape, { checkboxCount as squareTwoCheckboxCount, SquareWithTwoTailProps } from './SquareWithTwoTail';
import SquareWithTwoTailDoubleShape, { checkboxCount as squareTwoDoubleCheckboxCount, SquareWithTwoTailDoubleProps, innerCheckboxCount as squareTwoDoubleInnerCheckboxCount } from './SquareWithTwoTailDouble';
import SquareWithMissingSide, { checkboxCount as squareWithMissingSideCheckboxCount, SquareWithMissingSideProps } from './SquareWithMissingSide';
import SquareWithIndependentTails, { innerCheckboxCount as independentTailInnerCheckboxCount, checkboxCount as independentTailCheckboxCount, SquareWithIndependentTailsProps } from './SquareWithIndependentTails';

interface ShapeCanvasProps {
  selectedCoords?: Coordinate[];
  onToggleCoord?: (coord: Coordinate) => void;
  mode?: CanvasMode;
  width?: number;
  height?: number;
  rowIndex?: number;
  position?: string;
  setShapeInputRef?: (row: number, key: string, el: HTMLInputElement | null) => void;
  handleShapeKeyDown?: (
    e: React.KeyboardEvent<HTMLInputElement>,
    row: number,
    key: string
  ) => void;
  rowInputs?: Record<string, Record<string, number>>;
  setInputValue?: (ozn:string, position: string, rowIndex: number, key: string, value: number) => void;
  rawConfig?: string;
  ozn?: string;
}

export default function ShapeCanvas({
  selectedCoords = [],
  onToggleCoord = () => {},
  mode = 'view',
  width = 300,
  height = 300,
  rowIndex,
  position,
  setShapeInputRef,
  handleShapeKeyDown,
  setInputValue,
  rowInputs,
  rawConfig,
  ozn
}: ShapeCanvasProps) {
  // Determine which shape component to render and its checkbox counts
  let ShapeComponent: React.FC<any>;
  let checkboxCount: { top: number; right: number; bottom: number; left: number };
  let innerCheckboxCount: { top: number; right: number; bottom: number; left: number } | undefined;
  let shapeProps: any;
  let shapeWidth: number;
  let shapeHeight: number;
  let props, shapeType: string = '';

  if (rawConfig) {
    shapeType = rawConfig.split(';')[0] as ShapeType;
    const parsed = parseGeneralConfig(rawConfig);
    if (shapeType === 'SquareWithTail') props = parsed as SquareWithTailProps;
    else if (shapeType === 'Line') props = parsed as LineShapeProps;
    else if (shapeType === 'ConnectingLines') props = parsed as ConnectedLinesShapeProps;
    else if (shapeType === 'SquareWithTwoTail') props = parsed as SquareWithTwoTailProps;
    else if (shapeType === 'SquareWithTwoTailDouble') props = parsed as SquareWithTwoTailDoubleProps;
    else if (shapeType === 'SquareWithMissingSide') props = parsed as SquareWithMissingSideProps;
    else if (shapeType === 'SquareWithIndependentTails') props = parsed as SquareWithIndependentTailsProps
  }

  if (shapeType === 'SquareWithTail') {
    ShapeComponent = SquareWithTailShape;
    checkboxCount = squareCheckboxCount;
    shapeProps = props;
    shapeWidth = shapeProps.width || 100;
    shapeHeight = shapeProps.height || 100;

    // Adjust for tail length if present
    if (shapeProps.tail) {
      const tailLength = shapeProps?.tail?.length ?? 12;
      shapeWidth += tailLength;
      shapeHeight += tailLength;
    }
  } 
  else if (shapeType === 'SquareWithTwoTail') {
    ShapeComponent = SquareWithTwoTailShape;
    checkboxCount = squareTwoCheckboxCount;
    shapeProps = props;
    shapeWidth = shapeProps.width || 100;
    shapeHeight = shapeProps.height || 100;

    // Adjust for tail length if present
    if (shapeProps.tail) {
      const tailLength = shapeProps?.tail.length || 12;
      shapeWidth += tailLength;
      shapeHeight += tailLength;
    }
  }
  else if (shapeType === 'SquareWithTwoTailDouble') {
    ShapeComponent = SquareWithTwoTailDoubleShape;
    checkboxCount = squareTwoDoubleCheckboxCount;
    innerCheckboxCount = squareTwoDoubleInnerCheckboxCount;
    shapeProps = props;
    shapeWidth = shapeProps.width || 100;
    shapeHeight = shapeProps.height || 100;

    // Adjust for tail length if present
    if (shapeProps.tail) {
      const tailLength = shapeProps?.tail.length || 12;
      shapeWidth += tailLength;
      shapeHeight += tailLength;
    }
  }
  else if (shapeType === 'SquareWithMissingSide') {
    ShapeComponent = SquareWithMissingSide;
    checkboxCount = squareWithMissingSideCheckboxCount;
    shapeProps = props;
    shapeWidth = Math.max(shapeProps.lengths.top, shapeProps.lengths.bottom) + 20;
    shapeHeight = Math.max(shapeProps.lengths.left, shapeProps.lengths.right) + 20;
  }
  else if (shapeType === 'Line') {
    ShapeComponent = LineShape;
    checkboxCount = lineCheckboxCount;
    shapeProps = props;
    const length = shapeProps.length || 100;
    shapeWidth = shapeProps.direction === 'vertical' ? (shapeProps.thickness || 2) : length;
    shapeHeight = shapeProps.direction === 'vertical' ? length : (shapeProps.thickness || 2);
  } 
  else if (shapeType === "SquareWithIndependentTails") {
    ShapeComponent  = SquareWithIndependentTails;
    checkboxCount   = independentTailCheckboxCount;
    shapeProps      = props;
    innerCheckboxCount = independentTailInnerCheckboxCount;
    shapeWidth = Math.max(shapeProps.lengths.top, shapeProps.lengths.bottom);
    shapeHeight = Math.max(shapeProps.lengths.left, shapeProps.lengths.right);
  }
  else {
    ShapeComponent = ConnectedLinesShape;
    checkboxCount = connectedCheckboxCount;
    shapeProps = props;
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
    let slotOffset_h = 20;
    let slotOffset_v = 10

    if(shapeType === 'SquareWithIndependentTails') {
      slotOffset_h = -(shapeWidth / 8);
      slotOffset_v = -(shapeHeight / 8);
    }

    if (x === 0) { // top
      px = step * (y + 1);
      py = 0 - slotOffset_v; // Move upward
    } else if (x === 1) { // right
      px = shapeWidth + slotOffset_h; // Move right
      py = step * (y + 1);
    } else if (x === 2) { // bottom
      px = step * (y + 1);
      py = shapeHeight + slotOffset_v; // Move downward
    } else { // left
      px = 0 - slotOffset_h; // Move left
      py = step * (y + 1);
    }

    // Apply scaling and centering
    px = px * scale + offsetX;
    py = py * scale + offsetY;

    return { x: px, y: py };
  };

  const slotsInner: Coordinate[] = [];
  if (innerCheckboxCount) {
    for (let x = 0; x < 4; x++) {
      const count = [innerCheckboxCount.top, innerCheckboxCount.right, innerCheckboxCount.bottom, innerCheckboxCount.left][x];
      for (let y = 0; y < count; y++) {
        slotsInner.push({ x: x + 4, y });
      }
    }
  }

  const getInnerOffset = ({ x, y }: Coordinate) => {
    const side = x - 4; // shift back to 0–3
    const sideCounts = [innerCheckboxCount!.top, innerCheckboxCount!.right, innerCheckboxCount!.bottom, innerCheckboxCount!.left];
    const count = sideCounts[side];
    const step = (side % 2 === 0 ? shapeWidth : shapeHeight) / (count + 1);
    let px: number, py: number;

    let offset_h = 30;
    let offset_v = 30
    if(shapeType === 'SquareWithIndependentTails') {
      offset_h = shapeWidth * 2 / 6
      offset_v = shapeHeight * 2 / 6
    }

    if (side=== 0) {
      px = step * (y + 1);
      py = offset_v;
    } else if (side === 1) {
      px = shapeWidth - offset_h;
      py = step * (y + 1);
    } else if (side === 2) {
      px = step * (y + 1);
      py = shapeHeight - offset_v;
    } else {
      px = offset_h;
      py = step * (y + 1);
    }

    return {
      x: px * scale + offsetX,
      y: py * scale + offsetY
    };
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
        innerSlots={slotsInner}
        getInnerOffset={getInnerOffset}
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
        innerSlots={slotsInner}
        getInnerOffset={getInnerOffset}
      />
    );
  }
  else if (mode === 'input') {
    const inputValues = rowIndex !== undefined && rowInputs ? rowInputs[`${position}-${rowIndex}-${ozn}`] || {} : {};
  
    const handleInputChange = (coord: Coordinate, value: number) => {
      const key = `${coord.x}-${coord.y}`;
      if (rowIndex !== undefined && setInputValue) {
        setInputValue(ozn!, position!, rowIndex, key, value);
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
        innerSlots={slotsInner}
        getInnerOffset={getInnerOffset}
      />
    );
  }
}