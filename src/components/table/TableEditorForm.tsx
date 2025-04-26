'use client';

import React, { useEffect, useState } from "react";
import PrettyInput from "@/components/common/input/PrettyInput";
import PrettyButton from "@/components/common/button/PrettyButton";
import PrettySidebar from "@/components/common/sidebar/PrettySidebar";
import { PlusCircle, Trash2 } from "lucide-react";
import { useTableEditor } from "@/hooks/useTableEditor";
import { EmailService } from "@/services/email.service";
import { useRouter } from "next/navigation";
import type { TableRow } from "@prisma/client";
import SquareWithTailShape, { SquareWithTailProps } from "@/components/shape/SquareWithTail";
import LineShape, { LineShapeProps } from "@/components/shape/Line";
import ConnectedLinesShape, { ConnectedLinesShapeProps } from "@/components/shape/ConnectingLines";
import type { ShapeConfiguration, ShapeType } from "@/models/ShapeConfiguration";
import ShapeCard from "../shape/ShapeCard";
import { parseGeneralConfig, parseInputValues } from "@/lib/parser/parseShapeConfig";
import ShapeCanvas from "../shape/ShapeCanvas";
import { useShapeInputRefs } from "@/hooks/useShapeInputRefs";

interface TableEditorFormProps {
  mode: 'create' | 'update';
  onSave: (
    name: string,
    rows: Omit<TableRow, 'id' | 'createdAt' | 'updatedAt'>[]
  ) => Promise<void>;
  onCancel?: () => void;
  initialTable?: {
    id: number;
    name: string;
    rows: Omit<TableRow, 'id' | 'createdAt' | 'updatedAt'>[];
  };
  userEmail: string;
  shapeOptions: ShapeConfiguration[];
  importedRows?: TableRow[];
}

export default function TableEditorForm({
  mode,
  onSave,
  onCancel,
  initialTable,
  userEmail,
  shapeOptions,
  importedRows
}: TableEditorFormProps) {
  const router = useRouter();
  const {
    table,
    updateName,
    isSaving,
    setSaving,
    saved,
    setSavedStatus,
    isSuperAdmin,
    markAsSuperAdmin,
    nextFocusRef,
    addRow,
    deleteRow,
    updateRow,
    handleKeyDown,
    resetEditor,
    setExistingTable,
    inputRefs,
    rowInputs,
    setInputValue,
    handleSave: handleSaveHook
  } = useTableEditor({  initialTable,
    initialImportedRows: importedRows});

  // index of row currently picking a shape
  const [pickingRowIndex, setPickingRowIndex] = useState<number | null>(null);
  
  const {
    shapeRefs,
    setRef: setShapeInputRef,
    handleKeyDown: rawHandleShapeKeyDown
  } = useShapeInputRefs();
  
  const handleShapeKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    row: number,
    key: string
  ) => {
    // First: try to move inside shape
    const moved = rawHandleShapeKeyDown(e, row, key);
    if (moved) return;
  
    // Then: special Ctrl cases
    if (e.ctrlKey && e.key === "ArrowLeft") {
      e.preventDefault();
  
      // Jump to rightmost slot in the shape's grid
      const slotMap = shapeRefs.current[row];

      if (slotMap) {
        const keys = Object.keys(slotMap).filter(k => k.includes("-"));
        // Sort to get the rightmost slot: prioritize highest x, then highest y
        const sorted = keys.sort((a, b) => {
          const [ax, ay] = a.split("-").map(Number);
          const [bx, by] = b.split("-").map(Number);
          // Prioritize right side (x=1), then highest y
          if (ax !== bx) return bx - ax; // Higher x first (right side)
          return by - ay; // Then higher y
        });
  
        const rightmostKey = sorted[0]; // e.g., "1-4" for right side, position 4
        const rightmostSlot = slotMap[rightmostKey];
        if (rightmostSlot) {
          rightmostSlot.focus();
          return;
        }
      }
    }
  
    if (e.ctrlKey && e.key === "ArrowRight") {
      e.preventDefault();
      // Ø column is inputRefs[row][1]
      inputRefs.current[row]?.[1]?.focus();
      return;
    }
  
    // Final fallback (optional)
    if (e.key === "ArrowLeft") {
      inputRefs.current[row]?.[0]?.focus(); // Shape column
    } else if (e.key === "ArrowRight") {
      inputRefs.current[row]?.[1]?.focus(); // Ø column
    }
  };

  const handleKeyCustom = (
    e: React.KeyboardEvent<HTMLInputElement>,
    row: number,
    key: string
  ) => {
    if (e.ctrlKey && e.key === "ArrowLeft") {
      handleShapeKeyDown(e, row, key);
    }
    else {
      handleKeyDown(e, row, key as unknown as number);
    }
  }

  useEffect(() => {
    if (mode === "update" && initialTable) {
      setExistingTable({
        ...initialTable,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
  
      // 🧠 Parse inputs=... from existing shapes
      initialTable.rows.forEach((row, i) => {
        if (!row.oblikIMere) return;
        const parsedInputs = parseInputValues(row.oblikIMere);
        Object.entries(parsedInputs).forEach(([key, val]) => {
          setInputValue(i, key, val);
        });
      });
    }
  }, [initialTable]);

  useEffect(() => {
    EmailService.isSuperAdmin(userEmail).then(res => {
      if (!res) router.replace("/dashboard");
      markAsSuperAdmin(true);
    });
  }, [userEmail]);

  const handleSave = async () => {
    try {
      const rows = await handleSaveHook(); // renamed for clarity
      await onSave(table.name, rows);
      setSavedStatus(true);
      if (mode === "create") resetEditor();
      router.replace("/dashboard");
    } catch (err) {
      console.error("Error saving table:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isSuperAdmin) return null;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <PrettyInput
          type="text"
          value={table.name}
          onChange={e => updateName(e.target.value)}
          className="w-xl font-semibold text-start"
        />
        <div className="flex gap-2 w-5xl justify-end">
          {onCancel && (
            <PrettyButton color="red" onClick={onCancel}>Discard</PrettyButton>
          )}
          <PrettyButton onClick={handleSave} loading={isSaving}>
            {saved ? "Saved" : "Save"}
          </PrettyButton>
        </div>
      </div>

      <table
        className="w-full border border-gray-300"
        style={{ display: 'grid', gridTemplateColumns: '1fr 3fr 1fr 1fr 1fr 1fr 1fr' }}
      >
        <thead className="bg-gray-500 text-sm" style={{ display: 'contents' }}>
          <tr style={{ display: 'contents' }}>
            <th className="p-2 border">ozn</th>
            <th className="p-2 border">oblik i mere</th>
            <th className="p-2 border">Ø</th>
            <th className="p-2 border">lg</th>
            <th className="p-2 border">n</th>
            <th className="p-2 border">lgn</th>
            <th className="p-2 border"></th>
          </tr>
        </thead>
        <tbody style={{ display: 'contents' }}>
          {table.rows.map((row, index) => (
            <tr key={index} style={{ display: 'contents' }}>
              <td className="border px-2 py-1 text-center">{index + 1}</td>

              <td className="border px-2 py-1">
                {row.oblikIMere ? (
                  <div
                    className="flex justify-center items-center cursor-pointer"
                    onClick={() => setPickingRowIndex(index)}
                  >
                    {(() => {
                      const shapeType = row.oblikIMere.split(';')[0] as ShapeType;
                      const parsed = parseGeneralConfig(row.oblikIMere);

                      const squareProps = shapeType === 'SquareWithTail' ? parsed as SquareWithTailProps : {};
                      const lineProps = shapeType === 'Line' ? parsed as LineShapeProps : {};
                      const connectedProps = shapeType === 'ConnectingLines' ? parsed as ConnectedLinesShapeProps : {};

                      return (
                        <ShapeCanvas
                          shapeType={shapeType}
                          mode="input"
                          squareProps={squareProps}
                          lineProps={lineProps}
                          connectedProps={connectedProps}
                          selectedCoords={shapeOptions.find(s => s.configuration === row.oblikIMere)?.selectedCoords ?? []}
                          onToggleCoord={() => {}}
                          width={200}
                          height={200}
                          rowIndex={index}
                          handleShapeKeyDown={handleShapeKeyDown}
                          setShapeInputRef={setShapeInputRef}
                          rowInputs={rowInputs}
                          setInputValue={setInputValue}
                        />
                      );
                    })()}
                  </div>
                ) : (
                  <PrettyButton
                    color="blue"
                    className="w-full"
                    onClick={() => setPickingRowIndex(index)}
                  >
                    Choose
                  </PrettyButton>
                )}
              </td>

              <td className="border px-2 py-1">
                <PrettyInput
                  type="number"
                  value={row.diameter ?? ""}
                  onChange={e => updateRow(index, "diameter", e.target.value)}
                  ref={el => { if (!inputRefs.current[index]) inputRefs.current[index] = []; inputRefs.current[index][1] = el!; }}
                  onKeyDown={e => handleKeyCustom(e, index, '1')}
                />
              </td>
              <td className="border px-2 py-1">
                <PrettyInput
                  type="number"
                  value={row.lg ?? ""}
                  onChange={e => updateRow(index, "lg", e.target.value)}
                  ref={el => { if (!inputRefs.current[index]) inputRefs.current[index] = []; inputRefs.current[index][2] = el!; }}
                  onKeyDown={e => handleKeyCustom(e, index, '2')}
                />
              </td>
              <td className="border px-2 py-1">
                <PrettyInput
                  type="number"
                  value={row.n ?? ""}
                  onChange={e => updateRow(index, "n", e.target.value)}
                  ref={el => { if (!inputRefs.current[index]) inputRefs.current[index] = []; inputRefs.current[index][3] = el!; }}
                  onKeyDown={e => handleKeyCustom(e, index, '3')}
                />
              </td>
              <td className="border px-2 py-1">
                <PrettyInput
                  type="number"
                  value={row.lgn ?? ""}
                  onChange={e => updateRow(index, "lgn", e.target.value)}
                  ref={el => { if (!inputRefs.current[index]) inputRefs.current[index] = []; inputRefs.current[index][4] = el!; }}
                  onKeyDown={e => handleKeyCustom(e, index, '4')}
                />
              </td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => deleteRow(index)}
                  className="w-full h-full flex items-center justify-center cursor-pointer"
                >
                  <Trash2 size={18} className="text-red-500" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <PrettyButton
        onClick={addRow}
        className="w-full mt-2 flex justify-center items-center gap-2"
        color="blue"
      >
        <PlusCircle size={18} />
      </PrettyButton>

      {/* --- Sidebar overlay --- */}
      <div className="absolute top-10 right-0 bottom-0">
        <PrettySidebar
          isOpen={pickingRowIndex !== null}
          onToggle={() => setPickingRowIndex(null)}
          toggleAsButton={true}
        >
          <h2 className="text-lg font-semibold mb-4">Choose Shape</h2>
          <div className="flex flex-col gap-4 justify-center items-center">
            {shapeOptions.map((opt) => {
              const shapeType = opt.configuration.split(";")[0] as ShapeType;
              const parsed = parseGeneralConfig(opt.configuration);
              const squareProps = shapeType === 'SquareWithTail' ? parsed as SquareWithTailProps : undefined;
              const lineProps = shapeType === 'Line' ? parsed as LineShapeProps : undefined;
              const connectedProps = shapeType === 'ConnectingLines' ? parsed as ConnectedLinesShapeProps : undefined;
              const isSelected = pickingRowIndex !== null && table.rows[pickingRowIndex]?.oblikIMere === opt.configuration;

              return (
                <ShapeCard
                  key={opt.id}
                  selected={isSelected}
                  shapeType={shapeType}
                  mode="view"
                  squareProps={squareProps}
                  lineProps={lineProps}
                  connectedProps={connectedProps}
                  selectedCoords={opt.selectedCoords}
                  onClick={() => {
                    updateRow(pickingRowIndex!, 'oblikIMere', opt.configuration);
                    opt.selectedCoords.forEach(coord => {
                      const key = `${coord.x}-${coord.y}`;
                      setInputValue(pickingRowIndex!, key, 0);
                    });
                    
                    setPickingRowIndex(null);
                  }}
                />
              );
            })}
          </div>
        </PrettySidebar>
      </div>
    </div>
  );
}

