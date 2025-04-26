import { useState, useCallback, useRef } from "react";
import { Table, TableRow } from "@prisma/client";
import {
  serializeSquareConfig,
  serializeLineConfig,
  serializeConnectedLinesConfig,
  serializeShapeWithInputs,
} from "@/lib/serializer/serializeShapeConfig";
import { parseGeneralConfig } from "@/lib/parser/parseShapeConfig";

type EditableRow = Omit<TableRow, "id" | "createdAt" | "updatedAt">;
type EditableTable = Omit<Table, "createdAt" | "updatedAt"> & {
  createdAt: Date;
  updatedAt: Date;
  rows: EditableRow[];
};

interface UseTableEditorParams {
  initialTable?: {
    id: number;
    name: string;
    rows: EditableRow[];
  };
  initialImportedRows?: EditableRow[];
}

export function useTableEditor({ initialTable, initialImportedRows }: UseTableEditorParams) {
  const [name, setName] = useState(initialTable?.name || '');
  const [table, _setTable] = useState<EditableTable>({
    id: 0,
    name: "New Table",
    createdAt: new Date(),
    updatedAt: new Date(),
    rows: initialImportedRows ? 
      initialImportedRows.map((row, index) => ({
          tableId: 0,
          // adapt based on your table shape
          oblikIMere: "",
          diameter: row.diameter ?? null,
          lg: row.lg ?? null,
          n: row.n ?? null,
          lgn: row.lgn ?? null,
      }))
    :
      [
        {
          oblikIMere: "",
          diameter: null,
          lg: null,
          n: null,
          lgn: null,
          tableId: 0,
        },
      ],
  });

  const [isSaving, _setIsSaving] = useState(false);
  const [saved, _setSaved] = useState(false);
  const [isSuperAdmin, _setIsSuperAdmin] = useState(false);
  const nextFocusRef = useRef<HTMLInputElement>(null);
  const inputRefs = useRef<HTMLInputElement[][]>([]);

  const [rowInputs, setRowInputs] = useState<Record<number, Record<string, number>>>({});
  const setInputValue = (rowIndex: number, key: string, value: number) => {
    setRowInputs((prev) => ({
      ...prev,
      [rowIndex]: {
        ...prev[rowIndex],
        [key]: value,
      },
    }));
  };

  const handleSave = async (): Promise<EditableRow[]> => {
    if (!table.name.trim()) throw new Error("Table name is required");
  
    setSaving(true);
    setSavedStatus(false);
  
    const rows = finalizeRowsForSave();
  
    return rows;
  };

  const updateName = (name: string) => {
    _setTable((prev) => ({ ...prev, name }));
  };

  const setSaving = (val: boolean) => _setIsSaving(val);
  const setSavedStatus = (val: boolean) => _setSaved(val);
  const markAsSuperAdmin = (val: boolean) => _setIsSuperAdmin(val);

  const resetEditor = () => {
    _setTable({
      id: 0,
      name: "New Table",
      createdAt: new Date(),
      updatedAt: new Date(),
      rows: [
        {
          oblikIMere: "",
          diameter: null,
          lg: null,
          n: null,
          lgn: null,
          tableId: 0,
        },
      ],
    });
    _setSaved(false);
  };

  const addRow = useCallback(() => {
    _setTable((prev) => ({
      ...prev,
      rows: [
        ...prev.rows,
        {
          oblikIMere: "",
          diameter: null,
          lg: null,
          n: null,
          lgn: null,
          tableId: prev.id,
        },
      ],
    }));
  }, []);

  const deleteRow = useCallback((index: number) => {
    _setTable((prev) => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== index),
    }));
  }, []);

  const updateRow = useCallback(
    (index: number, field: keyof EditableRow, value: string | number) => {
      _setTable((prev) => {
        const currentValue = prev.rows[index]?.[field];
        const parsedValue =
          value === "" ? null : typeof value === "string" ? value : Number(value);

        if (currentValue === parsedValue) return prev;

        const updatedRows = prev.rows.map((row, i) =>
          i !== index
            ? row
            : {
                ...row,
                [field]: parsedValue,
              }
        );

        return {
          ...prev,
          rows: updatedRows,
        };
      });
    },
    []
  );

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    row: number,
    col: number
  ) => {
    const maxRow = table.rows.length;
    const maxCol = 4;

    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
      e.preventDefault();
      addRow();
      setTimeout(() => {
        inputRefs.current[maxRow]?.[0]?.focus();
      }, 50);
      return;
    }

    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "d") {
      e.preventDefault();
      deleteRow(row);
      setTimeout(() => {
        const next = Math.min(row, table.rows.length - 1);
        inputRefs.current[next]?.[col]?.focus();
      }, 50);
      return;
    }

    if (e.key === "Delete") {
      e.preventDefault();
      deleteRow(row);
      setTimeout(() => {
        const next = Math.min(row, table.rows.length - 1);
        inputRefs.current[next]?.[col]?.focus();
      }, 50);
      return;
    }

    if (e.key === "Backspace") {
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      addRow();
      setTimeout(() => {
        inputRefs.current[row + 1]?.[col]?.focus();
      }, 50);
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const nextCol = col + 1;
      if (nextCol <= maxCol) {
        inputRefs.current[row]?.[nextCol]?.focus();
      } else {
        addRow();
        setTimeout(() => {
          inputRefs.current[row + 1]?.[0]?.focus();
        }, 50);
      }
      return;
    }

    if (e.ctrlKey) {
      e.preventDefault();
      switch (e.key) {
        case "ArrowUp":
          inputRefs.current[0]?.[col]?.focus();
          return;
        case "ArrowDown":
          inputRefs.current[maxRow - 1]?.[col]?.focus();
          return;
        case "ArrowRight":
          inputRefs.current[row]?.[maxCol]?.focus();
          return;
      }
    }

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        inputRefs.current[Math.max(0, row - 1)]?.[col]?.focus();
        break;
      case "ArrowDown":
        e.preventDefault();
        inputRefs.current[Math.min(maxRow - 1, row + 1)]?.[col]?.focus();
        break;
      case "ArrowLeft":
        e.preventDefault();
        inputRefs.current[row]?.[Math.max(0, col - 1)]?.focus();
        break;
      case "ArrowRight":
        e.preventDefault();
        inputRefs.current[row]?.[Math.min(maxCol, col + 1)]?.focus();
        break;
      default:
        return;
    }
  };

  const setExistingTable = (existing: EditableTable) => {
    _setTable(existing);
  };

  // ✅ this is used during save()
  const finalizeRowsForSave = (): EditableRow[] => {
    return table.rows.map((row, index) => {
      const shapeType = row.oblikIMere?.split(";")[0];
      const parsed = parseGeneralConfig(row.oblikIMere || "");
      const inputs = rowInputs[index] || {};
      let base = row.oblikIMere || "";

      if(parsed == "Invalid") {

      } else if (shapeType === "SquareWithTail") {
        base = serializeSquareConfig(parsed);
      } else if (shapeType === "Line") {
        base = serializeLineConfig(parsed);
      } else if (shapeType === "ConnectingLines") {
        base = serializeConnectedLinesConfig(parsed);
      }

      return {
        ...row,
        oblikIMere: serializeShapeWithInputs(base, inputs),
      };
    });
  };

  return {
    table,
    isSaving,
    saved,
    isSuperAdmin,
    nextFocusRef,
    inputRefs,

    updateName,
    setSaving,
    setSavedStatus,
    markAsSuperAdmin,
    resetEditor,

    addRow,
    deleteRow,
    updateRow,
    handleKeyDown,
    setExistingTable,

    // ✅ added:
    setInputValue,
    finalizeRowsForSave,
    rowInputs,
    handleSave
  };
}
