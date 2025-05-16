'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TableEditorForm from "@/components/table/TableEditorForm";
import { TableService } from "@/services/table.service";
import { ConfigurationService } from "@/services/configuration.service";
import { ShapeConfiguration } from "@/models/ShapeConfiguration";
import { TableRow } from "@/models/TableRow";

export default function TableCreateContent() {
  const { data: session } = useSession();
  const [shapeOptions, setShapeOptions] = useState<ShapeConfiguration[] | null>(null);

  const searchParams = useSearchParams();

  const [importedRows, setImportedRows] = useState<TableRow[] | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("imported_table_data");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      sessionStorage.removeItem("imported_table_data");

      const flatRows = !Array.isArray(parsed)
        ? Object.entries(parsed).flatMap(([position, rows]) =>
            (rows as any[]).map((row) => ({ ...row, position }))
          )
        : parsed;

      setImportedRows(flatRows);
    } catch (err) {
      console.error("Failed to parse imported data", err);
    }
  }, []);

  useEffect(() => {
    if (!session?.user?.email) return;
    ConfigurationService.getAll().then(setShapeOptions);
  }, [session]);

  if (!session?.user?.email || shapeOptions === null) return null;

  return (
    <TableEditorForm
      mode="create"
      userEmail={session.user.email}
      importedRows={importedRows || undefined}
      shapeOptions={shapeOptions}
      onSave={async (table, rows) => {
        await TableService.createTableWithRows(table, rows);
      }}
      onCancel={() => window.history.back()}
    />
  );
}
