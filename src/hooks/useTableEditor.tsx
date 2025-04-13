import { useCallback, useRef, useState, KeyboardEvent } from "react";
import type { TableRow } from "@/models/TableRow";
import { EmailService } from "@/services/email.service";
import { TableService } from "@/services/table.service";

export function useTableEditor() {
  const [rows, setRows] = useState<TableRow[]>([]);
  const [saved, setSaved] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const nextFocusRef = useRef<HTMLInputElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);


  const reindexRows = (input: TableRow[]) =>
    input.map((row, i) => ({ ...row, id: i + 1 }));

  const initIfSuperAdmin = useCallback(async (email: string | undefined | null, onFail: () => void) => {
    if (!email) return;
    const isAdmin = await EmailService.isSuperAdmin(email);
    if (!isAdmin) return onFail();
    setIsSuperAdmin(true);
    setRows([{ id: 1, oblikIMere: "", diameter: null, lg: null, n: null, lgn: null }]);
  }, []);

  const handleAddRow = (index?: number) => {
    setRows((prev) => {
      const newRow: TableRow = {
        id: prev.length + 1,
        oblikIMere: "",
        diameter: null,
        lg: null,
        n: null,
        lgn: null,
      };
      const updated = [...prev];
      if (index !== undefined) updated.splice(index + 1, 0, newRow);
      else updated.push(newRow);
      return reindexRows(updated);
    });
    setTimeout(() => nextFocusRef.current?.focus(), 0);
  };

  const handleDeleteRow = (id: number) => {
    setRows((prev) => reindexRows(prev.filter((row) => row.id !== id)));
  };

  const handleChange = (id: number, key: keyof Omit<TableRow, "id" | "oblikIMere">, value: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [key]: value === "" ? null : parseFloat(value) } : row
      )
    );
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddRow(index);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
  
      for (const row of rows) {
        await TableService.createRow({
          oblikIMere: row.oblikIMere,
          diameter: row.diameter,
          lg: row.lg,
          n: row.n,
          lgn: row.lgn,
        });
      }
  
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setIsSaving(false);
    }
  };
  

  return {
    rows,
    setRows,
    saved,
    setSaved,
    isSuperAdmin,
    nextFocusRef,
    handleAddRow,
    handleDeleteRow,
    handleChange,
    handleKeyDown,
    initIfSuperAdmin,
    handleSave,
    isSaving,
  };
}