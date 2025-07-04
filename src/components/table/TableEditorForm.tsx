'use client';

import React, { useEffect, useState } from "react";
import PrettyInput from "@/components/common/input/PrettyInput";
import PrettyButton from "@/components/common/button/PrettyButton";
import { PlusCircle, Trash2 } from "lucide-react";
import { EditableTable, useTableEditor } from "@/hooks/useTableEditor";
import { EmailService } from "@/services/email.service";
import { useRouter } from "next/navigation";
import type { ShapeConfiguration, ShapeType } from "@/models/ShapeConfiguration";
import ShapeCanvas from "../shape/ShapeCanvas";
import { TableRow } from "@/models/TableRow";
import { Table } from "@/models/Table";
import { useInputRefs } from "@/hooks/useInputRefs";
import { useShapePickerSidebar } from "@/hooks/useShapePickerSidebar";
import ShapeSearchableSidebar from "../shape/ShapeSearchableSidebar";

interface TableEditorFormProps {
  mode: 'create' | 'update';
  onSave: (
    table: EditableTable,
    rows: Omit<TableRow, 'id' | 'createdAt' | 'updatedAt'>[]
  ) => Promise<void>;
  onCancel?: () => void;
  initialTable?: Table & { rows: Omit<TableRow, 'id' | 'createdAt' | 'updatedAt'>[] };
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
    updateTableField,
    groupingByPosition,
    isSaving,
    setSaving,
    saved,
    setSavedStatus,
    isSuperAdmin,
    markAsSuperAdmin,
    addRow,
    deleteRow,
    updateRow,
    updatePositionForGroup,
    resetEditor,
    handleSave: handleSaveHook
  } = useTableEditor({  initialTable,
    initialImportedRows: importedRows});

  const [editedPositions, setEditedPositions] = useState<Record<string, string>>({});
  
  const {
    setTableRef,
    handleTableKeyDown,

    handleShapeKeyDown,
    setShapeRef,

    rowInputs,
    setInputValue,
    renameRowKey
  } = useInputRefs(groupingByPosition, shapeOptions);

  const shapeSidebar = useShapePickerSidebar();

  useEffect(() => {
    EmailService.isSuperAdmin(userEmail).then(res => {
      if (!res) router.replace("/dashboard");
      markAsSuperAdmin(true);
    });
  }, [userEmail]);

  const handleSave = async () => {
    try {
      const rows = await handleSaveHook(rowInputs); // renamed for clarity
      await onSave({ ...table, updatedAt: new Date() }, rows);
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
    <>
    <div className="p-8 max-w-6xl mx-auto">
      {/* Metadata input fields */}
      <div className="grid grid-cols-3 gap-4 mb-4 max-w-6xl">
        <PrettyInput
          value={table.client || ""}
          onChange={(e) => updateTableField("client", e.target.value)}
          placeholder="Klijent"
        />
        <PrettyInput
          value={table.address || ""}
          onChange={(e) => updateTableField("address", e.target.value)}
          placeholder="Adresa"
        />
        <PrettyInput
          value={table.job || ""}
          onChange={(e) => updateTableField("job", e.target.value)}
          placeholder="Gradiliste"
        />
      </div>
      <div className="flex justify-between items-center mb-4">
        <PrettyInput
          type="text"
          value={table.name}
          onChange={e => updateTableField("name", e.target.value)}
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
      {
        groupingByPosition.map(({ position, rows, positionIndex }) => (
          <div key={position} className="mb-6">
            <input
                className="border-white border-2 text-lg font-bold mb-2 bg-transparent rounded focus:border-2 hover:border-2 p-0 m-0 focus:outline-none focus:border-blue-400 hover:bg-white hover:cursor-text transition focus:bg-white hover:border-gray-300"
                style={{
                  width: `${Math.min((editedPositions[position] ?? position).length + 1, 60)}ch`
                }}
                value={editedPositions[position] ?? position}
                onChange={(e) =>
                  setEditedPositions((prev) => ({ ...prev, [position]: e.target.value }))
                }
              />

              {editedPositions[position] !== undefined &&
                editedPositions[position] !== position && (
                  <div className="inline-flex items-center gap-1">
                    <PrettyButton
                      color="green"
                      className="w-8 h-8 p-1 text-green-600 hover:text-white"
                      onClick={() => {
                        const newVal = editedPositions[position];
                        setEditedPositions((prev) => {
                          const updated = { ...prev };
                          delete updated[position];
                          return updated;
                        });

                        updatePositionForGroup(position, newVal);
                      }}
                    >
                      ✔
                    </PrettyButton>

                    <PrettyButton
                      color="red"
                      className="w-8 h-8 p-1"
                      onClick={() =>
                        setEditedPositions((prev) => {
                          const updated = { ...prev };
                          delete updated[position];
                          return updated;
                        })
                      }
                    >
                      X
                    </PrettyButton>
                  </div>
                )}
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
                {rows.map((row, index) => (
                  <tr key={index} style={{ display: 'contents' }}>
                    <td className="flex border px-2 py-1">
                      <PrettyInput
                        type="text"
                        value={row.ozn ?? ""}
                        onChange={e => {
                          const newOzn = e.target.value.trim();
                          const oldKey = `${position}-${index}-${row.ozn}`;
                          const newKey = `${position}-${index}-${newOzn}`;
                          renameRowKey(oldKey, newKey);   // from useInputRefs
                          updateRow(position, index, { ozn: newOzn });  // from useTableEditor
                        }}
                        ref={(el) => setTableRef(position, index, 0, el!)}
                        onKeyDown={(e) => handleTableKeyDown(e, positionIndex, index, 0, groupingByPosition.length)}
                      />
                    </td>

                    <td className="border px-2 py-1">
                      {row.oblikIMere ? (
                        <div
                          className="flex justify-center items-center cursor-pointer"
                          onClick={() => {
                            if(row.oblikIMere.startsWith("extracted_shapes")) return;
                          }}
                        >
                          {
                            row.oblikIMere?.startsWith("extracted_shapes") ?
                            (
                              <div className="w-full flex justify-center items-center">
                                <img
                                  src={`${process.env.NEXT_PUBLIC_FLASK_API ?? ""}${row.oblikIMere}`}
                                  alt="Shape image"
                                  className="max-h-[80px] object-contain"
                                />
                              </div>
                            )

                            :
               
                            (() => {
                              return (
                                <ShapeCanvas
                                  mode="input"
                                  onToggleCoord={() => {}}
                                  width={320}
                                  height={100}
                                  rowIndex={index}
                                  position={position}
                                  handleShapeKeyDown={handleShapeKeyDown}
                                  setShapeInputRef={setShapeRef}
                                  rowInputs={rowInputs}
                                  ozn={row.ozn}
                                  setInputValue={setInputValue}
                                  rawConfig={row.oblikIMere}
                                />);
                            })()
                          }
                        </div>
                      ) : (
                        <PrettyButton
                          color="blue"
                          className="w-full"
                          onClick={() => {
                            shapeSidebar.openForRow(index, position, row.ozn);
                          }}
                        >
                          Choose
                        </PrettyButton>
                      )}
                    </td>

                    <td className="flex border px-2 py-1">
                      <PrettyInput
                        type="number"
                        value={row.diameter ?? ""}
                        onChange={e => updateRow(position, index, { diameter: parseFloat(e.target.value?.trim() || '0') })}
                        ref={(el) => setTableRef(position, index, 1, el!)}
                        onKeyDown={(e) => handleTableKeyDown(e, positionIndex, index, 1, groupingByPosition.length)}
                      />
                    </td>
                    <td className="flex border px-2 py-1">
                      <PrettyInput
                        type="number"
                        value={row.lg ?? ""}
                        onChange={e => updateRow(position, index, { lg: parseFloat(e.target.value?.trim() || '0') })}
                        ref={(el) => setTableRef(position, index, 2, el!)}
                        onKeyDown={(e) => handleTableKeyDown(e, positionIndex, index, 2, groupingByPosition.length)}
                      />
                    </td>
                    <td className="flex border px-2 py-1">
                      <PrettyInput
                        type="number"
                        value={row.n ?? ""}
                        onChange={e => updateRow(position, index, { n: parseFloat(e.target.value?.trim() || '0') })}
                        ref={(el) => setTableRef(position, index, 3, el!)}
                        onKeyDown={(e) => handleTableKeyDown(e, positionIndex, index, 3, groupingByPosition.length)}
                      />
                    </td>
                    <td className="flex border px-2 py-1">
                      <PrettyInput
                        type="number"
                        value={row.lgn ?? ""}
                        onChange={e => updateRow(position, index, { lgn: parseFloat(e.target.value?.trim() || '0') })}
                        ref={(el) => setTableRef(position, index, 4, el!)}
                        onKeyDown={(e) => handleTableKeyDown(e, positionIndex, index, 4, groupingByPosition.length)}
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <button
                        onClick={() => deleteRow(position, index)}
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
              onClick={() => addRow(position)}
              className="w-full mt-2 flex justify-center items-center gap-2"
              color="green"
            >
              <PlusCircle size={18} />
            </PrettyButton>
          </div>
        ))
      }

      <PrettyButton
        onClick={() => addRow()}
        className="w-full mt-2 flex justify-center items-center gap-2"
        color="blue"
      >
        <PlusCircle size={18} />
      </PrettyButton>
    </div>
    <ShapeSearchableSidebar
      isOpen={shapeSidebar.isOpen}
      onToggle={shapeSidebar.close}
      onSelectShape={(shape) => {
        shapeSidebar.handleShapeSelected(
          shape,
          updateRow
        );

        shape.selectedCoords.forEach(({ x, y }) => {
          setInputValue(shapeSidebar.ozn!, shapeSidebar.position!, shapeSidebar.rowIndex!, `${x}-${y}`, 0);
        });
      }}
    />
      </>
  );
}

