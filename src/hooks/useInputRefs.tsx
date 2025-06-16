'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { EditableRow } from './useTableEditor';
import { ShapeConfiguration } from '@/models/ShapeConfiguration';
import { parseInputValues } from '@/lib/parser/parseShapeConfig';

export function useInputRefs(
  table: {
    position: string;
    rows: EditableRow[];
    positionIndex: number;
  }[] | null,
  shapeOptions: ShapeConfiguration[]
) {
  const tableInputRefs = useRef<Record<string, (HTMLInputElement | null)[][]>>({});
  const NAV_KEYS: Record<string, string> = {
    ArrowUp: 'ArrowUp',
    ArrowDown: 'ArrowDown',
    ArrowLeft: 'ArrowLeft',
    ArrowRight: 'ArrowRight',
    Enter: 'Enter',
    Tab: 'Tab',
  };

  const setTableRef = (position: string, row: number, col: number, el: HTMLInputElement | null) => {
    if (!tableInputRefs.current[position]) tableInputRefs.current[position] = [];
    if (!tableInputRefs.current[position][row]) tableInputRefs.current[position][row] = [];
    tableInputRefs.current[position][row][col] = el;
  };

  const handleTableKeyDown = useCallback(
    (
      e: React.KeyboardEvent<HTMLInputElement>,
      positionIndex: number,
      row: number,
      col: number,
      totalPositions: number
    ) => {
      if (!NAV_KEYS[e.key]) return;

      const allKeys = Object.keys(tableInputRefs.current);
      const position = allKeys[positionIndex];
      if (position === undefined) return;

      const groupRefs = tableInputRefs.current[position] || [];
      const maxRow = groupRefs.length;
      const maxCol = 5;

      if (e.key === 'ArrowUp') {
        if (!e.shiftKey) return;
        e.preventDefault();
        if (row > 0) groupRefs[row - 1]?.[col]?.focus();
        else if (positionIndex > 0) {
          const prevKey = allKeys[positionIndex - 1];
          const prevGroup = tableInputRefs.current[prevKey] || [];
          const lastRow = prevGroup.length - 1;
          if (lastRow >= 0) prevGroup[lastRow]?.[col]?.focus();
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        if (!e.shiftKey) return;
        e.preventDefault();
        if (row < maxRow - 1) groupRefs[row + 1]?.[col]?.focus();
        else if (positionIndex < totalPositions - 1) {
          const nextKey = allKeys[positionIndex + 1];
          const nextGroup = tableInputRefs.current[nextKey] || [];
          nextGroup[0]?.[col]?.focus();
        }
        return;
      }

      if (e.key === 'ArrowLeft') {
        if (!e.shiftKey) return;
        e.preventDefault();
        const prevCol = Math.max(0, col - 1);
        groupRefs[row]?.[prevCol]?.focus();
        return;
      }

      if (e.key === 'ArrowRight') {
        if (!e.shiftKey) return;
        e.preventDefault();
        const nextCol = Math.min(maxCol, col + 1);
        groupRefs[row]?.[nextCol]?.focus();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (row < maxRow - 1) groupRefs[row + 1]?.[col]?.focus();
        else if (positionIndex < totalPositions - 1) {
          const nextKey = allKeys[positionIndex + 1];
          const nextGroup = tableInputRefs.current[nextKey] || [];
          nextGroup[0]?.[col]?.focus();
        }
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        let nextCol = col + 1;
        let nextRow = row;
        if (nextCol > maxCol) {
          nextCol = 0;
          nextRow = row + 1;
        }
        if (nextRow < maxRow) {
          groupRefs[nextRow]?.[nextCol]?.focus();
        } else if (positionIndex < totalPositions - 1) {
          const nextKey = allKeys[positionIndex + 1];
          const nextGroup = tableInputRefs.current[nextKey] || [];
          nextGroup[0]?.[nextCol]?.focus();
        }
        return;
      }
    },
    []
  );

  const shapeRefs = useRef<Record<number, Record<string, HTMLInputElement | null>>>({});

  const setShapeRef = (row: number, key: string, el: HTMLInputElement | null) => {
    if (!shapeRefs.current[row]) shapeRefs.current[row] = {};
    shapeRefs.current[row][key] = el;
  };

  const handleShapeKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, row: number, key: string) => {
      const [x, y] = key.split('-').map(Number);
      const dirMap: Record<string, [number, number]> = {
        ArrowUp: [x, y - 1],
        ArrowDown: [x, y + 1],
        ArrowLeft: [x - 1, y],
        ArrowRight: [x + 1, y],
      };
      const dir = dirMap[e.key];
      if (!dir) return false;

      const nextKey = `${dir[0]}-${dir[1]}`;
      const nextRef = shapeRefs.current[row]?.[nextKey];
      if (nextRef) {
        e.preventDefault();
        nextRef.focus();
        return true;
      }
      return false;
    },
    []
  );

  function buildRowInputs(
    t: {
      position: string;
      rows: EditableRow[];
      positionIndex: number;
    }[] | null,
    shapes: ShapeConfiguration[]
  ) {
    if (!t || shapes.length === 0) return {};
    const result: Record<string, Record<string, number>> = {};
    for (const block of t) {
      block.rows.forEach((row, rowIndex) => {
        const shape = shapes.find((s) => row.oblikIMere.includes(s.configuration));
        if (!shape?.selectedCoords) return;
        const inputs = parseInputValues(row.oblikIMere);
        const coords: Record<string, number> = {};
        for (const { x, y } of shape.selectedCoords) coords[`${x}-${y}`] = inputs[`${x}-${y}`] ?? 0;
        result[`${block.position}-${rowIndex}-${row.ozn}`] = coords;
      });
    }
    return result;
  }

  const [rowInputs, setRowInputs] = useState<Record<string, Record<string, number>>>(
    () => buildRowInputs(table, shapeOptions)
  );

  useEffect(() => {
    setRowInputs((prev) => {
      const base = buildRowInputs(table, shapeOptions);
      for (const key in prev) {
        if (base[key]) base[key] = { ...base[key], ...prev[key] };
        else base[key] = prev[key];
      }
      return base;
    });
  }, [table, shapeOptions]);

  const setInputValue = (
    ozn: number,
    position: string,
    rowIndex: number,
    key: string,
    value: number
  ) => {
    const compositeKey = `${position}-${rowIndex}-${ozn}`;
    setRowInputs((prev) => ({
      ...prev,
      [compositeKey]: {
        ...prev[compositeKey],
        [key]: value,
      },
    }));
  };

  const renameRowKey = (oldKey: string, newKey: string) =>
  setRowInputs(prev => {
    if (!prev[oldKey]) return prev;
    const { [oldKey]: val, ...rest } = prev;
    return { ...rest, [newKey]: val };
  });

  return {
    tableInputRefs,
    setTableRef,
    handleTableKeyDown,
    shapeRefs,
    setShapeRef,
    handleShapeKeyDown,
    rowInputs,
    setInputValue,
    renameRowKey
  };
}
