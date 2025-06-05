// src/hooks/useInputRefs.tsx
'use client';

import { useRef, useCallback } from 'react';

export function useInputRefs() {

  const tableInputRefs = useRef<Record<string, ( HTMLInputElement | null ) [][]>>({});
  const NAV_KEYS: Record<string, string>  = {
    'ArrowUp': 'ArrowUp',
    'ArrowDown': 'ArrowDown',
    'ArrowLeft': 'ArrowLeft',
    'ArrowRight': 'ArrowRight',
    'Enter': 'Enter',
    'Tab': 'Tab',
  };
  
  const setTableRef = (
    position: string,
    row: number,
    col: number,
    el: HTMLInputElement | null
  ) => {
    if (!tableInputRefs.current[position]) {
      tableInputRefs.current[position] = [];
    }
    if (!tableInputRefs.current[position][row]) {
      tableInputRefs.current[position][row] = [];
    }
    tableInputRefs.current[position][row][col] = el;
  };

  /**
   * Handle arrow/tab navigation. First line checks “is this one of the keys we care about?”
   * If not, we return immediately to avoid any expensive work.
   *
   * @param e                Keyboard event
   * @param positionIndex    Which position‐block index you’re in (0..totalPositions-1)
   * @param row              The row index within that block
   * @param col              The column index (0..5)
   * @param totalPositions   How many position‐blocks exist in total
   */
  const handleTableKeyDown = useCallback(
    (
      e: React.KeyboardEvent<HTMLInputElement>,
      positionIndex: number,
      row: number,
      col: number,
      totalPositions: number
    ) => {
      // ─── 0) If this is NOT one of our navigation keys → bail out immediately ─────
      if (!NAV_KEYS[e.key]) {
        // Do NOT call e.preventDefault(); just return.
        return;
      }

      // Reconstruct the array of all position‐keys in insertion order:
      const allKeys = Object.keys(tableInputRefs.current);
      const position = allKeys[positionIndex];
      if (position === undefined) {
        return;
      }

      const groupRefs = tableInputRefs.current[position] || [];
      const maxRow = groupRefs.length;
      const maxCol = 5; // 6 columns: 0..5

      // ─── ARROW UP ─────────────────────────────────────────────────────────
      if (e.key === 'ArrowUp') {
        if (!e.shiftKey) return;
        e.preventDefault();
        if (row > 0) {
          groupRefs[row - 1]?.[col]?.focus();
        } else {
          // jump to last row of previous position
          if (positionIndex > 0) {
            const prevKey = allKeys[positionIndex - 1];
            const prevGroup = tableInputRefs.current[prevKey] || [];
            const lastRow = prevGroup.length - 1;
            if (lastRow >= 0) {
              prevGroup[lastRow]?.[col]?.focus();
            }
          }
        }
        return;
      }

      // ─── ARROW DOWN ───────────────────────────────────────────────────────
      if (e.key === 'ArrowDown') {
        if (!e.shiftKey) return;
        e.preventDefault();
        if (row < maxRow - 1) {
          groupRefs[row + 1]?.[col]?.focus();
        } else {
          // jump to first row of next position
          if (positionIndex < totalPositions - 1) {
            const nextKey = allKeys[positionIndex + 1];
            const nextGroup = tableInputRefs.current[nextKey] || [];
            nextGroup[0]?.[col]?.focus();
          }
        }
        return;
      }

      // ─── ARROW LEFT ────────────────────────────────────────────────────────
      if (e.key === 'ArrowLeft') {
        if (!e.shiftKey) return;
        e.preventDefault();
        const prevCol = Math.max(0, col - 1);
        groupRefs[row]?.[prevCol]?.focus();
        return;
      }

      // ─── ARROW RIGHT ───────────────────────────────────────────────────────
      if (e.key === 'ArrowRight') {
        if (!e.shiftKey) return;
        e.preventDefault();
        const nextCol = Math.min(maxCol, col + 1);
        groupRefs[row]?.[nextCol]?.focus();
        return;
      }

      // ─── ENTER ───────────────────────────────────────────────────────────────
      if (e.key === 'Enter') {
        e.preventDefault();
        if (row < maxRow - 1) {
          groupRefs[row + 1]?.[col]?.focus();
        } else {
          if (positionIndex < totalPositions - 1) {
            const nextKey = allKeys[positionIndex + 1];
            const nextGroup = tableInputRefs.current[nextKey] || [];
            nextGroup[0]?.[col]?.focus();
          }
        }
        return;
      }

      // ─── TAB ─────────────────────────────────────────────────────────────────
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
        } else {
          if (positionIndex < totalPositions - 1) {
            const nextKey = allKeys[positionIndex + 1];
            const nextGroup = tableInputRefs.current[nextKey] || [];
            nextGroup[0]?.[nextCol]?.focus();
          }
        }
        return;
      }

      return e;
    },
    []
  );

  //
  // ─── 2) SHAPE INPUTS ─────────────────────────────────────────────────────────────
  //
  // We'll store shapeRefs.current[row][key] = HTMLInputElement | null, where key = `${x}-${y}`
  //
  const shapeRefs = useRef<Record<number, Record<string, HTMLInputElement | null>>>({});

  const setShapeRef = (row: number, key: string, el: HTMLInputElement | null) => {
    if (!shapeRefs.current[row]) {
      shapeRefs.current[row] = {};
    }
    shapeRefs.current[row][key] = el;
  };

  // Keyboard navigation for shape inputs: if user presses an arrow key within a shape-slot, move to adjacent slot (same row)
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
      if (!dir) {
        return false;
      }

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

  return {
    // TABLE
    tableInputRefs,
    setTableRef,
    handleTableKeyDown,

    // SHAPE
    shapeRefs,
    setShapeRef,
    handleShapeKeyDown,
  };
}
