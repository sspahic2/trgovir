import { useState } from 'react';
import type { ShapeConfiguration } from '@/models/ShapeConfiguration';
import { TableRow } from '@/models/TableRow';

export function useShapePickerSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [rowIndex, setRowIndex] = useState<number | null>(null);
  const [position, setPosition] = useState<string | null>(null);
  const [ozn, setOzn] = useState<number | null>(null);

  const openForRow = (rowIndex: number, position: string, ozn: number) => {
    setRowIndex(rowIndex);
    setPosition(position);
    setOzn(ozn);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(!isOpen);
    setRowIndex(null);
    setOzn(null);
    setPosition(null);
  };

  const handleShapeSelected = (
    shape: ShapeConfiguration,
    updateRow: (position: string, index: number, updated: Partial<TableRow>) => void
  ) => {
    if (rowIndex == null || !position) return;

    updateRow(position, rowIndex, { oblikIMere: shape.configuration });
    close();
  };

  return {
    isOpen,
    rowIndex,
    position,
    ozn,
    openForRow,
    close,
    handleShapeSelected,
  };
}
