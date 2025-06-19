import { useState, useCallback, useRef, useMemo } from "react";
import {
  serializeSquareConfig,
  serializeLineConfig,
  serializeConnectedLinesConfig,
  serializeShapeWithInputs,
} from "@/lib/serializer/serializeShapeConfig";
import { parseGeneralConfig } from "@/lib/parser/parseShapeConfig";
import { TableRow } from "@/models/TableRow";
import { Table } from "@/models/Table";

export type EditableRow = Omit<TableRow, "id" | "createdAt" | "updatedAt">;
export type EditableTable = Omit<Table, "createdAt" | "updatedAt"> & {
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
  const [table, _setTable] = useState<EditableTable>(
    initialTable ?
    { createdAt: new Date(), updatedAt: new Date(), ...initialTable}
    :
    {
      id: 0,
      name: "New Table",
      createdAt: new Date(),
      updatedAt: new Date(),
      rows: initialImportedRows ? 
        initialImportedRows.map((row, index) => ({
            tableId: 0,
            // adapt based on your table shape
            oblikIMere: row.oblikIMere,
            diameter: row.diameter ?? null,
            lg: row.lg ?? null,
            n: row.n ?? null,
            lgn: row.lgn ?? null,
            position: row.position ?? undefined,
            ozn: row.ozn
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
            position: "Nije naznačeno",
            ozn: "1"
          },
        ]
    }
  );
  const groupingByPositionGenerator = (rows: EditableRow[]) => {
    return Object.entries(
      rows.reduce((acc, row) => {
        const key = row.position || "Unspecified";
        if (!acc[key]) acc[key] = [];
        acc[key].push(row);
        return acc;
      }, {} as Record<string, typeof table.rows>)
    ).map(([position, rows], idx) => ({
      position,
      rows,
      positionIndex: idx,
    }));
  }

  const groupingByPosition = useMemo(() => groupingByPositionGenerator(table.rows), [table.rows]);


  const [isSaving, _setIsSaving] = useState(false);
  const [saved, _setSaved] = useState(false);
  const [isSuperAdmin, _setIsSuperAdmin] = useState(false);

  const handleSave = async (rowInputs: Record<string, Record<string, number>>): Promise<EditableRow[]> => {
    if (!table.name.trim()) throw new Error("Table name is required");
  
    setSaving(true);
    setSavedStatus(false);
  
    const rows = finalizeRowsForSave(rowInputs);
    return rows;
  };

  function updateTableField<K extends keyof EditableTable>(field: K, value: EditableTable[K]) {
    _setTable((prev) => ({ ...prev, [field]: value }));
  }

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
          ozn: "1",
          diameter: null,
          lg: null,
          n: null,
          lgn: null,
          tableId: 0,
          position: "Nije naznačeno"
        },
      ],
    });
    _setSaved(false);
  };

const addRow = useCallback((position?: string) => {
  _setTable((prev) => {
    const targetPosition = position ?? "Nije naznačeno";
    const newOzn = "1";
    return {
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
          position: targetPosition,
          ozn: newOzn,
        },
      ],
    };
  });
}, []);

  const deleteRow = useCallback((position: string, indexInGroup: number) => {
    _setTable(prev => {
      let groupIndex = -1;
      return {
        ...prev,
        rows: prev.rows.filter(row => {
          if ((row.position || "Unspecified") === position) {
            groupIndex += 1;
            if (groupIndex === indexInGroup) return false;
          }
          return true;
        }),
      };
    });
  }, []);

  const updateRow = useCallback((position: string, indexInGroup: number, updatedFields: Partial<TableRow>) => {
    _setTable(prev => {
      let groupIndex = -1;
      return {
        ...prev,
        rows: prev.rows.map(row => {
          if ((row.position || "Unspecified") === position) {
            groupIndex += 1;
            if (groupIndex === indexInGroup) {
              return { ...row, ...updatedFields };
            }
          }
          return row;
        }),
      };
    });
  }, []);

  const updatePositionForGroup = useCallback((oldPosition: string, newPosition: string) => {
    _setTable(prev => {
      // Update all rows in prev.rows that match oldPosition
      return {
        ...prev,
        rows: prev.rows.map(row =>
          row.position === oldPosition ? { ...row, position: newPosition } : row
        ),
      };
    });
  }, []);

  // ✅ this is used during save()
  const finalizeRowsForSave = (rowInputs: Record<string, Record<string, number>>): EditableRow[] => {
    let result: EditableRow[] = [];

    groupingByPosition.map((pos) => {
      pos.rows.map((row, index) => {
        const inputs = rowInputs[`${row.position}-${index}-${row.ozn}`] || {};
        result.push({
          ...row,
          oblikIMere: serializeShapeWithInputs(row.oblikIMere, inputs),
        });
      })
    })

    return result;
  };

  return {
    table,
    isSaving,
    saved,
    isSuperAdmin,
    groupingByPosition,

    updateTableField,
    setSaving,
    setSavedStatus,
    markAsSuperAdmin,
    resetEditor,

    addRow,
    deleteRow,
    updateRow,
    updatePositionForGroup,

    finalizeRowsForSave,
    handleSave
  };
}
